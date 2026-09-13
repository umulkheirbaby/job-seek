import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getMyEmployer } from './services/employerApi';

const STATUS_COPY = {
  pending: 'ILO still needs to review this company before you can post jobs.',
  approved: 'Your company is verified. You can submit jobs for ILO approval.',
  rejected: 'This company was not approved. Update the profile and wait for another review.',
  suspended: 'This company is suspended and cannot post jobs.',
};

export default function EmployerDashboardPage() {
  const { user } = useApp();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getMyEmployer();
        if (!cancelled) {
          setPayload(result.data);
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
  const employer = payload?.employer;
  const status = stats?.verificationStatus || 'pending';

  return (
    <section className="page page--wide">
      <p className="eyebrow">Employer</p>
      <h1>Welcome, {user.name.split(' ')[0]}.</h1>
      <p className="lede">
        Create a company profile, then wait for ILO verification. Only approved employers will be
        able to publish jobs.
      </p>

      {loading && <p className="status-note">Loading your company…</p>}
      {error && (
        <div className="banner banner--error" role="alert">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="status-grid">
            <article className="card">
              <p className="card__label">Verification</p>
              <p className={`pill ${status === 'approved' ? 'pill--ok' : 'pill--warn'}`}>{status}</p>
              <p>{STATUS_COPY[status]}</p>
            </article>
            <article className="card">
              <p className="card__label">Company profile</p>
              <p className="card__value">{stats.completion}%</p>
              <p>{employer.companyName || 'Add your company name to get started.'}</p>
            </article>
            <article className="card">
              <p className="card__label">Jobs</p>
              <p className="card__value">{stats.jobs}</p>
              <p>{status === 'approved' ? 'Submit a role for ILO review.' : 'Posting opens after verification.'}</p>
            </article>
            <article className="card">
              <p className="card__label">Applications</p>
              <p className="card__value">{stats.applications}</p>
              <p>{stats.applications ? 'Review candidates from your jobs list.' : 'Applicants will appear after people apply.'}</p>
            </article>
          </div>

          {employer.verificationNote && (
            <div className="banner" role="status">
              Reviewer note: {employer.verificationNote}
            </div>
          )}

          <div className="hero-actions">
            <Link className="button" to="/employer/company">
              {stats.completion === 100 ? 'Edit company profile' : 'Complete company profile'}
            </Link>
            {stats.canPostJobs && (
              <Link className="button button--ghost" to="/employer/jobs/new">
                Post a job
              </Link>
            )}
            <Link className="button button--ghost" to="/employer/jobs">
              Review applicants
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
