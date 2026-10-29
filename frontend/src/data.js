/**
 * Data source with a graceful degradation path.
 *
 * Everything talks to the Spring Boot API. If the API cannot be reached at
 * all, we flip into a clearly-labelled local sandbox backed by localStorage so
 * the interface stays usable (handy for design review and for demos on a
 * laptop with no backend running). It never pretends to be the real database.
 */

import { api, ApiError, ApiUnavailableError } from './api.js'

const KEY = 'registry.sandbox.v1'

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

const SEED = [
  {
    id: 1,
    studentId: 'STU-2024-001',
    rollNo: 'CS-21/047',
    fullName: 'Ananya Rao',
    email: 'ananya.rao@gmail.com',
    phone: '+919876543210',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 2,
    studentId: 'STU-2024-002',
    rollNo: 'CS-21/048',
    fullName: 'Kabir Menon',
    email: 'kabir.menon@gmail.com',
    phone: '+919820011934',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 3,
    studentId: 'STU-2024-003',
    rollNo: 'EC-22/011',
    fullName: 'Meera Iyer',
    email: 'meera.iyer@gmail.com',
    phone: '+919004587621',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
  },
  {
    id: 4,
    studentId: 'STU-2024-004',
    rollNo: 'ME-23/102',
    fullName: 'Arjun Deshmukh',
    email: 'arjun.deshmukh@gmail.com',
    phone: '+919987022456',
    createdAt: daysAgo(16),
    updatedAt: daysAgo(16),
  },
]

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted or unavailable storage — fall through to seed */
  }
  write(SEED)
  return SEED
}

function write(rows) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows))
  } catch {
    /* private mode: keep going in memory only */
  }
}

function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
}

function guardDuplicates(rows, payload, id) {
  const sameId = rows.find(
    (r) => r.studentId.toLowerCase() === payload.studentId.toLowerCase() && r.id !== id
  )
  if (sameId) {
    throw new ApiError('That student ID is already registered', {
      status: 409,
      fieldErrors: { studentId: 'This student ID is already registered' },
    })
  }

  const sameEmail = rows.find(
    (r) => r.email.toLowerCase() === payload.email.toLowerCase() && r.id !== id
  )
  if (sameEmail) {
    throw new ApiError('That email is already registered', {
      status: 409,
      fieldErrors: { email: 'This email is already registered' },
    })
  }
}

export function createDataSource() {
  let offline = false

  const enterSandbox = () => {
    offline = true
  }

  /** Run an API call; if the network is down, fall back to the sandbox once. */
  async function attempt(call, fallback) {
    if (offline) return fallback()
    try {
      return await call()
    } catch (error) {
      if (error instanceof ApiUnavailableError) {
        enterSandbox()
        return fallback()
      }
      throw error
    }
  }

  return {
    get isOffline() {
      return offline
    },

    list: () => attempt(api.list, () => read()),

    create: (payload) =>
      attempt(
        () => api.create(payload),
        () => {
          const rows = read()
          guardDuplicates(rows, payload)
          const now = new Date().toISOString()
          const row = { id: nextId(rows), ...payload, createdAt: now, updatedAt: now }
          write([...rows, row])
          return row
        }
      ),

    update: (id, payload) =>
      attempt(
        () => api.update(id, payload),
        () => {
          const rows = read()
          const index = rows.findIndex((r) => r.id === id)
          if (index === -1) throw new ApiError('That student no longer exists', { status: 404 })
          guardDuplicates(rows, payload, id)
          const updated = { ...rows[index], ...payload, updatedAt: new Date().toISOString() }
          rows[index] = updated
          write(rows)
          return updated
        }
      ),

    remove: (id) =>
      attempt(
        () => api.remove(id),
        () => {
          const rows = read()
          const next = rows.filter((r) => r.id !== id)
          if (next.length === rows.length) throw new ApiError('That student no longer exists', { status: 404 })
          write(next)
          return null
        }
      ),
  }
}
