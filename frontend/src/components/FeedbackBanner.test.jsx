import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FeedbackBanner from './FeedbackBanner';

describe('FeedbackBanner', () => {
  it('renders API error messages as alerts', () => {
    render(<FeedbackBanner type="error">Authentication required</FeedbackBanner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Authentication required');
  });

  it('renders nothing when there is no message', () => {
    const { container } = render(<FeedbackBanner type="ok">{''}</FeedbackBanner>);
    expect(container).toBeEmptyDOMElement();
  });
});
