import { useEffect, useRef } from 'react'

export default function ConfirmDialog({ student, busy, onCancel, onConfirm }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!student) return undefined

    cancelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [student, busy, onCancel])

  if (!student) return null

  return (
    <div
      className="scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">Delete this record?</h3>
        <p>
          <strong>{student.fullName}</strong> ({student.studentId}) will be removed from the
          register. This cannot be undone.
        </p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel} disabled={busy} ref={cancelRef}>
            Keep record
          </button>
          <button type="button" className="btn btn--danger btn--sm" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
