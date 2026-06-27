import { useEffect, useState } from 'react'
import { employeeIdFromPath, pathToView, viewToPath } from '../lib/routing'
import type { View } from '../types'

export function useAppNavigation() {
  const [view, setViewState] = useState<View>(() => pathToView(window.location.pathname))
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(() => employeeIdFromPath(window.location.pathname))
  const [formEmployeeId, setFormEmployeeId] = useState(() =>
    window.location.pathname.endsWith('/edit') ? employeeIdFromPath(window.location.pathname) : '',
  )

  const setView = (nextView: View) => {
    setViewState(nextView)
    window.history.pushState({}, '', viewToPath(nextView, selectedEmployeeId))
  }

  const openEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setViewState('employee-detail')
    window.history.pushState({}, '', viewToPath('employee-detail', employeeId))
  }

  const openEmployeeForm = (employeeId?: string) => {
    setFormEmployeeId(employeeId ?? '')
    setViewState('employee-form')
    window.history.pushState({}, '', employeeId ? `/employees/${employeeId}/edit` : '/employees/new')
  }

  useEffect(() => {
    const onPopState = () => {
      const nextView = pathToView(window.location.pathname)
      const employeeId = employeeIdFromPath(window.location.pathname)

      setViewState(nextView)
      if (employeeId) setSelectedEmployeeId(employeeId)
      setFormEmployeeId(window.location.pathname.endsWith('/edit') ? employeeId : '')
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return {
    view,
    selectedEmployeeId,
    formEmployeeId,
    setView,
    openEmployee,
    openEmployeeForm,
  }
}
