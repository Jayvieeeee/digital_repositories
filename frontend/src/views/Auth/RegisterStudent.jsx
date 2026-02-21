import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import AuthLayout from '../../Layout/AuthLayout';
import api from '../../api/axios';

export default function StudentRegistration() {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    university: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [file, setFile] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // 🔹 Fetch schools from database
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await api.get('/schools');
        setSchools(response.data);
      } catch (error) {
        console.error("Failed to load schools:", error);
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();

      form.append("first_name", formData.firstName);
      form.append("last_name", formData.lastName);
      form.append("email", formData.email);
      form.append("password", formData.password);
      form.append("password_confirmation", formData.confirmPassword);
      form.append("role", "student");
      form.append("school_id", formData.university);

      if (file) {
        form.append("verification_document", file);
      }

      await api.post("/register-student", form);

      alert("Registration successful!");
      window.location.href = "/login";

    } catch (error) {
      console.error("Error during registration:", error.response?.data);
      alert(
        error.response?.data?.message ||
        "An error occurred during registration. Please try again."
      );
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-3xl shadow-lg p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Student Registration
            </h1>
            <p className="text-slate-600">
              Create your student account to access the research repository
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Personal Information */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-gray-200">
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="First Name"
                />

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Last Name"
                />
              </div>
            </div>

            {/* School Information */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-gray-200">
                School Information
              </h2>

              <select
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                disabled={loadingSchools}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {loadingSchools ? "Loading universities..." : "Select your University"}
                </option>

                {schools.map((school) => (
                  <option key={school.school_id} value={school.school_id}>
                    {school.school_name}
                  </option>
                ))}
              </select>

              <p className="text-xs text-slate-500 mt-2">
                Can't find your school? Ask your institution to register first.
              </p>

              {/* File Upload */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Upload Student ID or Registration Form (RF) *
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="hidden"
                  />

                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />

                    {!file ? (
                      <>
                        <p className="text-slate-700 font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG, or PDF (max. 10MB)
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 mb-1">File selected:</p>
                        <p className="text-base text-blue-600 font-medium break-all">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Click to change file
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Account Credentials */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-gray-200">
                Account Credentials
              </h2>

              <div className="space-y-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email Address"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
            >
              Register
            </button>

            <p className="text-center text-slate-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Login here
              </a>
            </p>

          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
