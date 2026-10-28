import { useEffect, useState } from 'react';
import FeedbackBanner from '../../components/FeedbackBanner';
import { getMyProfile, updateMyProfile, uploadProfileDocuments, openProfileDocument } from './services/profileApi';

const emptyEducation = () => ({
  institution: '',
  qualification: '',
  field: '',
  startDate: '',
  endDate: '',
});

const emptyExperience = () => ({
  company: '',
  position: '',
  description: '',
  startDate: '',
  endDate: '',
});

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

const toForm = (profile) => ({
  phone: profile.phone || '',
  bio: profile.bio || '',
  country: profile.location?.country || '',
  city: profile.location?.city || '',
  skills: profile.skills || [],
  education: (profile.education || []).map((item) => ({
    ...item,
    startDate: toDateInput(item.startDate),
    endDate: toDateInput(item.endDate),
  })),
  experience: (profile.experience || []).map((item) => ({
    ...item,
    startDate: toDateInput(item.startDate),
    endDate: toDateInput(item.endDate),
  })),
  cvUrl: profile.cvUrl || '',
  portfolioUrl: profile.portfolioUrl || '',
});

const toPayload = (form) => ({
  phone: form.phone,
  bio: form.bio,
  location: { country: form.country, city: form.city },
  skills: form.skills,
  education: form.education,
  experience: form.experience,
  cvUrl: form.cvUrl,
  portfolioUrl: form.portfolioUrl,
});

export default function ProfilePage() {
  const [form, setForm] = useState(null);
  const [skillDraft, setSkillDraft] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [documentMeta, setDocumentMeta] = useState({ hasDocument: false, originalName: '' });
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getMyProfile();
        if (!cancelled) {
          setForm(toForm(result.data.profile));
          setDocumentMeta({
            hasDocument: Boolean(result.data.profile.hasDocument),
            originalName: result.data.profile.documentOriginalName || '',
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

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const persist = async (nextForm, extraMessage = '') => {
    setSaving(true);
    setMessage('');
    setSuccess('');
    setErrors({});

    try {
      const result = await updateMyProfile(toPayload(nextForm));
      setForm({
        ...nextForm,
        ...toForm(result.data.profile),
        education: nextForm.education.some((item) => !item.institution && !item.qualification)
          ? nextForm.education
          : toForm(result.data.profile).education,
        experience: nextForm.experience.some((item) => !item.company && !item.position)
          ? nextForm.experience
          : toForm(result.data.profile).experience,
      });
      const detail = extraMessage.trim();
      const completion = `Completion is now ${result.data.stats.completion}%.`;
      setSuccess(detail ? `${result.message}. ${detail} ${completion}` : `${result.message}. ${completion}`);
      return result;
    } catch (error) {
      setMessage(error.message);
      setErrors(error.payload?.errors || {});
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    const skill = skillDraft.trim();
    if (!skill) {
      setSuccess('');
      setMessage('Enter a skill before adding it.');
      return;
    }

    if (form.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setSuccess('');
      setMessage(`${skill} is already on your profile.`);
      setSkillDraft('');
      return;
    }

    setSkillDraft('');
    try {
      await persist({ ...form, skills: [...form.skills, skill] }, ` ${skill} was added.`);
    } catch {
      setForm((current) => current);
    }
  };

  const removeSkill = async (skill) => {
    try {
      await persist(
        { ...form, skills: form.skills.filter((item) => item !== skill) },
        ` ${skill} was removed.`
      );
    } catch {
      setForm((current) => current);
    }
  };

  const updateListItem = (list, index, name, value) => {
    updateField(
      list,
      form[list].map((item, itemIndex) => (itemIndex === index ? { ...item, [name]: value } : item))
    );
  };

  const onUploadDocument = async (event) => {
    event.preventDefault();
    if (!documentFiles.length) {
      setSuccess('');
      setMessage('');
      setErrors({
        documents: 'Choose one combined PDF, or several PDFs to merge',
      });
      return;
    }

    setUploadingDocument(true);
    setMessage('');
    setSuccess('');
    setErrors({});

    try {
      const result = await uploadProfileDocuments(documentFiles);
      setDocumentMeta({
        hasDocument: Boolean(result.data.profile.hasDocument),
        originalName: result.data.profile.documentOriginalName || '',
      });
      setDocumentFiles([]);
      setSuccess(`${result.message}. Completion is now ${result.data.stats.completion}%.`);
    } catch (error) {
      setMessage(error.message);
      setErrors(error.payload?.errors || {});
    } finally {
      setUploadingDocument(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await persist(form);
    } catch {
      setForm((current) => current);
    }
  };

  if (loading) {
    return <p className="status-note">Loading your profile…</p>;
  }

  if (!form) {
    return (
      <div className="banner banner--error" role="alert">
        {message || 'Could not load your profile.'}
      </div>
    );
  }

  return (
    <section className="page page--wide">
      <p className="eyebrow">Professional profile</p>
      <h1>Tell employers who you are.</h1>
      <p className="lede">
        Add skills, education, experience, and a combined PDF. We attach that PDF every time you apply, so
        you only upload it once.
      </p>

      <FeedbackBanner type="error">{message}</FeedbackBanner>
      <FeedbackBanner type="ok">{success}</FeedbackBanner>

      <form className="panel" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            Phone
            <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
          </label>
          <label>
            Country
            <input
              value={form.country}
              onChange={(event) => updateField('country', event.target.value)}
              placeholder="Kenya"
            />
          </label>
          <label>
            City
            <input
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
              placeholder="Garissa"
            />
          </label>
        </div>

        <label>
          About
          <textarea
            rows="4"
            value={form.bio}
            onChange={(event) => updateField('bio', event.target.value)}
            placeholder="A short professional summary"
          />
          {errors.bio && <span className="field-error">{errors.bio}</span>}
        </label>

        <fieldset className="stack">
          <legend>Skills</legend>
          <div className="chip-row">
            {form.skills.map((skill) => (
              <button key={skill} className="chip" type="button" onClick={() => removeSkill(skill)}>
                {skill} ×
              </button>
            ))}
          </div>
          <div className="inline-add">
            <input
              value={skillDraft}
              onChange={(event) => setSkillDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addSkill();
                }
              }}
              placeholder="React, then Enter"
            />
            <button className="button button--ghost" type="button" onClick={addSkill}>
              Add skill
            </button>
          </div>
          {errors.skills && <span className="field-error">{errors.skills}</span>}
        </fieldset>

        <fieldset className="stack">
          <legend>Education</legend>
          {form.education.map((item, index) => (
            <div className="repeat-card" key={item._id || `education-${index}`}>
              <div className="form-grid">
                <label>
                  Institution
                  <input
                    value={item.institution}
                    onChange={(event) => updateListItem('education', index, 'institution', event.target.value)}
                  />
                </label>
                <label>
                  Qualification
                  <input
                    value={item.qualification}
                    onChange={(event) =>
                      updateListItem('education', index, 'qualification', event.target.value)
                    }
                  />
                </label>
                <label>
                  Field
                  <input
                    value={item.field}
                    onChange={(event) => updateListItem('education', index, 'field', event.target.value)}
                  />
                </label>
                <label>
                  Start
                  <input
                    type="date"
                    value={item.startDate}
                    onChange={(event) => updateListItem('education', index, 'startDate', event.target.value)}
                  />
                </label>
                <label>
                  End
                  <input
                    type="date"
                    value={item.endDate}
                    onChange={(event) => updateListItem('education', index, 'endDate', event.target.value)}
                  />
                </label>
              </div>
              <button
                className="text-button text-button--danger"
                type="button"
                onClick={() =>
                  persist({
                    ...form,
                    education: form.education.filter((_, itemIndex) => itemIndex !== index),
                  }).catch(() => {})
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="button button--ghost"
            type="button"
            onClick={() => {
              setForm((current) => ({ ...current, education: [...current.education, emptyEducation()] }));
              setMessage('');
              setSuccess('Education entry added. Fill it in, then save to store it.');
            }}
          >
            Add education
          </button>
          {errors.education && <span className="field-error">{errors.education}</span>}
        </fieldset>

        <fieldset className="stack">
          <legend>Experience</legend>
          {form.experience.map((item, index) => (
            <div className="repeat-card" key={item._id || `experience-${index}`}>
              <div className="form-grid">
                <label>
                  Company
                  <input
                    value={item.company}
                    onChange={(event) => updateListItem('experience', index, 'company', event.target.value)}
                  />
                </label>
                <label>
                  Position
                  <input
                    value={item.position}
                    onChange={(event) => updateListItem('experience', index, 'position', event.target.value)}
                  />
                </label>
                <label>
                  Start
                  <input
                    type="date"
                    value={item.startDate}
                    onChange={(event) => updateListItem('experience', index, 'startDate', event.target.value)}
                  />
                </label>
                <label>
                  End
                  <input
                    type="date"
                    value={item.endDate}
                    onChange={(event) => updateListItem('experience', index, 'endDate', event.target.value)}
                  />
                </label>
              </div>
              <label>
                Description
                <textarea
                  rows="3"
                  value={item.description}
                  onChange={(event) => updateListItem('experience', index, 'description', event.target.value)}
                />
              </label>
              <button
                className="text-button text-button--danger"
                type="button"
                onClick={() =>
                  persist({
                    ...form,
                    experience: form.experience.filter((_, itemIndex) => itemIndex !== index),
                  }).catch(() => {})
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="button button--ghost"
            type="button"
            onClick={() => {
              setForm((current) => ({ ...current, experience: [...current.experience, emptyExperience()] }));
              setMessage('');
              setSuccess('Experience entry added. Fill it in, then save to store it.');
            }}
          >
            Add experience
          </button>
          {errors.experience && <span className="field-error">{errors.experience}</span>}
        </fieldset>

        <fieldset className="stack">
          <legend>Combined document (PDF)</legend>
          <p className="field-hint">
            Upload one combined PDF, or several PDFs (CV, certificates, ID). They are merged and reused on
            every application.
          </p>
          {documentMeta.hasDocument && (
            <div className="stack">
              <p className="field-hint">Current file: {documentMeta.originalName || 'combined-documents.pdf'}</p>
              <button className="button button--ghost" type="button" onClick={() => openProfileDocument()}>
                View combined PDF
              </button>
            </div>
          )}
          <label>
            {documentMeta.hasDocument ? 'Replace PDF' : 'Upload PDF'}
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={(event) => setDocumentFiles(Array.from(event.target.files || []))}
            />
          </label>
          {documentFiles.length > 0 && (
            <span className="field-hint">{documentFiles.map((file) => file.name).join(', ')}</span>
          )}
          {errors.documents && <span className="field-error">{errors.documents}</span>}
          <button className="button button--ghost" type="button" onClick={onUploadDocument} disabled={uploadingDocument}>
            {uploadingDocument ? 'Uploading…' : documentMeta.hasDocument ? 'Replace combined PDF' : 'Save combined PDF'}
          </button>
        </fieldset>

        <div className="form-grid">
          <label>
            CV URL
            <input
              value={form.cvUrl}
              onChange={(event) => updateField('cvUrl', event.target.value)}
              placeholder="https://..."
            />
            {errors.cvUrl && <span className="field-error">{errors.cvUrl}</span>}
          </label>
          <label>
            Portfolio URL
            <input
              value={form.portfolioUrl}
              onChange={(event) => updateField('portfolioUrl', event.target.value)}
              placeholder="https://..."
            />
            {errors.portfolioUrl && <span className="field-error">{errors.portfolioUrl}</span>}
          </label>
        </div>

        <button className="button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </section>
  );
}
