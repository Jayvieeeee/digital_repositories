import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('').slice(0, 6);
    
    setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newCode.length < 6 ? newCode.length : 5;
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) return;

    setLoading(true);
    try {
      console.log('Verifying code:', verificationCode);
      // Add your verification logic here
      // await verifyCode(verificationCode);
      // navigate('/reset-password');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    console.log('Resending code...');
    // Add resend logic here
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            email@gmail.com
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-6">
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
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || code.join('').length !== 6}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>

        {/* Resend Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">Didn't receive code? </span>
          <button
            onClick={handleResend}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Resend Code
          </button>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center mt-8">
          By registering, you agree to the collection of{' '}
          <button className="text-teal-600 hover:underline">
            Usage Policy
          </button>
          {' '}and{' '}
          <button className="text-teal-600 hover:underline">
            Accidents Integrity Guidelines
          </button>
          .
        </p>
      </div>
    </div>
  );
}