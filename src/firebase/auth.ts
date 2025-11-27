// Firebase Authentication Service
import { auth, storage } from './config';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    type User as FirebaseUser
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface AuthResult {
    success: boolean;
    user?: FirebaseUser;
    error?: string;
    message: string;
}

export class AuthService {
    currentUser: FirebaseUser | null = null;
    private authStateListeners: ((user: FirebaseUser | null) => void)[] = [];
    
    constructor() {
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.notifyAuthStateListeners(user);
        });
    }
    
    // Register new user
    async register(email: string, password: string, displayName: string): Promise<AuthResult> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update user profile with display name
            if (displayName) {
                await updateProfile(user, {
                    displayName: displayName
                });
                
                // Reload user to ensure the updated profile is available
                await user.reload();
                
                // Manually notify listeners with the updated user
                this.currentUser = auth.currentUser;
                this.notifyAuthStateListeners(auth.currentUser);
            }
            
            // Send email verification
            // Use current domain (works for localhost and production)
            await sendEmailVerification(user, {
                url: window.location.origin, // Redirect to home after verification
                handleCodeInApp: false
            });
            
            return {
                success: true,
                user: auth.currentUser || user,
                message: 'Account created! Please check your email to verify your account.'
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }
    
    // Sign in existing user
    async login(email: string, password: string): Promise<AuthResult> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check if email is verified
            if (!user.emailVerified) {
                return {
                    success: false,
                    user: user,
                    error: 'auth/email-not-verified',
                    message: 'Please verify your email before logging in. Check your inbox for the verification link.'
                };
            }
            
            return {
                success: true,
                user: user,
                message: 'Login successful!'
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }
    
    // Sign out user
    async logout(): Promise<AuthResult> {
        try {
            await signOut(auth);
            return {
                success: true,
                message: 'Logged out successfully!'
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.code,
                message: 'Error logging out'
            };
        }
    }
    
    // Send password reset email
    async resetPassword(email: string): Promise<AuthResult> {
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Password reset email sent! Please check your inbox and spam folder.'
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }
    
    // Resend email verification
    async resendVerificationEmail(): Promise<AuthResult> {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'auth/no-user',
                    message: 'No user is currently logged in.'
                };
            }
            
            if (this.currentUser.emailVerified) {
                return {
                    success: false,
                    error: 'auth/already-verified',
                    message: 'Your email is already verified!'
                };
            }
            
            await sendEmailVerification(this.currentUser, {
                url: window.location.origin, // Use current domain
                handleCodeInApp: false
            });
            
            return {
                success: true,
                message: 'Verification email sent! Please check your inbox and spam folder.'
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }
    
    // Check if current user's email is verified
    isEmailVerified(): boolean {
        return this.currentUser?.emailVerified ?? false;
    }
    
    // Upload profile picture
    async uploadProfilePicture(file: File): Promise<string | null> {
        try {
            if (!this.currentUser) {
                throw new Error('No user logged in');
            }
            
            const storageRef = ref(storage, `profile-pictures/${this.currentUser.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Update user profile with photo URL
            await updateProfile(this.currentUser, {
                photoURL: downloadURL
            });
            
            return downloadURL;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            return null;
        }
    }
    
    // Add auth state listener
    addAuthStateListener(listener: (user: FirebaseUser | null) => void): void {
        this.authStateListeners.push(listener);
    }
    
    // Remove auth state listener
    removeAuthStateListener(listener: (user: FirebaseUser | null) => void): void {
        this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    }
    
    // Notify all auth state listeners
    private notifyAuthStateListeners(user: FirebaseUser | null): void {
        this.authStateListeners.forEach(listener => listener(user));
    }
    
    // Get current user
    getCurrentUser(): FirebaseUser | null {
        return this.currentUser;
    }
    
    // Get user-friendly error messages
    private getErrorMessage(errorCode: string): string {
        const errorMessages: { [key: string]: string } = {
            'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/user-disabled': 'This account has been disabled. Please contact support.',
            'auth/user-not-found': 'No account found with this email. Please sign up.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Invalid email or password. Please try again.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
        };
        
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }
}

// Create a singleton instance
export const authService = new AuthService();
