import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import { listMyJobs, removeJob } from './services/jobApi';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const result = await listMyJobs();
      setJobs(result.data.jobs);
      setSuccess(result.message);
    } catch (err) {
      setSuccess('');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRemove = async (id) => {
    setError('');
    try {
      const result = await removeJob(id);
      setSuccess(result.message);
      await load();
    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">Employer</p>
      <h1>Your jobs</h1>
      <p className="lede">New roles stay pending until EmpoweWithIT approves them. Published jobs appear on the public board.</p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <div className="hero-actions">
        <Link className="button" to="/employer/jobs/new">
          Post a job
        </Link>
      </div>

      {loading && <p className="status-note">Loading your jobs…</p>}
      {!loading && jobs.length === 0 && <p className="status-note">You have not posted any jobs yet.</p>}

      <div className="status-grid">
        {jobs.map((job) => (
          <article className="card" key={job._id}>
            <p className={`pill ${job.status === 'published' ? 'pill--ok' : 'pill--warn'}`}>{job.status}</p>
            <p className="card__value">{job.title}</p>
            <p>{job.skills.join(', ')}</p>
            {job.reviewNote && <p>Reviewer note: {job.reviewNote}</p>}
            <div className="hero-actions">
              <Link className="button" to={`/employer/jobs/${job._id}/applicants`}>
                Applicants
              </Link>
              <Link className="button button--ghost" to={`/employer/jobs/${job._id}/edit`}>
                Edit
              </Link>
              <Link className="button button--ghost" to={`/jobs/${job._id}`}>
                View
              </Link>
              <button className="button button--ghost" type="button" onClick={() => onRemove(job._id)}>
                {job.status === 'published' ? 'Close' : 'Remove'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
