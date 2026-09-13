import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import { APPLICATION_STATUSES, statusLabel } from './applicationLabels';
import { listJobApplications, updateApplicationStatus } from './services/applicationApi';

export default function EmployerApplicantsPage() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async ({ keepSuccess = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const result = await listJobApplications(id);
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
  }, [id]);

  const onStatus = async (applicationId, status) => {
    setError('');
    try {
      const result = await updateApplicationStatus(applicationId, status);
      setSuccess(result.message);
      await load({ keepSuccess: true });
    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">Employer</p>
      <h1>Applicants</h1>
      <p className="lede">Review candidates and move them through applied, shortlist, interview, hire, or reject.</p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <div className="hero-actions">
        <Link className="button button--ghost" to="/employer/jobs">
          Back to jobs
        </Link>
      </div>

      {loading && <p className="status-note">Loading applicants…</p>}
      {!loading && applications.length === 0 && <p className="status-note">No applications yet.</p>}

      <div className="status-grid">
        {applications.map((item) => (
          <article className="card" key={item._id}>
            <p className="card__label">{statusLabel(item.status)}</p>
            <p className="card__value">{item.candidate?.name || 'Candidate'}</p>
            <p>{item.candidate?.email}</p>
            <p>{item.profile?.skills?.join(', ') || 'No skills listed'}</p>
            {item.coverLetter && <p>{item.coverLetter}</p>}
            {item.cvUrl && (
              <p>
                <a href={item.cvUrl} target="_blank" rel="noreferrer">
                  View CV
                </a>
              </p>
            )}
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
          </article>
        ))}
      </div>
    </section>
  );
}
