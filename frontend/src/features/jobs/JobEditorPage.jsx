import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import JobForm from './JobForm';
import { createJob, getJob, updateJob } from './services/jobApi';

export default function JobEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [job, setJob] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const result = await getJob(id);
        if (!cancelled) {
          setJob(result.data.job);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message);
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
  }, [id, isEdit]);

  const onSubmit = async (payload) => {
    setSubmitting(true);
    setMessage('');
    setSuccess('');
    setErrors({});

    try {
      const result = isEdit ? await updateJob(id, payload) : await createJob(payload);
      setSuccess(result.message);
      navigate('/employer/jobs', { replace: true, state: { notice: result.message } });
    } catch (error) {
      setMessage(error.message);
      setErrors(error.payload?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="status-note">Loading job…</p>;
  }

  if (isEdit && !job) {
    return <FeedbackBanner type="error">{message || 'Job not found.'}</FeedbackBanner>;
  }

  return (
    <section className="page page--wide">
      <p className="eyebrow">Employer</p>
      <h1>{isEdit ? 'Edit job' : 'Post a job'}</h1>
      <p className="lede">
        {isEdit
          ? 'Saving a published or rejected job sends it back to ILO for review.'
          : 'Verified employers can submit a role. It stays hidden until an admin approves it.'}
      </p>
      <FeedbackBanner type="error">{message}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>
      <JobForm
        initialJob={job}
        errors={errors}
        submitting={submitting}
        submitLabel={isEdit ? 'Save job' : 'Submit for review'}
        onSubmit={onSubmit}
      />
    </section>
  );
}
