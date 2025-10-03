import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { setupMockFetch, setupMockFetchError } from '../__mocks__/api';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock TextDecoder and TextEncoder for test environment
global.TextDecoder = class {
  decode(buffer: any, options?: any) {
    return String.fromCharCode.apply(null, buffer);
  }
} as any;

global.TextEncoder = class {
  encode(input: string) {
    const buffer = new ArrayBuffer(input.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < input.length; i++) {
      view[i] = input.charCodeAt(i);
    }
    return view;
  }
} as any;

describe('AI Writing Assistant Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockFetch();
  });

  it('renders the main application with all components', () => {
    render(<Home />);

    // Check main title
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText(/AI Writing Assistant/i)).toBeInTheDocument();

    // Check input textarea
    const textarea = screen.getByPlaceholderText(/enter your text here/i);
    expect(textarea).toBeInTheDocument();

    // Check process button
    const processButton = screen.getByRole('button', { name: /process/i });
    expect(processButton).toBeInTheDocument();
    expect(processButton).toBeDisabled(); // Should be disabled when no text

    // Check that keyboard shortcuts help is displayed
    expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument();
  });

  it('enables process button when text is entered', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/enter your text here/i);
    const processButton = screen.getByRole('button', { name: /process/i });

    expect(processButton).toBeDisabled();

    await user.type(textarea, 'Hello, world!');

    expect(processButton).toBeEnabled();
  });

  it('processes text and displays outputs', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/enter your text here/i);
    const processButton = screen.getByRole('button', { name: /process/i });

    // Enter text and process
    await user.type(textarea, 'Hello, world!');
    await user.click(processButton);

    // Check that processing state is shown
    expect(screen.getByText(/processing/i)).toBeInTheDocument();

    // Wait for at least one output to appear
    await waitFor(() => {
      expect(screen.getByText(/This is a professional rephrasing/i)).toBeInTheDocument();
    });

    // Check that writing style cards appear
    await waitFor(() => {
      expect(screen.getByText(/Professional/i)).toBeInTheDocument();
    });

    // Check that success message appears
    await waitFor(() => {
      expect(screen.getByText(/text processed successfully/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    setupMockFetchError();
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/enter your text here/i);
    const processButton = screen.getByRole('button', { name: /process/i });

    await user.type(textarea, 'Test text');
    await user.click(processButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/API Error: Something went wrong/i)).toBeInTheDocument();
    });
  });

  it('shows cancel button during processing', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/enter your text here/i);
    const processButton = screen.getByRole('button', { name: /process/i });

    await user.type(textarea, 'Test text');
    await user.click(processButton);

    // Check that cancel button appears
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('validates input length', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/enter your text here/i);

    // Type a very long text
    const longText = 'a'.repeat(1500);
    await user.type(textarea, longText);

    // Check character count
    expect(screen.getByText(/1500\/1000 characters/i)).toBeInTheDocument();
  });

  it('clears error when user starts typing again', async () => {
    setupMockFetchError();
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/enter your text here/i);
    const processButton = screen.getByRole('button', { name: /process/i });

    // Trigger error
    await user.type(textarea, 'Test text');
    await user.click(processButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/API Error: Something went wrong/i)).toBeInTheDocument();
    });

    // Start typing again
    await user.type(textarea, ' more text');

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/API Error: Something went wrong/i)).not.toBeInTheDocument();
    });
  });
});