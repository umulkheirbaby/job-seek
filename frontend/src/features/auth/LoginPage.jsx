import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { homePathFor } from './homePath';
import { useApp } from '../../store/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setErrors({});

    try {
      const user = await login(form);
      const next = location.state?.from?.pathname || homePathFor(user);
      navigate(next, { replace: true });
    } catch (error) {
      setMessage(error.message);
      setErrors(error.payload?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page page--narrow">
      <p className="eyebrow">Welcome back</p>
      <h1>Sign in</h1>
      <p className="lede">Use the email and password from your account. The session is stored in an httpOnly cookie.</p>
      {message && (
        <div className="banner banner--error" role="alert">
          {message}
        </div>
      )}
      <form className="panel" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
