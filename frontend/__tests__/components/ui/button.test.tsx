import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);

    let button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border', 'border-input');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-secondary');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);

    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-9', 'px-3');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('h-11', 'px-8');

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: /icon/i });
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button with Ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Button with Ref');
  });

  it('renders as child when asChild prop is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole('button', { name: /custom button/i });
    expect(button).toHaveClass('custom-class');
  });

  it('handles keyboard events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Keyboard Button</Button>);

    const button = screen.getByRole('button', { name: /keyboard button/i });

    // Test Enter key
    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    handleClick.mockClear();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});