import { useState } from 'react';
import { authService } from '../firebase/auth';

interface EmailVerificationNoticeProps {
  userEmail: string;
  onResendSuccess?: () => void;
}

export default function EmailVerificationNotice({ userEmail, onResendSuccess }: EmailVerificationNoticeProps) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    setIsSending(true);
    setMessage('');
    
    const result = await authService.resendVerificationEmail();
    setMessage(result.message);
    setIsSending(false);
    
    if (result.success && onResendSuccess) {
      onResendSuccess();
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        {/* Email Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px'
        }}>
          📧
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '15px'
        }}>
          Verify Your Email
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.6',
          marginBottom: '30px'
        }}>
          We sent a verification link to<br />
          <strong style={{ color: '#667eea' }}>{userEmail}</strong>
        </p>

        {/* Instructions */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '12px'
          }}>
            📋 Next Steps:
          </h3>
          <ol style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>Check your email inbox</li>
            <li>Click the verification link</li>
            <li>Return here and log in</li>
          </ol>
        </div>

        {/* Tip */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '25px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>💡 Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResendEmail}
          disabled={isSending}
          style={{
            width: '100%',
            padding: '14px',
            background: isSending ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isSending ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            transition: 'all 0.3s ease'
          }}
        >
          {isSending ? '📤 Sending...' : '📨 Resend Verification Email'}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🚪 Back to Login
        </button>

        {/* Message */}
        {message && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: message.includes('sent') ? '#d4edda' : '#f8d7da',
            color: message.includes('sent') ? '#155724' : '#721c24',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
