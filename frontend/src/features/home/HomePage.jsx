import { Link } from 'react-router-dom';
import { homeLabelFor, homePathFor } from '../auth/homePath';
import { useApp } from '../../store/AppContext';

export default function HomePage() {
  const { user } = useApp();
  const nextPath = homePathFor(user);

  return (
    <section className="page page--wide">
      <div className="hero-split">
        <div>
          <p className="eyebrow">Empower</p>
          <h1>Connect trained talent with real work.</h1>
          <p className="lede">
            A digital employment linkage platform for youth, refugees, and job seekers in North Eastern
            Kenya — and the employers, including international remote-work partners, who can hire them.
          </p>

          <div className="hero-actions">
            <Link className="button" to={user ? nextPath : '/jobs'}>
              {user ? homeLabelFor(user) : 'Browse jobs'}
            </Link>
            {!user && (
              <Link className="button button--ghost" to="/register">
                Create an account
              </Link>
            )}
          </div>
        </div>
        <img className="hero-split__image" src="/job.jpg" alt="People connecting talent with real jobs" />
      </div>

      <div className="status-grid">
        <article className="card">
          <p className="card__label">Job seekers</p>
          <p>Build a skills profile. EmpoweWithIT verifies you before you can apply for jobs.</p>
        </article>
        <article className="card">
          <p className="card__label">Employers</p>
          <p>Create a company profile, wait for verification, then post roles.</p>
        </article>
        <article className="card">
          <p className="card__label">EmpoweWithIT / partners</p>
          <p>Approve job seekers, employers, and jobs, then follow placements.</p>
        </article>
      </div>
    </section>
  );
}
