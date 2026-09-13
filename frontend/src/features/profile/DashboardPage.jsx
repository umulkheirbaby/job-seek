import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { listApplications } from '../applications/services/applicationApi';
import { getMyProfile } from './services/profileApi';

export default function DashboardPage() {
  const { user } = useApp();
  const [payload, setPayload] = useState(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [result, applications] = await Promise.all([getMyProfile(), listApplications()]);
        if (!cancelled) {
          setPayload(result.data);
          setApplicationCount(applications.data.applications.length);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = payload?.stats;
  const profile = payload?.profile;

  return (
    <section className="page page--wide">
      <p className="eyebrow">Job seeker</p>
      <h1>Welcome, {user.name.split(' ')[0]}.</h1>
      <p className="lede">
        Complete your profile, then apply for approved jobs and track each application.
      </p>

      {loading && <p className="status-note">Loading your dashboard…</p>}
      {error && (
        <div className="banner banner--error" role="alert">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="status-grid">
            <article className="card">
              <p className="card__label">Profile completion</p>
              <p className="card__value">{stats.completion}%</p>
              <div className="meter" aria-hidden="true">
                <span style={{ width: `${stats.completion}%` }} />
              </div>
            </article>
            <article className="card">
              <p className="card__label">Skills</p>
              <p className="card__value">{stats.skills}</p>
              <p>{stats.skills ? profile.skills.join(', ') : 'Add the skills you can offer.'}</p>
            </article>
            <article className="card">
              <p className="card__label">Education</p>
              <p className="card__value">{stats.education}</p>
              <p>{stats.education ? 'Qualifications on your profile' : 'Add your studies.'}</p>
            </article>
            <article className="card">
              <p className="card__label">Experience</p>
              <p className="card__value">{stats.experience}</p>
              <p>{stats.experience ? 'Roles on your profile' : 'Add work or volunteer history.'}</p>
            </article>
            <article className="card">
              <p className="card__label">CV</p>
              <p className={`pill ${stats.hasCv ? 'pill--ok' : 'pill--warn'}`}>
                {stats.hasCv ? 'Added' : 'Missing'}
              </p>
              <p>Store a public CV link for now.</p>
            </article>
            <article className="card">
              <p className="card__label">Portfolio</p>
              <p className={`pill ${stats.hasPortfolio ? 'pill--ok' : 'pill--warn'}`}>
                {stats.hasPortfolio ? 'Added' : 'Missing'}
              </p>
              <p>GitHub, Behance, or a personal site.</p>
            </article>
            <article className="card">
              <p className="card__label">Applications</p>
              <p className="card__value">{applicationCount}</p>
              <p>{applicationCount ? 'Track replies from employers.' : 'Apply from the jobs board.'}</p>
            </article>
          </div>

          <div className="hero-actions">
            <Link className="button" to="/profile">
              {stats.completion === 100 ? 'Edit profile' : 'Complete your profile'}
            </Link>
            <Link className="button button--ghost" to="/jobs">
              Browse jobs
            </Link>
            <Link className="button button--ghost" to="/applications">
              View applications
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
