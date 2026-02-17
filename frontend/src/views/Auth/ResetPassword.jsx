import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../../Layout/AuthLayout';
import api from '../../api/axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const { email, code } = location.state || {};

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🚨 Redirect if accessed directly
  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!validatePassword(formData.password)) {
      newErrors.password =
        'Password must be 8+ characters with uppercase, lowercase, number and special character.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/reset-password', {
        email,
        code,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      alert(response.data.message);

      navigate('/login', { replace: true });

    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Failed to reset password.'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Create New Password
            </h2>
            <p className="text-sm text-gray-600">
              Your new password must be different from previous passwords
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-50 border ${
                    errors.password ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg focus:ring-2 focus:ring-teal-500 pr-12`}
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword.password ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-50 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg focus:ring-2 focus:ring-teal-500 pr-12`}
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword.confirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-sm text-red-600 text-center">
                {errors.submit}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
