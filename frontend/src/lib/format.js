/** Two-letter monogram: "Ananya Rao" → "AR", "Meera" → "ME". */
export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Human-friendly phone grouping. Falls back to the digits as stored. */
export function formatPhone(raw = '') {
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return '—'

  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits[0]} ${digits.slice(1, 6)} ${digits.slice(6)}`
  }
  return String(raw).trim().startsWith('+') ? `+${digits}` : digits
}

/** "3 days ago" style label, used only in the stat strip. */
export function addedThisWeek(rows) {
  const cutoff = Date.now() - 7 * 86400000
  return rows.filter((r) => new Date(r.createdAt).getTime() >= cutoff).length
}
