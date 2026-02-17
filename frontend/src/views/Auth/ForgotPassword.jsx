import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../Layout/AuthLayout';
import api from '../../api/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setMessage('');

  try {
    const response = await api.post('/send-reset-code',
      { email }
    );

    console.log("STATUS:", response.status);

    if (response.status === 200) {
      navigate('/verify-code', {
        state: { email },
        replace: true
      });
    }

  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);

    if (err.response?.status === 429) {
      setError("Please wait 1 minute before requesting again.");
    } else if (err.response?.status === 422) {
      setError("Email does not exist.");
    } else {
      setError("Something went wrong.");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <AuthLayout>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-sm text-gray-600">
              Enter your email address to receive a verification code
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to Login
              </button>
            </div>

          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
