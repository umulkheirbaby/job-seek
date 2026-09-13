export const homePathFor = (user) => {
  if (!user) {
    return '/';
  }

  if (user.role === 'job_seeker') {
    return '/dashboard';
  }

  if (user.role === 'employer') {
    return '/employer/dashboard';
  }

  if (user.role === 'admin') {
    return '/admin';
  }

  return '/account';
};

export const homeLabelFor = (user) => {
  if (!user) {
    return 'Check platform status';
  }

  if (user.role === 'admin') {
    return 'Open programme dashboard';
  }

  return user.role === 'job_seeker' || user.role === 'employer' ? 'Go to your dashboard' : 'Go to your account';
};
