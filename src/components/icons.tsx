import type { ReactElement, SVGProps } from 'react'

export type IconComponent = (props: SVGProps<SVGSVGElement> & { size?: number }) => ReactElement

const paths: Record<string, string[]> = {
  activity: ['M4 12h4l2-7 4 14 2-7h4'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  briefcase: ['M9 6V4h6v2', 'M4 7h16v11H4z', 'M4 12h16'],
  calendar: ['M7 3v4', 'M17 3v4', 'M4 8h16', 'M5 5h14v15H5z'],
  check: ['M5 12l4 4L19 6'],
  down: ['M6 9l6 6 6-6'],
  right: ['M9 6l6 6-6 6'],
  dollar: ['M12 3v18', 'M16 7.5c-1-1-3-1.5-4-1.5-2 0-4 .9-4 2.8 0 4.4 8 2 8 6.4 0 1.9-2 2.8-4 2.8-1.5 0-3.2-.5-4.5-1.7'],
  clipboard: ['M8 5h8v4H8z', 'M6 7H5v13h14V7h-1', 'M9 13h6', 'M9 17h6'],
  download: ['M12 4v11', 'M7 10l5 5 5-5', 'M5 20h14'],
  file: ['M7 3h7l4 4v14H7z', 'M14 3v5h5', 'M9 13h6', 'M9 17h5'],
  filter: ['M4 6h16', 'M7 12h10', 'M10 18h4'],
  gauge: ['M4 14a8 8 0 1 1 16 0', 'M12 14l4-4', 'M8 18h8'],
  home: ['M4 11l8-7 8 7', 'M6 10v10h12V10', 'M10 20v-6h4v6'],
  landmark: ['M4 9h16', 'M6 9V7l6-3 6 3v2', 'M7 10v7', 'M12 10v7', 'M17 10v7', 'M5 19h14'],
  layout: ['M4 5h7v7H4z', 'M13 5h7v7h-7z', 'M4 14h7v5H4z', 'M13 14h7v5h-7z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  phone: ['M8 3h8v18H8z', 'M11 18h2'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15', 'M16 16l5 5'],
  settings: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8', 'M3 12h3', 'M18 12h3', 'M12 3v3', 'M12 18v3', 'M5 5l2 2', 'M17 17l2 2', 'M19 5l-2 2', 'M7 17l-2 2'],
  shield: ['M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z', 'M9 12l2 2 4-5'],
  sparkles: ['M12 3l1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8z', 'M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8z'],
  users: ['M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M2 20c0-4 3-6 6-6s6 2 6 6', 'M16 11a3 3 0 1 0 0-6', 'M15 14c3 .4 5 2.3 5 6'],
  wallet: ['M4 7h16v12H4z', 'M4 9l11-4v4', 'M16 13h2'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
}

function makeIcon(name: keyof typeof paths): IconComponent {
  return ({ size = 24, className, ...props }) => (
    <svg
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
      aria-hidden="true"
      {...props}
    >
      {paths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  )
}

export const Activity = makeIcon('activity')
export const Bell = makeIcon('bell')
export const BriefcaseBusiness = makeIcon('briefcase')
export const CalendarDays = makeIcon('calendar')
export const Check = makeIcon('check')
export const ChevronDown = makeIcon('down')
export const ChevronRight = makeIcon('right')
export const CircleDollarSign = makeIcon('dollar')
export const ClipboardList = makeIcon('clipboard')
export const Download = makeIcon('download')
export const FileText = makeIcon('file')
export const Filter = makeIcon('filter')
export const Gauge = makeIcon('gauge')
export const Home = makeIcon('home')
export const Landmark = makeIcon('landmark')
export const LayoutDashboard = makeIcon('layout')
export const Menu = makeIcon('menu')
export const Phone = makeIcon('phone')
export const Plus = makeIcon('plus')
export const Search = makeIcon('search')
export const Settings = makeIcon('settings')
export const ShieldCheck = makeIcon('shield')
export const Sparkles = makeIcon('sparkles')
export const Users = makeIcon('users')
export const WalletCards = makeIcon('wallet')
export const X = makeIcon('x')
