import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'should-not-appear');
    expect(result).toBe('base-class conditional-class');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    });
    expect(result).toBe('class1 class3');
  });

  it('handles mixed inputs', () => {
    const result = cn(
      'base-class',
      ['array-class1', 'array-class2'],
      {
        'object-class1': true,
        'object-class2': false,
      },
      'another-class'
    );
    expect(result).toBe('base-class array-class1 array-class2 object-class1 another-class');
  });

  it('handles empty inputs', () => {
    const result = cn('', null, undefined, false, 0);
    expect(result).toBe('');
  });

  it('handles Tailwind CSS conflicts correctly', () => {
    // This tests that tailwind-merge works correctly
    const result = cn('p-2 p-4', 'm-1 m-3');
    // Should only keep the last conflicting classes
    expect(result).toBe('p-4 m-3');
  });

  it('preserves non-conflicting Tailwind classes', () => {
    const result = cn('p-2 m-1', 'text-red-500 bg-blue-500');
    expect(result).toBe('p-2 m-1 text-red-500 bg-blue-500');
  });

  it('handles complex conditional logic', () => {
    const isActive = true;
    const isDisabled = false;
    const size = 'large';

    const result = cn(
      'base-component',
      {
        'active-state': isActive,
        'disabled-state': isDisabled,
        'size-small': size === 'small',
        'size-large': size === 'large',
      },
      'additional-class'
    );

    expect(result).toBe('base-component active-state size-large additional-class');
  });

  it('handles nested arrays and objects', () => {
    const result = cn(
      ['class1', ['class2', 'class3']],
      {
        'class4': true,
        'nested': {
          'class5': true,
          'class6': false,
        },
      }
    );

    // Note: The nested object structure won't work as expected with cn
    // This test shows the current behavior
    expect(result).toBe('class1 class2 class3 class4 nested');
  });

  it('works with CSS modules style class names', () => {
    const result = cn('button_primary__abc123', 'button_large__def456');
    expect(result).toBe('button_primary__abc123 button_large__def456');
  });

  it('handles numeric values correctly', () => {
    const result = cn(0, 1, 'class');
    expect(result).toBe('1 class');
  });

  it('handles string with multiple classes', () => {
    const result = cn('class1 class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });
});