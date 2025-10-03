import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea Component', () => {
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter text..." />);

    const textarea = screen.getByPlaceholderText(/enter text.../i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('min-h-[80px]', 'w-full', 'rounded-md');
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Textarea onChange={handleChange} placeholder="Type here..." />);

    const textarea = screen.getByPlaceholderText(/type here.../i);
    await user.type(textarea, 'Hello, world!');

    expect(handleChange).toHaveBeenCalledTimes(13); // Each character triggers onChange
    expect(textarea).toHaveValue('Hello, world!');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);

    const textarea = screen.getByPlaceholderText(/disabled textarea/i);
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} placeholder="Textarea with ref" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current?.placeholder).toBe('Textarea with ref');
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" placeholder="Custom styled" />);

    const textarea = screen.getByPlaceholderText(/custom styled/i);
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(
      <Textarea
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Focus test"
      />
    );

    const textarea = screen.getByPlaceholderText(/focus test/i);

    // Focus the textarea
    await user.click(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveFocus();

    // Blur the textarea
    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(textarea).not.toHaveFocus();
  });

  it('respects maxLength attribute', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <Textarea
        maxLength={10}
        onChange={handleChange}
        placeholder="Max length test"
      />
    );

    const textarea = screen.getByPlaceholderText(/max length test/i);
    await user.type(textarea, 'This is too long');

    expect(textarea).toHaveValue('This is to'); // Only first 10 characters
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleKeyDown = jest.fn();

    render(
      <Textarea
        onKeyDown={handleKeyDown}
        placeholder="Keyboard test"
      />
    );

    const textarea = screen.getByPlaceholderText(/keyboard test/i);
    await user.click(textarea);
    await user.keyboard('{Enter}');

    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('maintains accessibility attributes', () => {
    render(
      <Textarea
        aria-label="Description"
        aria-required="true"
        aria-invalid="false"
        placeholder="Accessibility test"
      />
    );

    const textarea = screen.getByPlaceholderText(/accessibility test/i);
    expect(textarea).toHaveAttribute('aria-label', 'Description');
    expect(textarea).toHaveAttribute('aria-required', 'true');
    expect(textarea).toHaveAttribute('aria-invalid', 'false');
  });

  it('handles readOnly state', () => {
    render(<Textarea readOnly value="Read only content" />);

    const textarea = screen.getByDisplayValue(/read only content/i);
    expect(textarea).toHaveAttribute('readOnly');
  });
});