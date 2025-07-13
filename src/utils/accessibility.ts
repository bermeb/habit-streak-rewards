/**
 * Accessibility utilities for the habit tracker application
 */
import React from 'react';

/**
 * Handle keyboard navigation for interactive elements
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent | React.KeyboardEvent,
  callback: () => void
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

/**
 * Get appropriate ARIA labels for habit-related actions
 */
export const getHabitAriaLabels = (habitName: string) => ({
  complete: `Mark ${habitName} as completed`,
  edit: `Edit ${habitName} habit`,
  delete: `Delete ${habitName} habit`,
  view: `View details for ${habitName} habit`,
});

/**
 * Get ARIA labels for navigation items
 */
export const getNavigationAriaLabels = () => ({
  dashboard: 'Navigate to dashboard page',
  habits: 'Navigate to habits list page',
  rewards: 'Navigate to rewards management page',
  statistics: 'Navigate to statistics page',
  settings: 'Navigate to settings page',
  theme: 'Toggle theme between light, dark, and system',
  menu: 'Open navigation menu',
  close: 'Close navigation menu',
});

/**
 * Get ARIA labels for form elements
 */
export const getFormAriaLabels = () => ({
  habitName: 'Enter habit name',
  habitDescription: 'Enter habit description (optional)',
  habitCategory: 'Select habit category',
  habitType: 'Select habit type: boolean, numeric, or time-based',
  habitTarget: 'Enter target value for numeric or time-based habits',
  habitUnit: 'Enter unit of measurement',
  save: 'Save habit',
  cancel: 'Cancel and close form',
});

/**
 * Get appropriate ARIA descriptions for streak indicators
 */
export const getStreakAriaDescription = (streak: number, habitName: string): string => {
  if (streak === 0) {
    return `${habitName} has no current streak. Complete today to start a streak.`;
  }
  if (streak === 1) {
    return `${habitName} has a 1-day streak. Complete today to continue.`;
  }
  return `${habitName} has a ${streak}-day streak. Keep it going!`;
};

/**
 * Get ARIA live region announcements for dynamic updates
 */
export const getAnnouncementText = {
  habitCompleted: (habitName: string) => `${habitName} completed successfully`,
  habitDeleted: (habitName: string) => `${habitName} has been deleted`,
  habitCreated: (habitName: string) => `New habit ${habitName} has been created`,
  rewardEarned: (rewardName: string) => `Congratulations! You earned the reward: ${rewardName}`,
  streakLost: (habitName: string) => `Streak lost for ${habitName}. Don't give up, start again today!`,
  milestoneReached: (days: number) => `Milestone reached! ${days} days completed`,
};

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static pushFocus(element: HTMLElement) {
    this.focusStack.push(document.activeElement as HTMLElement);
    element.focus();
  }

  static popFocus() {
    const previousElement = this.focusStack.pop();
    if (previousElement && previousElement.focus) {
      previousElement.focus();
    }
  }

  static trapFocus(container: HTMLElement, event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}

/**
 * Screen reader utilities
 */
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Color contrast and visual accessibility
 */
export const getContrastRatio = (_foreground: string, _background: string): number => {
  // This is a simplified implementation
  // In a real app, you'd want a more robust color contrast calculation
  const getLuminance = (_color: string): number => {
    // Convert hex to RGB and calculate relative luminance
    // This is a simplified version
    return 0.5; // Placeholder
  };
  
  const l1 = getLuminance(_foreground);
  const l2 = getLuminance(_background);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

export const meetsWCAGAAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 7;
};