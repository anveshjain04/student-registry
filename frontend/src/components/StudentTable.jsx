import { ArrowIcon, EditIcon, SearchIcon, TrashIcon } from './icons.jsx'
import { formatPhone, initials } from '../lib/format.js'

const COLUMNS = [
  { key: 'name', label: 'Student', sortable: true },
  { key: 'studentId', label: 'Student ID', sortable: true },
  { key: 'rollNo', label: 'Roll no.', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
]

const ariaSort = (sort, key) =>
  sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'

export default function StudentTable({
  rows,
  total,
  loading,
  query,
  onQuery,
  sort,
  onSort,
  onEdit,
  onDelete,
}) {
  return (
    <section className="panel table-panel" aria-labelledby="table-title">
      <div className="toolbar">
        <div className="search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search name, ID, roll or email…"
            aria-label="Search students"
          />
        </div>
        <h2 id="table-title" className="sr-only">
          Students
        </h2>
        <span className="toolbar__meta">
          {rows.length} of {total}
        </span>
      </div>

      {loading ? (
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {[0, 1, 2, 3].map((row) => (
                <tr key={row} className="skeleton-row">
                  <td>
                    <div className="sk sk--wide" />
                  </td>
                  <td>
                    <div className="sk sk--narrow" />
                  </td>
                  <td>
                    <div className="sk sk--narrow" />
                  </td>
                  <td>
                    <div className="sk sk--mid" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty">
          <div className="empty__ring" aria-hidden="true">
            <SearchIcon width={17} height={17} />
          </div>
          {query ? (
            <>
              <h3>No matches</h3>
              <p>
                Nothing here for “{query}”.{' '}
                <button type="button" className="link-btn" onClick={() => onQuery('')}>
                  Clear search
                </button>
              </p>
            </>
          ) : (
            <>
              <h3>Nothing here yet</h3>
              <p>Add the first student and the register starts filling in.</p>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column.key} scope="col" aria-sort={ariaSort(sort, column.key)}>
                    <button
                      type="button"
                      className="th"
                      data-active={sort.key === column.key}
                      data-dir={sort.dir}
                      onClick={() => onSort(column.key)}
                    >
                      {column.label}
                      <ArrowIcon />
                    </button>
                  </th>
                ))}
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((student) => (
                <tr key={student.id}>
                  <td className="cell-person">
                    <div className="person">
                      <span className="avatar" aria-hidden="true">
                        {initials(student.fullName)}
                      </span>
                      <div className="person__body">
                        <div className="person__name">{student.fullName}</div>
                        <a className="person__email" href={`mailto:${student.email}`}>
                          {student.email}
                        </a>
                      </div>
                    </div>
                  </td>

                  <td data-label="Student ID">
                    <span className="mono">{student.studentId}</span>
                  </td>

                  <td data-label="Roll no.">
                    <span className="mono">{student.rollNo}</span>
                  </td>

                  <td data-label="Phone">
                    <span className="mono mono--quiet">{formatPhone(student.phone)}</span>
                  </td>

                  <td className="cell-actions">
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => onEdit(student)}
                        aria-label={`Edit ${student.fullName}`}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() => onDelete(student)}
                        aria-label={`Delete ${student.fullName}`}
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
