import { useEffect, useState } from 'react';
import FeedbackBanner from '../../components/FeedbackBanner';
import { getMyEmployer, updateMyEmployer } from './services/employerApi';

export default function CompanyProfilePage() {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getMyEmployer();
        if (!cancelled) {
          setForm({
            companyName: result.data.employer.companyName || '',
            description: result.data.employer.description || '',
            website: result.data.employer.website || '',
            industry: result.data.employer.industry || '',
            country: result.data.employer.country || '',
            city: result.data.employer.city || '',
            verificationStatus: result.data.employer.verificationStatus,
          });
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
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setSuccess('');
    setErrors({});

    try {
      const result = await updateMyEmployer({
        companyName: form.companyName,
        description: form.description,
        website: form.website,
        industry: form.industry,
        country: form.country,
        city: form.city,
      });
      setForm((current) => ({
        ...current,
        ...result.data.employer,
      }));
      setSuccess(`${result.message}. Profile completion is now ${result.data.stats.completion}%.`);
    } catch (error) {
      setMessage(error.message);
      setErrors(error.payload?.errors || {});
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="status-note">Loading company profile…</p>;
  }

  if (!form) {
    return (
      <FeedbackBanner type="error">{message || 'Could not load the company profile.'}</FeedbackBanner>
    );
  }

  return (
    <section className="page page--wide">
      <p className="eyebrow">Company profile</p>
      <h1>Tell job seekers who you are.</h1>
      <p className="lede">
        ILO reviews this information before you can post jobs. Status:{' '}
        <strong>{form.verificationStatus}</strong>
      </p>

      <FeedbackBanner type="error">{message}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <form className="panel" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            Company name
            <input name="companyName" value={form.companyName} onChange={onChange} />
            {errors.companyName && <span className="field-error">{errors.companyName}</span>}
          </label>
          <label>
            Industry
            <input name="industry" value={form.industry} onChange={onChange} placeholder="Technology" />
          </label>
          <label>
            Website
            <input name="website" value={form.website} onChange={onChange} placeholder="https://" />
            {errors.website && <span className="field-error">{errors.website}</span>}
          </label>
          <label>
            Country
            <input name="country" value={form.country} onChange={onChange} placeholder="Kenya" />
          </label>
          <label>
            City
            <input name="city" value={form.city} onChange={onChange} placeholder="Nairobi" />
          </label>
        </div>
        <label>
          Description
          <textarea name="description" rows="4" value={form.description} onChange={onChange} />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </label>
        <button className="button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save company profile'}
        </button>
      </form>
    </section>
  );
}
