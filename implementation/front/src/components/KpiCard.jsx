export default function KpiCard({ title, value, text }) {
  return (
    <article className="card kpi">
      <p>{title}</p>
      <strong>{value}</strong>
      <span className="delta">{text}</span>
    </article>
  );
}
