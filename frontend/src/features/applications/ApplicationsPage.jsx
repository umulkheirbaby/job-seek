import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import ApplicationDocumentButton from './ApplicationDocumentButton';
import { statusLabel } from './applicationLabels';
import { listApplications } from './services/applicationApi';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await listApplications();
        if (!cancelled) {
          setApplications(result.data.applications);
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
      <p className="eyebrow">Job seeker</p>
      <h1>Your applications</h1>
      <p className="lede">Track every role you have applied for and see how the employer has moved it.</p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      {loading && <p className="status-note">Loading applications…</p>}
      {!loading && applications.length === 0 && (
        <p className="status-note">
          You have not applied yet. <Link to="/jobs">Browse jobs</Link>
        </p>
      )}

      <div className="status-grid">
        {applications.map((item) => (
          <article className="card" key={item._id}>
            <p className="card__label">{item.job?.companyName || 'Employer'}</p>
            <p className="card__value">{item.job?.title || 'Job'}</p>
            <p className={`pill ${item.status === 'rejected' ? 'pill--warn' : 'pill--ok'}`}>
              {statusLabel(item.status)}
            </p>
            <p>Applied {String(item.createdAt).slice(0, 10)}</p>
            <ApplicationDocumentButton application={item} />
            <Link className="button" to={`/jobs/${item.jobId}`}>
              View job
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
