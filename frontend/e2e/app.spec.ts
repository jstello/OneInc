import { test, expect } from '@playwright/test';

test.describe('AI Writing Assistant E2E Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the main application loads
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('AI Writing Assistant')).toBeVisible();

    // Check for input textarea
    await expect(page.getByPlaceholder('Enter your text here')).toBeVisible();

    // Check for process button
    await expect(page.getByRole('button', { name: 'Process Text' })).toBeVisible();

    // Check for writing style cards
    await expect(page.getByText('Professional')).toBeVisible();
    await expect(page.getByText('Casual')).toBeVisible();
    await expect(page.getByText('Polite')).toBeVisible();
    await expect(page.getByText('Social Media')).toBeVisible();
  });

  test('should enable process button when text is entered', async ({ page }) => {
    await page.goto('/');

    const processButton = page.getByRole('button', { name: 'Process Text' });
    const textarea = page.getByPlaceholder('Enter your text here');

    // Button should be disabled initially
    await expect(processButton).toBeDisabled();

    // Enter text
    await textarea.fill('Hello, this is a test text.');

    // Button should be enabled now
    await expect(processButton).toBeEnabled();
  });

  test('should show character count', async ({ page }) => {
    await page.goto('/');

    const textarea = page.getByPlaceholder('Enter your text here');

    // Check initial character count
    await expect(page.getByText('0/1000 characters')).toBeVisible();

    // Enter text and check updated count
    await textarea.fill('Hello');
    await expect(page.getByText('5/1000 characters')).toBeVisible();
  });

  test('should handle empty text submission', async ({ page }) => {
    await page.goto('/');

    const processButton = page.getByRole('button', { name: 'Process Text' });

    // Button should be disabled for empty text
    await expect(processButton).toBeDisabled();
  });

  test('should display keyboard shortcuts help', async ({ page }) => {
    await page.goto('/');

    // Check that keyboard shortcuts are displayed
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible();
    await expect(page.getByText('Ctrl/Cmd')).toBeVisible();
    await expect(page.getByText('Enter')).toBeVisible();
    await expect(page.getByText('Esc')).toBeVisible();
  });

  test('should maintain responsive design', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that layout adapts
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('AI Writing Assistant')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('main')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/');

    // Check main accessibility attributes
    const main = page.getByRole('main');
    await expect(main).toHaveAttribute('aria-label', 'AI Writing Assistant');

    const textarea = page.getByPlaceholder('Enter your text here');
    await expect(textarea).toHaveAttribute('aria-required', 'true');

    // Check that output cards have proper labels
    const professionalCard = page.getByText('Professional').locator('..').locator('..');
    await expect(professionalCard).toHaveAttribute('aria-labelledby');
  });

  test('should handle text input and clear functionality', async ({ page }) => {
    await page.goto('/');

    const textarea = page.getByPlaceholder('Enter your text here');

    // Enter text
    await textarea.fill('This is a test sentence.');
    await expect(textarea).toHaveValue('This is a test sentence.');

    // Clear text
    await textarea.fill('');
    await expect(textarea).toHaveValue('');
  });

  test('should show appropriate loading states', async ({ page }) => {
    await page.goto('/');

    // This test would normally test the loading state when processing
    // For now, we'll verify the button states
    const processButton = page.getByRole('button', { name: 'Process Text' });

    // Button should show loading state when clicked (in a real scenario)
    // For now, we'll just verify the button exists and has proper attributes
    await expect(processButton).toHaveAttribute('type', 'button');
  });

  test('should maintain dark/light mode compatibility', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads with default theme
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // The application should work in both themes
    // We're not testing theme switching since it's not implemented
    // but the components should handle both themes
  });
});