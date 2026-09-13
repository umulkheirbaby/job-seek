import { useEffect, useState } from 'react';
import FeedbackBanner from '../../components/FeedbackBanner';
import { listUsers, updateUserStatus } from './services/adminApi';

const ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: 'job_seeker', label: 'Job seekers' },
  { value: 'employer', label: 'Employers' },
  { value: 'admin', label: 'Admins' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const ROLE_LABELS = {
  job_seeker: 'Job seeker',
  employer: 'Employer',
  admin: 'Administrator',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async ({ keepSuccess = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const result = await listUsers({
        role: role === 'all' ? undefined : role,
        status: status === 'all' ? undefined : status,
        search: search.trim() || undefined,
      });
      setUsers(result.data.users);
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
  }, [role, status]);

  const onSearch = (event) => {
    event.preventDefault();
    load();
  };

  const onStatus = async (id, nextStatus) => {
    setError('');
    try {
      const result = await updateUserStatus(id, nextStatus);
      setSuccess(result.message);
      await load({ keepSuccess: true });
    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">ILO admin</p>
      <h1>User management</h1>
      <p className="lede">
        Find accounts and suspend people who should not sign in. Administrator accounts stay
        protected.
      </p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <form className="hero-actions" onSubmit={onSearch}>
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
          />
        </label>
        <button className="button" type="submit">
          Search
        </button>
      </form>

      <div className="hero-actions">
        {ROLE_FILTERS.map((item) => (
          <button
            key={item.value}
            className={`button ${role === item.value ? '' : 'button--ghost'}`}
            type="button"
            onClick={() => setRole(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="hero-actions">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value}
            className={`button ${status === item.value ? '' : 'button--ghost'}`}
            type="button"
            onClick={() => setStatus(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <p className="status-note">Loading users…</p>}
      {!loading && users.length === 0 && <p className="status-note">No users in this list.</p>}

      <div className="status-grid">
        {users.map((user) => (
          <article className="card" key={user._id}>
            <p className="card__label">{ROLE_LABELS[user.role] || user.role}</p>
            <p className="card__value">{user.name}</p>
            <p>{user.email}</p>
            <p className={`pill ${user.status === 'active' ? 'pill--ok' : 'pill--warn'}`}>{user.status}</p>
            {user.role !== 'admin' && (
              <div className="hero-actions">
                {user.status !== 'active' && (
                  <button className="button" type="button" onClick={() => onStatus(user._id, 'active')}>
                    Reactivate
                  </button>
                )}
                {user.status !== 'suspended' && (
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => onStatus(user._id, 'suspended')}
                  >
                    Suspend
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
