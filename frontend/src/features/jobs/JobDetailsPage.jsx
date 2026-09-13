import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import { statusLabel } from '../applications/applicationLabels';
import { applyToJob, getMyApplicationForJob } from '../applications/services/applicationApi';
import { useApp } from '../../store/AppContext';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_TYPES, labelFor } from './jobLabels';
import { getJob } from './services/jobApi';

export default function JobDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useApp();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getJob(id);
        if (!cancelled) {
          setJob(result.data.job);
        }

        if (user?.role === 'job_seeker') {
          const mine = await getMyApplicationForJob(id);
          if (!cancelled) {
            setApplication(mine.data.application);
          }
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
  }, [id, user]);

  const onApply = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setFieldError('');

    try {
      const result = await applyToJob(id, { coverLetter });
      setApplication(result.data.application);
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
      setFieldError(err.payload?.errors?.coverLetter || '');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="status-note">Loading job…</p>;
  }

  if (!job) {
    return <FeedbackBanner type="error">{error || 'Job not found.'}</FeedbackBanner>;
  }

  const salary =
    job.salary.min || job.salary.max
      ? `${job.salary.min || '—'}–${job.salary.max || '—'} ${job.salary.currency}`
      : 'Salary not listed';
  const deadlinePassed = Boolean(
    job.deadline && Date.now() > new Date(job.deadline).setHours(23, 59, 59, 999)
  );

  return (
    <section className="page page--wide">
      <p className="eyebrow">{job.companyName || 'Job'}</p>
      <h1>{job.title}</h1>
      <p className="lede">
        {labelFor(WORK_TYPES, job.workType)} · {labelFor(EMPLOYMENT_TYPES, job.employmentType)} ·{' '}
        {labelFor(EXPERIENCE_LEVELS, job.experienceLevel)}
      </p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <div className="status-grid">
        <article className="card">
          <p className="card__label">Location</p>
          <p>{[job.location.city, job.location.country].filter(Boolean).join(', ') || 'Not specified'}</p>
        </article>
        <article className="card">
          <p className="card__label">Salary</p>
          <p>{salary}</p>
        </article>
        <article className="card">
          <p className="card__label">Deadline</p>
          <p>{job.deadline ? String(job.deadline).slice(0, 10) : 'Open'}</p>
        </article>
        <article className="card">
          <p className="card__label">Status</p>
          <p className={`pill ${job.status === 'published' ? 'pill--ok' : 'pill--warn'}`}>{job.status}</p>
        </article>
      </div>

      <article className="card">
        <p className="card__label">Skills</p>
        <p>{job.skills.join(', ') || 'None listed'}</p>
      </article>

      <article className="card">
        <p className="card__label">Description</p>
        <p>{job.description}</p>
      </article>

      {user?.role === 'job_seeker' && job.status === 'published' && (
        <article className="card">
          <p className="card__label">Apply</p>
          {application ? (
            <p>
              You applied. Current status:{' '}
              <strong>{statusLabel(application.status)}</strong>
            </p>
          ) : deadlinePassed ? (
            <p>The application deadline has passed.</p>
          ) : (
            <form className="stack" onSubmit={onApply}>
              <label>
                Cover letter
                <textarea
                  rows="4"
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  placeholder="Why you are a fit for this role"
                />
                {fieldError && <span className="field-error">{fieldError}</span>}
              </label>
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </article>
      )}

      <div className="hero-actions">
        <Link className="button button--ghost" to="/jobs">
          Back to jobs
        </Link>
        {!user && deadlinePassed && <p>The application deadline has passed.</p>}
        {!user && !deadlinePassed && (
          <Link className="button" to="/login" state={{ from: location }}>
            Sign in to apply
          </Link>
        )}
        {user?.role === 'employer' && (
          <Link className="button" to={`/employer/jobs/${id}/applicants`}>
            View applicants
          </Link>
        )}
      </div>
    </section>
  );
}
