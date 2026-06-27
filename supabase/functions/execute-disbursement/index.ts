type JsonRecord = Record<string, unknown>

type PayrollItem = {
  id: string
  net_amount: number | string
  status: string
  employees?: {
    id: string
    full_name: string
    phone: string
    payment_method: string
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const moolreBaseUrl = trimTrailingSlash(Deno.env.get('MOOLRE_BASE_URL') || 'https://sandbox.moolre.com')
  const moolreApiUser = Deno.env.get('MOOLRE_API_USER')
  const moolreApiKey = Deno.env.get('MOOLRE_API_KEY')
  const moolreAccountNumber = Deno.env.get('MOOLRE_ACCOUNT_NUMBER')
  const moolreCurrency = Deno.env.get('MOOLRE_CURRENCY') || 'GHS'
  const moolreDefaultChannel = Deno.env.get('MOOLRE_DEFAULT_CHANNEL') || '1'
  const moolreBankSublistId = Deno.env.get('MOOLRE_BANK_SUBLIST_ID')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ message: 'Missing Supabase function secrets.' }, 500)
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization) {
    return json({ message: 'Missing Authorization header.' }, 401)
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: authorization,
    },
  })

  if (!userResponse.ok) {
    return json({ message: 'Invalid Supabase session.' }, 401)
  }

  const body = (await request.json().catch(() => ({}))) as JsonRecord
  const payrollRunId = body.payrollRunId
  const disbursementBatchId = body.disbursementBatchId

  if (typeof payrollRunId !== 'string' || typeof disbursementBatchId !== 'string') {
    return json({ message: 'payrollRunId and disbursementBatchId are required.' }, 400)
  }

  const batch = await rest<JsonRecord[]>(
    supabaseUrl,
    serviceRoleKey,
    `disbursement_batches?id=eq.${encodeURIComponent(disbursementBatchId)}&payroll_run_id=eq.${encodeURIComponent(payrollRunId)}&select=id,total_amount,status`,
  )

  if (!batch.ok || !batch.data?.[0]) {
    return json({ message: 'Disbursement batch was not found.' }, 404)
  }

  const hasMoolreConfig = Boolean(moolreApiUser && moolreAccountNumber && (isSandboxMoolre(moolreBaseUrl) || moolreApiKey))

  if (hasMoolreConfig) {
    const items = await rest<PayrollItem[]>(
      supabaseUrl,
      serviceRoleKey,
      `payroll_items?payroll_run_id=eq.${encodeURIComponent(payrollRunId)}&status=neq.Blocked&select=id,net_amount,status,employees(id,full_name,phone,payment_method)`,
    )

    if (!items.ok) {
      return json({ message: 'Unable to load payroll recipients.' }, 500)
    }

    if (!items.data?.length) {
      return json({ message: 'No payable payroll recipients were found for this run.' }, 400)
    }

    const transfers = []

    for (const item of items.data) {
      const employee = item.employees
      const amount = Number(item.net_amount)

      if (!employee?.phone || !Number.isFinite(amount) || amount <= 0) {
        await updateBatch(supabaseUrl, serviceRoleKey, disbursementBatchId, 'Failed')
        return json({ message: `Invalid payout data for payroll item ${item.id}.` }, 400)
      }

      const channel = channelForEmployee(employee.payment_method, moolreDefaultChannel)
      const externalref = `${disbursementBatchId}-${item.id}`.slice(0, 100)
      const response = await fetch(`${moolreBaseUrl}/open/transact/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-USER': moolreApiUser || '',
          ...(moolreApiKey ? { 'X-API-KEY': moolreApiKey } : {}),
        },
        body: JSON.stringify({
          type: 1,
          channel,
          currency: moolreCurrency,
          amount: amount.toFixed(2),
          receiver: normalizeReceiver(employee.phone),
          ...(channel === '2' && moolreBankSublistId ? { sublistid: moolreBankSublistId } : {}),
          externalref,
          reference: `AutoPay payroll ${payrollRunId}`,
          accountnumber: moolreAccountNumber,
        }),
      })

      const payload = (await response.json().catch(() => null)) as JsonRecord | null
      const providerStatus = payload?.status

      if (!response.ok || String(providerStatus) !== '1') {
        await updateBatch(supabaseUrl, serviceRoleKey, disbursementBatchId, 'Failed')
        return json({
          message: `Moolre transfer failed for ${employee.full_name}.`,
          providerStatus: response.status,
          providerResponse: payload,
        }, 502)
      }

      transfers.push({
        employeeId: employee.id,
        payrollItemId: item.id,
        externalref,
        providerTransactionId: (payload?.data as JsonRecord | undefined)?.transactionid,
      })
    }
  }

  await updateBatch(supabaseUrl, serviceRoleKey, disbursementBatchId, 'Submitted')

  return json({
    status: hasMoolreConfig ? 'Submitted to Moolre' : 'Submitted in sandbox',
    disbursementBatchId,
    provider: 'Moolre',
  })
})

async function rest<T>(supabaseUrl: string, serviceRoleKey: string, path: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  })

  return {
    ok: response.ok,
    data: (await response.json().catch(() => null)) as T | null,
  }
}

async function updateBatch(supabaseUrl: string, serviceRoleKey: string, batchId: string, status: 'Submitted' | 'Failed') {
  await fetch(`${supabaseUrl}/rest/v1/disbursement_batches?id=eq.${encodeURIComponent(batchId)}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      status,
      submitted_at: status === 'Submitted' ? new Date().toISOString() : null,
    }),
  })
}

function json(payload: JsonRecord, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function normalizeReceiver(value: string) {
  return value.replace(/[^\d+]/g, '')
}

function channelForEmployee(paymentMethod: string, defaultChannel: string) {
  if (paymentMethod === 'Bank Transfer') return '2'
  return defaultChannel
}

function isSandboxMoolre(baseUrl: string) {
  return baseUrl.includes('sandbox.moolre.com')
}
