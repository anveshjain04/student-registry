import { AlertIcon, CheckIcon } from './icons.jsx'

export default function Toast({ toast }) {
  if (!toast) return null

  return (
    <div className={`toast${toast.tone === 'error' ? ' toast--error' : ''}`} role="status" aria-live="polite">
      {toast.tone === 'error' ? <AlertIcon /> : <CheckIcon />}
      <span>{toast.message}</span>
    </div>
  )
}
