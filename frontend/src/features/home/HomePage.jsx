import { Link } from 'react-router-dom';
import { homeLabelFor, homePathFor } from '../auth/homePath';
import { useApp } from '../../store/AppContext';

export default function HomePage() {
  const { user } = useApp();
  const nextPath = homePathFor(user);

  return (
    <section className="page">
      <p className="eyebrow">Empower</p>
      <h1>Connect trained talent with real work.</h1>
      <p className="lede">
        A digital employment linkage platform for youth, refugees, and job seekers in North Eastern
        Kenya — and the employers, including international remote-work partners, who can hire them.
      </p>

      <div className="hero-actions">
        <Link className="button" to={user ? nextPath : '/status'}>
          {homeLabelFor(user)}
        </Link>
        {!user && (
          <Link className="button button--ghost" to="/register">
            Create an account
          </Link>
        )}
      </div>

      <div className="status-grid">
        <article className="card">
          <p className="card__label">Job seekers</p>
          <p>Build a skills profile, browse remote and local jobs, and track applications.</p>
        </article>
        <article className="card">
          <p className="card__label">Employers</p>
          <p>Create a company profile, post roles, and review verified candidates.</p>
        </article>
        <article className="card">
          <p className="card__label">ILO / partners</p>
          <p>Approve employers and jobs, then follow the path from training to placement.</p>
        </article>
      </div>
    </section>
  );
}
