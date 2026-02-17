import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../Layout/AuthLayout';
import api from '../../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post("/login", {
      email,
      password,
    });

    // Save token
    localStorage.setItem("token", response.data.token);

    // Optional: Save user info
    localStorage.setItem("user", JSON.stringify(response.data.user));

    console.log("Login successful:", response.data);

    // Redirect to dashboard
    navigate("/student-dashboard");

  } catch (error) {
    console.error("Login failed:", error.response?.data);
    alert(error.response?.data?.message);
  }
};


  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl shadow-lg px-12 py-8 max-w-xl mx-auto">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-5 rounded-full">
            <GraduationCap className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-center text-slate-900 mb-2">
          Login to Repository
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Access your research repository account
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Email / Username
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md mt-6"
          >
            Log In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 py-2 bg-white text-gray-500">
              DON'T HAVE AN ACCOUNT?
            </span>
          </div>
        </div>

        {/* Register Button */}
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-white border-2 border-gray-200 text-slate-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Create New Account
        </button>

      </div>
    </AuthLayout>
  );
}
