import React, { useState } from 'react';
import { Upload, Info, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../Layout/AuthLayout';
import api from '../../api/axios';


export default function InstitutionRegistration() {
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    schoolType: '',
    contactNumber: '',
    emailAddress: '',
    librarianFirstName: '',
    librarianLastName: '',
    emailAddress2: '',
    password: '',
    confirmPassword: ''
  });

  const [certificationFile, setCertificationFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCertificationFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCertificationFile(e.target.files[0]);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const form = new FormData();

    // School Information
    form.append("schoolName", formData.schoolName);
    form.append("schoolAddress", formData.schoolAddress);
    form.append("schoolType", formData.schoolType);
    form.append("contactNumber", formData.contactNumber);
    form.append("emailAddress", formData.emailAddress);

    // Librarian Information
    form.append("librarianFirstName", formData.librarianFirstName);
    form.append("librarianLastName", formData.librarianLastName);
    form.append("emailAddress2", formData.emailAddress2);
    form.append("password", formData.password);
    form.append("password_confirmation", formData.confirmPassword);

    // Required File
    if (certificationFile) {
      form.append("certification_file", certificationFile);
    }

      await api.post("/register-institution", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Institution registration submitted successfully!");
    window.location.href = "/login";

  } catch (error) {
    console.error("Registration error:", error.response?.data || error);

    if (error.response?.data?.errors) {
      alert(Object.values(error.response.data.errors)[0][0]);
    } else {
      alert("Registration failed. Please check your inputs.");
    }
  }
};


  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Institution Registration
            </h1>
            <p className="text-sm text-slate-600">
              Register your school or university to join the research repository network
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Registration Review Process
              </h3>
              <p className="text-xs text-blue-800">
                Your registration will be reviewed by the system administrator. You will be notified via email once your institution is approved.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* School Information */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                School Information
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="e.g., University of San Carlos (76)"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    School Address *
                  </label>
                  <input
                    type="text"
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleInputChange}
                    placeholder="e.g., P. Del Rosario St, Cebu City, 6000 Cebu"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    School Type *
                  </label>
                  <select
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select School Type</option>
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="institute">Institute</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="+63 912 345 6789"
                      className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="library@usc.edu.ph"
                      className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Librarian Information */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Librarian Information
              </h2>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="librarianFirstName"
                    value={formData.librarianFirstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="librarianLastName"
                    value={formData.librarianLastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Proof of Legitimacy */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Proof of Legitimacy
              </h2>

              {/* Certification Upload */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Upload Certification of Recognition or Accreditation *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition cursor-pointer">
                  <input
                    type="file"
                    id="certificationUpload"
                    onChange={handleCertificationFileChange}
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="hidden"
                  />
                  <label htmlFor="certificationUpload" className="cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    {!certificationFile ? (
                      <>
                        <p className="text-sm text-slate-700 font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG, or PDF (max. 10MB)
                        </p>
                      </>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-600 mb-1">File selected:</p>
                        <p className="text-sm text-blue-600 font-medium break-all">
                          {certificationFile.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Click to change file
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>


            </div>

            {/* Account Credentials */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Account Credentials
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="emailAddress2"
                    value={formData.emailAddress2}
                    onChange={handleInputChange}
                    placeholder="librarian@usc.edu.ph"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-teal-700 transition shadow-sm"
            >
              Create Student Account
            </button>

            {/* Login Link */}
            <p className="text-center text-xs text-slate-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login here
              </a>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-slate-500">
              By registering, you agree to the university's{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                User Policy
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Community Guidelines
              </a>
            </p>

          </form>
        </div>
      </div>
    </AuthLayout>
  );
}