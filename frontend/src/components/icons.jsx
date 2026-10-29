/** Inline 16px stroke icons — no icon package, no runtime cost. */

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const SearchIcon = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const EditIcon = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4 16.5V20Z" />
    <path d="m14.5 6.5 3 3" />
  </svg>
)

export const TrashIcon = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="M4 7h16M9.5 7V5h5v2M6.5 7l.8 12h9.4l.8-12" />
    <path d="M10.5 11v4M13.5 11v4" />
  </svg>
)

export const CheckIcon = (p) => (
  <svg {...base} width={15} height={15} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
)

export const AlertIcon = (p) => (
  <svg {...base} width={15} height={15} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.4v.1" />
  </svg>
)

export const ArrowIcon = (p) => (
  <svg {...base} width={11} height={11} strokeWidth={2.2} {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const PeopleIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <circle cx="12" cy="9" r="3.4" />
    <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
  </svg>
)

export const CloseIcon = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
