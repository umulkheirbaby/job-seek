import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import { APPLICATION_STATUSES, statusLabel } from '../applications/applicationLabels';
import { updateApplicationStatus } from '../applications/services/applicationApi';
import { listAdminApplications } from './services/adminApi';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async ({ keepSuccess = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const result = await listAdminApplications(filter === 'all' ? undefined : filter);
      setApplications(result.data.applications);
      if (!keepSuccess) {
        setSuccess(result.message);
      }
    } catch (err) {
      setSuccess('');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const onStatus = async (id, status) => {
    setError('');
    try {
      const result = await updateApplicationStatus(id, status);
      setSuccess(result.message);
      await load({ keepSuccess: true });
    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">EmpoweWithIT admin</p>
      <h1>Applications and placements</h1>
      <p className="lede">
        Follow every application. Hired is the placement count the programme can report.
      </p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <div className="hero-actions">
        {[{ value: 'all', label: 'All' }, ...APPLICATION_STATUSES].map((item) => (
          <button
            key={item.value}
            className={`button ${filter === item.value ? '' : 'button--ghost'}`}
            type="button"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <p className="status-note">Loading applications…</p>}
      {!loading && applications.length === 0 && <p className="status-note">No applications in this list.</p>}

      <div className="status-grid">
        {applications.map((item) => (
          <article className="card" key={item._id}>
            <p className="card__label">{item.job?.companyName || 'Employer'}</p>
            <p className="card__value">{item.job?.title || 'Job'}</p>
            <p>{item.candidate?.name} · {item.candidate?.email}</p>
            <p className={`pill ${item.status === 'hired' ? 'pill--ok' : 'pill--warn'}`}>
              {statusLabel(item.status)}
            </p>
            <p>Applied {String(item.createdAt).slice(0, 10)}</p>
            <label>
              Update status
              <select value={item.status} onChange={(event) => onStatus(item._id, event.target.value)}>
                {APPLICATION_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Link className="button button--ghost" to={`/jobs/${item.jobId}`}>
              View job
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
