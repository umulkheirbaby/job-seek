import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import { getAdminDashboard } from './services/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getAdminDashboard();
        if (!cancelled) {
          setStats(result.data.stats);
          setSuccess(result.message);
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

  return (
    <section className="page page--wide">
      <p className="eyebrow">EmpoweWithIT admin</p>
      <h1>Programme dashboard</h1>
      <p className="lede">
        Watch the path from registered talent and verified employers through applications, interviews,
        and placements.
      </p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      {loading && <p className="status-note">Loading programme statistics…</p>}

      {stats && (
        <>
          <div className="status-grid">
            <article className="card">
              <p className="card__label">Total users</p>
              <p className="card__value">{stats.users.total}</p>
              <p>{stats.users.active} active · {stats.users.suspended} suspended</p>
            </article>
            <article className="card">
              <p className="card__label">Job seekers</p>
              <p className="card__value">{stats.users.jobSeekers}</p>
              <p>
                {stats.users.verifiedJobSeekers} verified · {stats.users.pendingJobSeekers} pending
              </p>
            </article>
            <article className="card">
              <p className="card__label">Employers</p>
              <p className="card__value">{stats.employers.total}</p>
              <p>{stats.employers.approved} verified · {stats.employers.pending} pending</p>
            </article>
            <article className="card">
              <p className="card__label">Pending employers</p>
              <p className="card__value">{stats.employers.pending}</p>
              <p>Companies waiting for EmpoweWithIT review.</p>
            </article>
            <article className="card">
              <p className="card__label">Pending jobs</p>
              <p className="card__value">{stats.jobs.pending}</p>
              <p>{stats.jobs.published} live · {stats.jobs.remote} remote</p>
            </article>
            <article className="card">
              <p className="card__label">Applications</p>
              <p className="card__value">{stats.applications.total}</p>
              <p>{stats.applications.interview} interviews · {stats.applications.placements} placements</p>
            </article>
            <article className="card">
              <p className="card__label">Interviews</p>
              <p className="card__value">{stats.applications.interview}</p>
              <p>Candidates currently at interview.</p>
            </article>
            <article className="card">
              <p className="card__label">Placements</p>
              <p className="card__value">{stats.applications.placements}</p>
              <p>Applications marked hired.</p>
            </article>
          </div>

          <div className="hero-actions">
            <Link className="button" to="/admin/job-seekers">
              Review job seekers
            </Link>
            <Link className="button button--ghost" to="/admin/employers">
              Review employers
            </Link>
            <Link className="button button--ghost" to="/admin/jobs">
              Review jobs
            </Link>
            <Link className="button button--ghost" to="/admin/users">
              Manage users
            </Link>
            <Link className="button button--ghost" to="/admin/applications">
              Monitor placements
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
