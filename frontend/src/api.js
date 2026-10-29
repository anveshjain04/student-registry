/**
 * Thin fetch wrapper around the Spring Boot API.
 *
 * Base URL resolution:
 *   - dev  → "/api" (Vite proxies to localhost:8080)
 *   - prod → VITE_API_BASE_URL, or "/api" when nginx proxies it for you
 */

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

/** The server could not be reached at all (network error / connection refused). */
export class ApiUnavailableError extends Error {
  constructor() {
    super('The API is unreachable')
    this.name = 'ApiUnavailableError'
  }
}

/** The server answered, but with a non-2xx status. */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function parse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiUnavailableError()
  }

  if (response.status === 204) return null

  const raw = await response.text()
  const payload = raw ? parse(raw) : null

  if (!response.ok) {
    throw new ApiError(payload?.message || `Request failed with status ${response.status}`, {
      status: response.status,
      fieldErrors: payload?.fieldErrors ?? {},
    })
  }

  return payload
}

export const api = {
  list: () => request('/students'),
  create: (payload) => request('/students', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/students/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => request(`/students/${id}`, { method: 'DELETE' }),
}
