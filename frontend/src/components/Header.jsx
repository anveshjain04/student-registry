import { PlusIcon } from './icons.jsx'

export default function Header({ total, onNewEntry }) {
  return (
    <header className="rail">
      <div className="shell rail__inner">
        <a className="brand" href="#top" aria-label="Registry home">
          <span className="brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="brand__name">Registry</span>
          <span className="brand__tag">Student records</span>
        </a>

        <div className="rail__right">
          <span className="rail__count">
            <b>{total}</b> {total === 1 ? 'record' : 'records'}
          </span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onNewEntry}>
            <PlusIcon width={14} height={14} />
            New entry
          </button>
        </div>
      </div>
    </header>
  )
}
