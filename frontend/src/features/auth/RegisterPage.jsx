import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homePathFor } from './homePath';
import { useApp } from '../../store/AppContext';

export default function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'job_seeker',
  });
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
      const user = await register(form);
      navigate(homePathFor(user), { replace: true });
    } catch (error) {
      setMessage(error.message);
      setErrors(error.payload?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page page--narrow">
      <p className="eyebrow">Create access</p>
      <h1>Create an account</h1>
      <p className="lede">
        Register as a job seeker or employer. Passwords are hashed on the server and the session cookie
        is httpOnly.
      </p>
      {message && (
        <div className="banner banner--error" role="alert">
          {message}
        </div>
      )}
      <form className="panel" onSubmit={onSubmit}>
        <label>
          Full name
          <input type="text" name="name" value={form.name} onChange={onChange} placeholder="Ahmed Hassan" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            placeholder="ahmed@example.com"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={onChange}
            placeholder="At least 8 characters"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <label>
          I am a
          <select name="role" value={form.role} onChange={onChange}>
            <option value="job_seeker">Job seeker</option>
            <option value="employer">Employer</option>
          </select>
          {errors.role && <span className="field-error">{errors.role}</span>}
        </label>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
}
