import { useRef, useState } from 'react'

const EMPTY = { studentId: '', rollNo: '', fullName: '', email: '', phone: '' }

/** Mirrors the Bean Validation rules on StudentRequest. */
function validate(values) {
  const errors = {}
  const studentId = values.studentId.trim()
  const rollNo = values.rollNo.trim()
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()

  if (!studentId) errors.studentId = 'Student ID is required'
  else if (!/^[A-Za-z0-9][A-Za-z0-9-]{2,39}$/.test(studentId))
    errors.studentId = 'Use 3–40 letters, digits or dashes'

  if (!rollNo) errors.rollNo = 'Roll number is required'
  else if (!/^[A-Za-z0-9][A-Za-z0-9/-]{0,39}$/.test(rollNo))
    errors.rollNo = 'Letters, digits, dashes or slashes only'

  if (!fullName) errors.fullName = 'Full name is required'
  else if (fullName.length < 2) errors.fullName = 'That name looks too short'
  else if (!/^[\p{L}][\p{L} .'-]*$/u.test(fullName)) errors.fullName = 'Letters, spaces, apostrophes and hyphens only'

  if (!email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address'

  if (!phone) errors.phone = 'Phone number is required'
  else if (!/^\+?[0-9][0-9\s-]{7,18}$/.test(phone)) errors.phone = 'Enter 8–15 digits'

  return errors
}

const trimAll = (values) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))

export default function StudentForm({ editing, busy, onSubmit, onCancel }) {
  const [values, setValues] = useState(() =>
    editing
      ? {
          studentId: editing.studentId,
          rollNo: editing.rollNo,
          fullName: editing.fullName,
          email: editing.email,
          phone: editing.phone,
        }
      : EMPTY
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const inputs = useRef({})

  const isEdit = Boolean(editing)
  const disabled = submitting || busy

  function update(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    const found = validate(values)
    setErrors(found)

    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus()
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(trimAll(values))
      if (!isEdit) setValues(EMPTY)
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? {}
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
        const key = Object.keys(fieldErrors)[0]
        inputs.current[key]?.focus()
      }
      setFormError(error?.message || 'Could not save this record')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name) => ({
    id: `f-${name}`,
    name,
    value: values[name],
    onChange: (event) => update(name, event.target.value),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `e-${name}` : undefined,
    ref: (el) => {
      inputs.current[name] = el
    },
    disabled,
  })

  const Error = ({ name }) =>
    errors[name] ? (
      <span className="field__error" id={`e-${name}`}>
        {errors[name]}
      </span>
    ) : null

  return (
    <section className="panel form-panel" aria-labelledby="form-title">
      <div className="form-panel__head">
        <h2 id="form-title">{isEdit ? 'Edit record' : 'New entry'}</h2>
        {isEdit ? <span className="chip">Editing</span> : null}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field-row">
          <div className={`field field--mono${errors.studentId ? ' field--error' : ''}`}>
            <label htmlFor="f-studentId">Student ID</label>
            <input {...field('studentId')} placeholder="STU-2024-001" autoComplete="off" spellCheck="false" />
            <Error name="studentId" />
          </div>

          <div className={`field field--mono${errors.rollNo ? ' field--error' : ''}`}>
            <label htmlFor="f-rollNo">Roll number</label>
            <input {...field('rollNo')} placeholder="CS-21/047" autoComplete="off" spellCheck="false" />
            <Error name="rollNo" />
          </div>
        </div>

        <div className={`field${errors.fullName ? ' field--error' : ''}`}>
          <label htmlFor="f-fullName">Full name</label>
          <input {...field('fullName')} placeholder="Ananya Rao" autoComplete="name" />
          <Error name="fullName" />
        </div>

        <div className={`field${errors.email ? ' field--error' : ''}`}>
          <label htmlFor="f-email">Email</label>
          <input {...field('email')} type="email" placeholder="ananya@gmail.com" autoComplete="email" spellCheck="false" />
          <Error name="email" />
        </div>

        <div className={`field${errors.phone ? ' field--error' : ''}`}>
          <label htmlFor="f-phone">Phone</label>
          <input {...field('phone')} type="tel" placeholder="+91 98765 43210" autoComplete="tel" />
          <Error name="phone" />
        </div>

        {formError ? (
          <p className="field__error" role="alert" style={{ marginTop: 4 }}>
            {formError}
          </p>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary btn--block" disabled={disabled}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add student'}
          </button>
          {isEdit ? (
            <button type="button" className="link-btn" onClick={onCancel} disabled={disabled}>
              Cancel
            </button>
          ) : null}
        </div>

        <p className="form-note">
          Student ID and email must be unique. Entries are written to the Spring Boot API and
          persisted in the database.
        </p>
      </form>
    </section>
  )
}
