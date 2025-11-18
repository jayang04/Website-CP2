import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

export default function Profile() {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update display name
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }

      // Update email if changed
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await updatePassword(user, formData.newPassword);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-5xl font-bold shadow-xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{getInitials(formData.displayName || 'User')}</span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{formData.displayName || 'User Profile'}</h1>
          <p className="text-xl text-gray-600">{user?.email}</p>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-8 p-4 rounded-lg border font-medium ${
            message.type === 'success' 
              ? 'bg-green-100 border-green-300 text-green-800' 
              : 'bg-red-100 border-red-300 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all focus:outline-none focus:ring-4"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col">
                  <label htmlFor="displayName" className="text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 text-white rounded-lg text-base font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(prev => ({ 
                        ...prev, 
                        displayName: user?.displayName || '',
                        email: user?.email || '',
                        currentPassword: '', 
                        newPassword: '', 
                        confirmPassword: '' 
                      }));
                    }}
                    className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6">
                <div className="info-item">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  <p className="text-lg text-gray-900">{formData.displayName || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Email Address
                  </label>
                  <p className="text-lg text-gray-900">{user?.email}</p>
                </div>
                <div className="info-item">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Account Created
                  </label>
                  <p className="text-lg text-gray-900">
                    {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="info-item">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Last Sign In
                  </label>
                  <p className="text-lg text-gray-900">
                    {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Account Statistics Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <span className="text-4xl">🏥</span>
                <div>
                  <p className="text-xl font-bold text-blue-600">Active</p>
                  <p className="text-sm text-gray-600">Account Status</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <span className="text-4xl">🔐</span>
                <div>
                  <p className="text-xl font-bold text-blue-600">Email</p>
                  <p className="text-sm text-gray-600">Sign In Method</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
