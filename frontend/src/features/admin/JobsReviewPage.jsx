import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import { listAdminJobs, reviewJob } from '../jobs/services/jobApi';

export default function JobsReviewPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (status = filter) => {
    setLoading(true);
    setMessage('');
    try {
      const result = await listAdminJobs(status === 'all' ? undefined : status);
      setJobs(result.data.jobs);
      setSuccess(result.message);
    } catch (error) {
      setSuccess('');
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const onReview = async (id, status) => {
    setMessage('');
    setSuccess('');
    try {
      const result = await reviewJob(id, { status });
      setSuccess(result.message);
      await load(filter);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">ILO admin</p>
      <h1>Job approval</h1>
      <p className="lede">Approve a role before job seekers can see it on the public board.</p>

      <FeedbackBanner type="error">{message}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <div className="hero-actions">
        {['pending', 'published', 'rejected', 'closed', 'all'].map((value) => (
          <button
            key={value}
            className={`button ${filter === value ? '' : 'button--ghost'}`}
            type="button"
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {loading && <p className="status-note">Loading jobs…</p>}
      {!loading && jobs.length === 0 && <p className="status-note">No jobs in this list.</p>}

      <div className="status-grid">
        {jobs.map((job) => (
          <article className="card" key={job._id}>
            <p className="card__label">{job.companyName || 'Employer'}</p>
            <p className="card__value">{job.title}</p>
            <p className={`pill ${job.status === 'published' ? 'pill--ok' : 'pill--warn'}`}>{job.status}</p>
            <p>{job.skills.join(', ')}</p>
            <div className="hero-actions">
              <Link className="button button--ghost" to={`/jobs/${job._id}`}>
                View
              </Link>
              {job.status === 'pending' && (
                <>
                  <button className="button" type="button" onClick={() => onReview(job._id, 'published')}>
                    Approve
                  </button>
                  <button className="button button--ghost" type="button" onClick={() => onReview(job._id, 'rejected')}>
                    Reject
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
