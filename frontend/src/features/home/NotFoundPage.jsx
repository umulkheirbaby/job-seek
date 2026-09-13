import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page">
      <p className="eyebrow">404</p>
      <h1>This page is not here.</h1>
      <p className="lede">The route you opened is not part of Sprint 1.</p>
      <Link className="button" to="/">
        Back to home
      </Link>
    </section>
  );
}
