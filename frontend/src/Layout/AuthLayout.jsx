import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ECF9FC] to-[#FFFFFF] px-6 py-12">
      <div className="w-full max-w-8xl">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 pl-12 hover:text-gray-500 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">Back</span>
        </button>
        
        {children}

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-16">
          By registering, you agree to the university's{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Usage Policy
          </a>{' '}
          and Academic Integrity Guidelines
        </p>

      </div>
    </div>
  );
}
