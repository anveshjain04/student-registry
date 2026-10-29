export default function Hero({ total, week }) {
  return (
    <section className="hero" id="top">
      <div>
        <p className="eyebrow">Student registry</p>
        <h1 className="title">
          Every student,
          <br />
          <em>one</em> clean record.
        </h1>
        <p className="lede">
          Names, student IDs, roll numbers and reachable contact details — entered once,
          searchable in a keystroke. No spreadsheets, no duplicated rows.
        </p>
      </div>

      <dl className="stats">
        <div className="stat">
          <dt>On record</dt>
          <dd>{total}</dd>
        </div>
        <div className="stat">
          <dt>Added this week</dt>
          <dd>{week}</dd>
        </div>
      </dl>
    </section>
  )
}
