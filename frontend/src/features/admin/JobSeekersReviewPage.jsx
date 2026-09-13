import { useEffect, useState } from 'react';
import FeedbackBanner from '../../components/FeedbackBanner';
import { listJobSeekers, verifyJobSeeker } from './services/adminApi';

export default function JobSeekersReviewPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (status = filter) => {
    setLoading(true);
    setMessage('');
    try {
      const result = await listJobSeekers(status === 'all' ? undefined : status);
      setItems(result.data.jobSeekers);
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

  const onVerify = async (id, verificationStatus) => {
    setMessage('');
    setSuccess('');
    try {
      const result = await verifyJobSeeker(id, { verificationStatus });
      setSuccess(result.message);
      await load(filter);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">EmpoweWithIT admin</p>
      <h1>Job seeker verification</h1>
      <p className="lede">
        Review profiles before people can apply. Only approved job seekers can submit applications.
      </p>

      <FeedbackBanner type="error">{message}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <div className="hero-actions">
        {['pending', 'approved', 'rejected', 'suspended', 'all'].map((value) => (
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

      {loading && <p className="status-note">Loading job seekers…</p>}
      {!loading && items.length === 0 && <p className="status-note">No job seekers in this list.</p>}

      <div className="status-grid">
        {items.map(({ profile, user, stats }) => (
          <article className="card" key={profile._id}>
            <p className="card__label">{profile.verificationStatus}</p>
            <p className="card__value">{user?.name || 'Job seeker'}</p>
            <p>{user?.email}</p>
            <p>
              {[profile.location?.city, profile.location?.country].filter(Boolean).join(', ') ||
                'No location yet'}
            </p>
            <p>{profile.skills?.join(', ') || 'No skills listed'}</p>
            <p>Profile {stats.completion}% complete</p>
            {profile.verificationNote && <p>Reviewer note: {profile.verificationNote}</p>}
            <div className="hero-actions">
              <button className="button" type="button" onClick={() => onVerify(profile._id, 'approved')}>
                Approve
              </button>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => onVerify(profile._id, 'rejected')}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
