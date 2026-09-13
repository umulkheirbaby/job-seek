import { useEffect, useState } from 'react';
import FeedbackBanner from '../../components/FeedbackBanner';
import { listEmployers, verifyEmployer } from '../employers/services/employerApi';

export default function EmployersReviewPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (status = filter) => {
    setLoading(true);
    setMessage('');
    try {
      const result = await listEmployers(status === 'all' ? undefined : status);
      setItems(result.data.employers);
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
      const result = await verifyEmployer(id, { verificationStatus });
      setSuccess(result.message);
      await load(filter);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">ILO admin</p>
      <h1>Employer verification</h1>
      <p className="lede">
        Review company profiles before they can publish jobs. This is the trust layer for job
        seekers.
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

      {loading && <p className="status-note">Loading employers…</p>}

      {!loading && items.length === 0 && <p className="status-note">No employers in this list.</p>}

      <div className="status-grid">
        {items.map(({ employer, user }) => (
          <article className="card" key={employer._id}>
            <p className="card__label">{employer.verificationStatus}</p>
            <p className="card__value">{employer.companyName || 'Unnamed company'}</p>
            <p>{user?.name} · {user?.email}</p>
            <p>
              {[employer.city, employer.country].filter(Boolean).join(', ') || 'No location yet'}
            </p>
            {employer.website && (
              <p>
                <a href={employer.website} target="_blank" rel="noreferrer">
                  {employer.website}
                </a>
              </p>
            )}
            <p>{employer.description || 'No description yet.'}</p>
            <div className="hero-actions">
              <button className="button" type="button" onClick={() => onVerify(employer._id, 'approved')}>
                Approve
              </button>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => onVerify(employer._id, 'rejected')}
              >
                Reject
              </button>
              {employer.verificationStatus !== 'suspended' && (
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={() => onVerify(employer._id, 'suspended')}
                >
                  Suspend
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
