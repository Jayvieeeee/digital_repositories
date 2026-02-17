import React from 'react';
import { GraduationCap, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../Layout/AuthLayout';

export default function ChooseRegistrationType() {
  const navigate = useNavigate();

  return (
    <AuthLayout backTo="/login">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-slate-900 mb-3">
            Choose Registration Type
          </h1>
          <p className="text-slate-600 text-lg">
            Select the option that best describes you to get started
          </p>
        </div>

        {/* Registration Type Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">

          {/* Student Card */}
          <div
            onClick={() => navigate('/register-student')}
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-5 rounded-full group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-slate-900 text-center mb-3">
              Register as Student
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-center mb-6 leading-relaxed">
              For students who want to upload their research, browse papers, and request access to research from other institutions.
            </p>

            {/* Features List */}
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Upload your research papers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Browse your school's repository</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Request inter-school access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Track your paper citations</span>
              </li>
            </ul>
          </div>

          {/* Institution Card */}
          <div
            onClick={() => navigate('/register-institution')}
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-5 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-slate-900 text-center mb-3">
              Register as Institution
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-center mb-6 leading-relaxed">
              For schools and universities that want to manage their research repository and collaborate with other institutions.
            </p>

            {/* Features List */}
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Manage school repository</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Create adviser accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Approve student registrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Handle inter-school requests</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Login Link */}
        <p className="text-center text-slate-600">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
          >
            Login here
          </span>
        </p>

      </div>
    </AuthLayout>
  );
}
