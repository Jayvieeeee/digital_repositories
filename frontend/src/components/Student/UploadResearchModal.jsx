import { useState, useRef } from "react";
import { IoCloseOutline, IoCloudUploadOutline } from "react-icons/io5";
import api from "../../api/axios";

export default function UploadResearchModal({ isOpen, onClose, onSubmitSuccess }) {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    keywords: "",
    document_type: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.abstract.trim()) newErrors.abstract = "Abstract is required";
    if (form.abstract.trim().split(/\s+/).length < 50) {
      newErrors.abstract = "Abstract should be at least 50 words";
    }
    if (!form.keywords.trim()) newErrors.keywords = "Keywords are required";
    if (!form.document_type) newErrors.document_type = "Document type is required";
    if (!form.file) {
      newErrors.file = "PDF file is required";
    } else if (form.file.size > 50 * 1024 * 1024) { // 50MB limit
      newErrors.file = "File size must be less than 50MB";
    } else if (form.file.type !== 'application/pdf') {
      newErrors.file = "Only PDF files are allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, file }));
      if (errors.file) setErrors((prev) => ({ ...prev, file: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("abstract", form.abstract.trim());
    formData.append("keywords", form.keywords.trim());
    formData.append("pdf", form.file); 
    formData.append("document_type", form.document_type);
    
    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await api.post("/research-papers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        timeout: 300000 // 5 minutes timeout
      });

      console.log('Upload successful:', response.data);
      
      // Show success message
      alert("Research submitted successfully! Processing will continue in the background.");
      
      // Reset form
      setForm({ title: "", abstract: "", keywords: "", document_type: "", file: null });
      setErrors({});
      
      // Call success callback and close modal
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
      onClose();

    } catch (err) {
      console.error('Upload error details:', err);
      
      // Handle different error types
      let errorMessage = "Upload failed. ";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += "The request timed out. Please try again with a smaller file.";
      } else if (err.response) {
        // The request was made and the server responded with a status code
        errorMessage += err.response.data?.message || err.response.statusText;
        console.error('Server response:', err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request
        errorMessage += err.message;
      }
      
      alert(errorMessage);
      
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Upload Research</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            disabled={uploading}
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Research Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Research Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter Research Title"
              value={form.title}
              onChange={handleChange}
              className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              disabled={uploading}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              name="abstract"
              placeholder="Enter abstract (minimum 50 words)"
              value={form.abstract}
              onChange={handleChange}
              rows={4}
              className={`w-full border ${errors.abstract ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none`}
              disabled={uploading}
            />
            {errors.abstract && (
              <p className="text-xs text-red-500 mt-1">{errors.abstract}</p>
            )}
          </div>

          {/* Keywords / Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Keywords / Tags <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="keywords"
              placeholder="e.g., Machine Learning, AI, Healthcare"
              value={form.keywords}
              onChange={handleChange}
              className={`w-full border ${errors.keywords ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              disabled={uploading}
            />
            {errors.keywords && (
              <p className="text-xs text-red-500 mt-1">{errors.keywords}</p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Document Type <span className="text-red-500">*</span>
              </label>

              <select
                name="document_type"
                value={form.document_type}
                onChange={handleChange}
                className={`w-full border ${errors.document_type ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                disabled={uploading}
              >
                <option value="">Select Document Type</option>
                <option value="thesis">Thesis</option>
                <option value="capstone">Capstone</option>
                <option value="journal">Journal</option>
                <option value="article">Article</option>
              </select>
              {errors.document_type && (
                <p className="text-xs text-red-500 mt-1">{errors.document_type}</p>
              )}
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              PDF Upload (Max 50 MB) <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); !uploading && setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-md px-4 py-6 flex flex-col items-center justify-center transition-colors ${
                dragOver
                  ? "border-teal-500 bg-teal-50"
                  : errors.file
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
              } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <IoCloudUploadOutline className={`w-8 h-8 mb-2 ${errors.file ? 'text-red-400' : 'text-gray-400'}`} />
              {form.file ? (
                <div className="text-center">
                  <p className="text-xs text-teal-700 font-medium">{form.file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(form.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF (max: 50MB)</p>
                </>
              )}
            </div>
            {errors.file && (
              <p className="text-xs text-red-500 mt-1">{errors.file}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              name="file"     
              accept=".pdf"
              onChange={handleChange}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="bg-[#134F4F] hover:bg-[#1F606B] text-white text-sm font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? `Uploading ${uploadProgress}%...` : "Submit Research"}
          </button>
        </div>
      </div>
    </div>
  );
}