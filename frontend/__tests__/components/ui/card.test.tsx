import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

describe('Card Component', () => {
  it('renders Card with default props', () => {
    render(<Card>Card content</Card>);

    const card = screen.getByText(/card content/i);
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
  });

  it('renders Card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
        <CardFooter>
          <p>Card footer</p>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText(/card title/i)).toBeInTheDocument();
    expect(screen.getByText(/card description/i)).toBeInTheDocument();
    expect(screen.getByText(/card content goes here/i)).toBeInTheDocument();
    expect(screen.getByText(/card footer/i)).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-card">Custom Card</Card>);

    const card = screen.getByText(/custom card/i);
    expect(card).toHaveClass('custom-card');
  });

  it('forwards ref correctly for Card', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Card with Ref</Card>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.textContent).toBe('Card with Ref');
  });

  it('renders CardHeader with correct styling', () => {
    render(
      <Card>
        <CardHeader>Header Content</CardHeader>
      </Card>
    );

    const header = screen.getByText(/header content/i);
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('renders CardTitle as h3 element', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    );

    const title = screen.getByRole('heading', { level: 3, name: /test title/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
  });

  it('renders CardDescription with correct styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
      </Card>
    );

    const description = screen.getByText(/test description/i);
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('renders CardContent with correct styling', () => {
    render(
      <Card>
        <CardContent>Content Area</CardContent>
      </Card>
    );

    const content = screen.getByText(/content area/i);
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('renders CardFooter with correct styling', () => {
    render(
      <Card>
        <CardFooter>Footer Content</CardFooter>
      </Card>
    );

    const footer = screen.getByText(/footer content/i);
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('handles nested content correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Nested Card</CardTitle>
          <CardDescription>This card has nested components</CardDescription>
        </CardHeader>
        <CardContent>
          <div data-testid="nested-content">
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
        </CardContent>
        <CardFooter>
          <button>Action Button</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('heading', { name: /nested card/i })).toBeInTheDocument();
    expect(screen.getByText(/this card has nested components/i)).toBeInTheDocument();
    expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
  });

  it('applies custom className to subcomponents', () => {
    render(
      <Card>
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">Title</CardTitle>
          <CardDescription className="custom-description">Description</CardDescription>
        </CardHeader>
        <CardContent className="custom-content">Content</CardContent>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText(/title/i)).toHaveClass('custom-title');
    expect(screen.getByText(/description/i)).toHaveClass('custom-description');
    expect(screen.getByText(/content/i)).toHaveClass('custom-content');
    expect(screen.getByText(/footer/i)).toHaveClass('custom-footer');
  });

  it('maintains semantic HTML structure', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Semantic Card</CardTitle>
          <CardDescription>Testing semantic structure</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content</p>
        </CardContent>
        <CardFooter>
          <span>Footer text</span>
        </CardFooter>
      </Card>
    );

    // Check that the structure is semantically correct
    const card = container.firstChild;
    expect(card).toBeInstanceOf(HTMLDivElement);

    const header = screen.getByText(/semantic card/i).closest('div');
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');

    const content = screen.getByText(/main content/i).closest('div');
    expect(content).toHaveClass('p-6', 'pt-0');

    const footer = screen.getByText(/footer text/i).closest('div');
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });
});