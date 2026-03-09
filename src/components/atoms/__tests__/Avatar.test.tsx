import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('renders the first two characters of the display name as uppercase initials', () => {
    const { getByText } = render(
      <Avatar userId="u1" displayName="Wendy Chen" />,
    );
    expect(getByText('WE')).toBeInTheDocument();
  });

  it('uppercases initials from lowercase names', () => {
    const { getByText } = render(<Avatar userId="u1" displayName="alice" />);
    expect(getByText('AL')).toBeInTheDocument();
  });

  it('handles a single-character name', () => {
    const { getByText } = render(<Avatar userId="u1" displayName="X" />);
    expect(getByText('X')).toBeInTheDocument();
  });

  it('trims leading whitespace before computing initials', () => {
    const { getByText } = render(<Avatar userId="u1" displayName="  Bob" />);
    expect(getByText('BO')).toBeInTheDocument();
  });

  it('defaults to size 32', () => {
    const { getByTitle } = render(<Avatar userId="u1" displayName="Wendy" />);
    expect(getByTitle('Wendy')).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('applies a custom size', () => {
    const { getByTitle } = render(
      <Avatar userId="u1" displayName="Wendy" size={48} />,
    );
    expect(getByTitle('Wendy')).toHaveStyle({ width: '48px', height: '48px' });
  });
});
