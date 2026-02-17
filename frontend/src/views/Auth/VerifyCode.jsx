import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../Layout/AuthLayout';
import axios from '../../api/axios'; // adjust if needed

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // 🚨 If email missing (page refreshed), redirect back
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;

    const newCode = [...code];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });

    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/verify-reset-code', {
        email,
        code: verificationCode,
      });

      // ✅ pass STRING code not array
      navigate('/reset-password', {
        state: { email, code: verificationCode },
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setError('');
      await axios.post('/resend-reset-code', { email });
      alert('New code sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {email}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Code Inputs */}
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            {/* Resend */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Didn't receive code?{' '}
              </span>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Resend Code
              </button>
            </div>

          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
