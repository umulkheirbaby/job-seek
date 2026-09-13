import { useState } from 'react';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_TYPES } from './jobLabels';

const emptyForm = {
  title: '',
  description: '',
  skillsText: '',
  employmentType: 'full_time',
  workType: 'remote',
  experienceLevel: 'junior',
  country: '',
  city: '',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  deadline: '',
};

export const formFromJob = (job) => ({
  title: job.title || '',
  description: job.description || '',
  skillsText: (job.skills || []).join(', '),
  employmentType: job.employmentType || 'full_time',
  workType: job.workType || 'remote',
  experienceLevel: job.experienceLevel || 'junior',
  country: job.location?.country || '',
  city: job.location?.city || '',
  salaryMin: job.salary?.min ?? '',
  salaryMax: job.salary?.max ?? '',
  currency: job.salary?.currency || 'USD',
  deadline: job.deadline ? String(job.deadline).slice(0, 10) : '',
});

export const payloadFromForm = (form) => ({
  title: form.title,
  description: form.description,
  skills: form.skillsText
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean),
  employmentType: form.employmentType,
  workType: form.workType,
  experienceLevel: form.experienceLevel,
  location: { country: form.country, city: form.city },
  salary: {
    min: form.salaryMin === '' ? null : Number(form.salaryMin),
    max: form.salaryMax === '' ? null : Number(form.salaryMax),
    currency: form.currency,
  },
  deadline: form.deadline || null,
});

export default function JobForm({ initialJob, errors = {}, submitting, submitLabel, onSubmit }) {
  const [form, setForm] = useState(initialJob ? formFromJob(initialJob) : emptyForm);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(payloadFromForm(form));
      }}
    >
      <label>
        Job title
        <input name="title" value={form.title} onChange={onChange} placeholder="Junior React Developer" />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>
      <label>
        Description
        <textarea name="description" rows="5" value={form.description} onChange={onChange} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>
      <label>
        Skills
        <input
          name="skillsText"
          value={form.skillsText}
          onChange={onChange}
          placeholder="React, JavaScript, Git"
        />
        {errors.skills && <span className="field-error">{errors.skills}</span>}
      </label>
      <div className="form-grid">
        <label>
          Employment type
          <select name="employmentType" value={form.employmentType} onChange={onChange}>
            {EMPLOYMENT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Work type
          <select name="workType" value={form.workType} onChange={onChange}>
            {WORK_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Experience
          <select name="experienceLevel" value={form.experienceLevel} onChange={onChange}>
            {EXPERIENCE_LEVELS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Country
          <input name="country" value={form.country} onChange={onChange} placeholder="Worldwide" />
        </label>
        <label>
          City
          <input name="city" value={form.city} onChange={onChange} />
        </label>
        <label>
          Salary min
          <input name="salaryMin" type="number" value={form.salaryMin} onChange={onChange} />
        </label>
        <label>
          Salary max
          <input name="salaryMax" type="number" value={form.salaryMax} onChange={onChange} />
        </label>
        <label>
          Currency
          <input name="currency" value={form.currency} onChange={onChange} />
        </label>
        <label>
          Deadline
          <input name="deadline" type="date" value={form.deadline} onChange={onChange} />
          {errors.deadline && <span className="field-error">{errors.deadline}</span>}
        </label>
      </div>
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
