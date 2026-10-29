import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import StudentForm from './components/StudentForm.jsx'
import StudentTable from './components/StudentTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import Toast from './components/Toast.jsx'
import { createDataSource } from './data.js'
import { addedThisWeek } from './lib/format.js'

const ACCESSORS = {
  name: (student) => student.fullName,
  studentId: (student) => student.studentId,
  rollNo: (student) => student.rollNo,
  phone: (student) => student.phone,
}

export default function App() {
  const store = useMemo(() => createDataSource(), [])

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const formRef = useRef(null)

  function notify(message, tone = 'ok') {
    setToast({ id: Date.now(), message, tone })
  }

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const rows = await store.list()
        if (cancelled) return
        setStudents(rows)
        setOffline(store.isOffline)
      } catch (error) {
        if (!cancelled) notify(error?.message || 'Could not load records', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [store])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = term
      ? students.filter((student) =>
          [student.fullName, student.studentId, student.rollNo, student.email, student.phone].some(
            (value) => String(value ?? '').toLowerCase().includes(term)
          )
        )
      : students

    const accessor = ACCESSORS[sort.key] ?? ACCESSORS.name
    const sorted = [...filtered].sort((a, b) =>
      String(accessor(a) ?? '').localeCompare(String(accessor(b) ?? ''), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    )

    return sort.dir === 'desc' ? sorted.reverse() : sorted
  }, [students, query, sort])

  function handleSort(key) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    )
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => document.getElementById('f-studentId')?.focus({ preventScroll: true }), 260)
  }

  function handleNewEntry() {
    setEditing(null)
    scrollToForm()
  }

  function handleEdit(student) {
    setEditing(student)
    scrollToForm()
  }

  async function handleSubmit(payload) {
    if (editing) {
      const updated = await store.update(editing.id, payload)
      setStudents((prev) => prev.map((student) => (student.id === updated.id ? updated : student)))
      setEditing(null)
      notify(`${updated.fullName} updated`)
    } else {
      const created = await store.create(payload)
      setStudents((prev) => [...prev, created])
      notify(`${created.fullName} added to the register`)
    }
    setOffline(store.isOffline)
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await store.remove(pendingDelete.id)
      setStudents((prev) => prev.filter((student) => student.id !== pendingDelete.id))
      if (editing?.id === pendingDelete.id) setEditing(null)
      notify('Record deleted')
    } catch (error) {
      notify(error?.message || 'Could not delete this record', 'error')
    } finally {
      setDeleting(false)
      setPendingDelete(null)
      setOffline(store.isOffline)
    }
  }

  return (
    <>
      <Header total={students.length} onNewEntry={handleNewEntry} />

      {offline ? (
        <div className="banner" role="status">
          <div className="shell banner__inner">
            <span className="dot" aria-hidden="true" />
            Backend not reachable — you are in a local sandbox. Entries stay in this browser
            until the API is running.
          </div>
        </div>
      ) : null}

      <main className="shell">
        <Hero total={students.length} week={addedThisWeek(students)} />

        <div className="workspace">
          <div ref={formRef}>
            <StudentForm
              key={editing ? `edit-${editing.id}` : 'new'}
              editing={editing}
              busy={loading}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          </div>

          <StudentTable
            rows={visible}
            total={students.length}
            loading={loading}
            query={query}
            onQuery={setQuery}
            sort={sort}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={setPendingDelete}
          />
        </div>

        <footer className="foot">
          <span>
            Spring Boot <i /> React <i /> MySQL / H2
          </span>
          <span>REST · /api/students</span>
        </footer>
      </main>

      <ConfirmDialog
        student={pendingDelete}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} />
    </>
  )
}
