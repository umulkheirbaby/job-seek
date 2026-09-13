export const APPLICATION_STATUSES = [
  { value: 'applied', label: 'Applied' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export const statusLabel = (value) =>
  APPLICATION_STATUSES.find((item) => item.value === value)?.label || value;
