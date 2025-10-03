import type { LoginForm, SignupForm } from '../types/index.js';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate login form
 */
export function validateLoginForm(form: LoginForm): {
  isValid: boolean;
  errors: Partial<Record<keyof LoginForm, string>>;
} {
  const errors: Partial<Record<keyof LoginForm, string>> = {};
  
  if (!form.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!form.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate signup form
 */
export function validateSignupForm(form: SignupForm): {
  isValid: boolean;
  errors: Partial<Record<keyof SignupForm, string>>;
} {
  const errors: Partial<Record<keyof SignupForm, string>> = {};
  
  if (!form.firstName) {
    errors.firstName = 'First name is required';
  } else if (form.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters long';
  }
  
  if (!form.lastName) {
    errors.lastName = 'Last name is required';
  } else if (form.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters long';
  }
  
  if (!form.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!form.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = isValidPassword(form.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}
