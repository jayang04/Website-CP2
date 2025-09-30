import type { LoginForm, SignupForm } from '../types/index.js';
import { validateLoginForm, validateSignupForm } from '../utils/validation.js';

export class FormHandler {
  private static authService: any = null;
  private static dataService: any = null;
  
  // Initialize Firebase services
  private static async initializeServices() {
    if (!this.authService) {
      const authModule = await import('../firebase/auth.js');
      const dataModule = await import('../firebase/data.js');
      this.authService = new (authModule as any).AuthService();
      this.dataService = new (dataModule as any).DataService();
    }
  }
  
  /**
   * Handle login form submission
   */
  public static handleLoginForm(formElement: HTMLFormElement): void {
    formElement.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const formData = new FormData(formElement);
      const loginData: LoginForm = {
        email: formData.get('email') as string,
        password: formData.get('password') as string
      };
      
      const validation = validateLoginForm(loginData);
      
      // Clear previous errors
      FormHandler.clearErrors(formElement);
      
      if (!validation.isValid) {
        FormHandler.displayErrors(formElement, validation.errors);
        return;
      }
      
      // Show loading state
      const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';
      
      try {
        // Initialize Firebase services
        await FormHandler.initializeServices();
        
        // Authenticate with Firebase
        const result = await FormHandler.authService.login(loginData.email, loginData.password);
        
        if (result.success) {
          // Update last login time
          await FormHandler.dataService.updateUserProfile(result.user.uid, {
            lastLogin: new Date()
          });
          
          // Redirect to dashboard on success
          window.location.href = 'dashboard.html';
        } else {
          FormHandler.displayError(formElement, result.message);
        }
        
      } catch (error) {
        console.error('Login error:', error);
        FormHandler.displayError(formElement, 'An unexpected error occurred. Please try again.');
      } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
  
  /**
   * Handle signup form submission
   */
  public static handleSignupForm(formElement: HTMLFormElement): void {
    formElement.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const formData = new FormData(formElement);
      const signupData: SignupForm = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string
      };
      
      const validation = validateSignupForm(signupData);
      
      // Clear previous errors
      FormHandler.clearErrors(formElement);
      
      if (!validation.isValid) {
        FormHandler.displayErrors(formElement, validation.errors);
        return;
      }
      
      // Show loading state
      const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Creating account...';
      
      try {
        // Initialize Firebase services
        await FormHandler.initializeServices();
        
        // Create account with Firebase Auth
        const authResult = await FormHandler.authService.register(
          signupData.email, 
          signupData.password, 
          signupData.name
        );
        
        if (authResult.success) {
          // Create user profile in Firestore
          const profileResult = await FormHandler.dataService.createUserProfile(authResult.user.uid, {
            email: signupData.email,
            displayName: signupData.name,
            profileComplete: true
          });
          
          if (profileResult.success) {
            // Show success message and redirect
            FormHandler.displaySuccess(formElement, 'Account created successfully! Redirecting...');
            
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 2000);
          } else {
            FormHandler.displayError(formElement, 'Account created but profile setup failed. Please complete your profile.');
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 3000);
          }
        } else {
          FormHandler.displayError(formElement, authResult.message);
        }
        
      } catch (error) {
        console.error('Signup error:', error);
        FormHandler.displayError(formElement, 'An unexpected error occurred. Please try again.');
      } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
  
  /**
   * Display validation errors
   */
  private static displayErrors(formElement: HTMLFormElement, errors: Record<string, string>): void {
    Object.entries(errors).forEach(([field, message]) => {
      const input = formElement.querySelector(`input[name="${field}"], input[type="${field}"]`) as HTMLInputElement;
      if (input) {
        FormHandler.showInputError(input, message);
      }
    });
  }
  
  /**
   * Display a single error message
   */
  private static displayError(formElement: HTMLFormElement, message: string): void {
    const errorDiv = FormHandler.createErrorElement(message, 'form-error');
    const submitButton = formElement.querySelector('button[type="submit"]');
    if (submitButton) {
      formElement.insertBefore(errorDiv, submitButton);
    }
  }
  
  /**
   * Display success message
   */
  private static displaySuccess(formElement: HTMLFormElement, message: string): void {
    const successDiv = FormHandler.createSuccessElement(message);
    const submitButton = formElement.querySelector('button[type="submit"]');
    if (submitButton) {
      formElement.insertBefore(successDiv, submitButton);
    }
  }
  
  /**
   * Clear all error messages
   */
  private static clearErrors(formElement: HTMLFormElement): void {
    // Remove form-level errors
    const formErrors = formElement.querySelectorAll('.form-error, .form-success');
    formErrors.forEach(error => error.remove());
    
    // Remove input-level errors
    const inputErrors = formElement.querySelectorAll('.input-error');
    inputErrors.forEach(error => error.remove());
    
    // Reset input styles
    const inputs = formElement.querySelectorAll('input');
    inputs.forEach(input => {
      input.style.borderColor = '#e2e8f0';
    });
  }
  
  /**
   * Show error for specific input
   */
  private static showInputError(input: HTMLInputElement, message: string): void {
    input.style.borderColor = '#ef4444';
    
    const errorElement = FormHandler.createErrorElement(message, 'input-error');
    input.parentNode?.insertBefore(errorElement, input.nextSibling);
  }
  
  /**
   * Create error element
   */
  private static createErrorElement(message: string, className: string): HTMLElement {
    const errorDiv = document.createElement('div');
    errorDiv.className = className;
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.375rem;
    `;
    return errorDiv;
  }
  
  /**
   * Create success element
   */
  private static createSuccessElement(message: string): HTMLElement {
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      color: #10b981;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 0.375rem;
    `;
    return successDiv;
  }
  
  /**
   * Simulate login API call
   */
  private static async simulateLogin(data: LoginForm): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful login for demo purposes
        if (data.email && data.password) {
          // Store user data in localStorage
          const user = {
            id: '1',
            name: data.email.split('@')[0],
            email: data.email,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9d59278?ixlib=rb-4.0.3&auto=format&fit=crop&w=56&h=56&q=80',
            createdAt: new Date(),
            lastLogin: new Date()
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isLoggedIn', 'true');
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }
  
  /**
   * Simulate signup API call
   */
  private static async simulateSignup(data: SignupForm): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful signup
        const user = {
          id: Date.now().toString(),
          name: data.name,
          email: data.email,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9d59278?ixlib=rb-4.0.3&auto=format&fit=crop&w=56&h=56&q=80',
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        resolve();
      }, 1500);
    });
  }
}
