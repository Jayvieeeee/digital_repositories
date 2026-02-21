import { useState, useRef } from "react";
import { IoCloseOutline, IoCloudUploadOutline } from "react-icons/io5";

export default function UploadResearchModal({ isOpen, onClose, onSubmitSuccess }) {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    keywords: "",
    adviser: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setForm((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.abstract || !form.keywords || !form.file) {
      return alert("Please fill in all required fields and attach a file.");
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("abstract", form.abstract);
    formData.append("keywords", form.keywords);
    formData.append("adviser", form.adviser);
    formData.append("file", form.file);

    setUploading(true);
    try {
      // Replace with your actual API call
      // await api.post("/student/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Research submitted successfully!");
      setForm({ title: "", abstract: "", keywords: "", adviser: "", file: null });
      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              name="abstract"
              placeholder="Enter abstract (250 - 500 words)"
              value={form.abstract}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Adviser */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Adviser
            </label>
            <input
              type="text"
              name="adviser"
              placeholder="Mr. Jayson Narez"
              value={form.adviser}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              PDF Upload (Max 50 MB) <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-md px-4 py-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
              }`}
            >
              <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mb-2" />
              {form.file ? (
                <p className="text-xs text-teal-700 font-medium">{form.file.name}</p>
              ) : (
                <>
                  <p className="text-xs text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, or PDF (max: 50MB)</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="bg-[#134F4F] hover:bg-[#1F606B] text-white text-sm font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-60"
          >
            {uploading ? "Submitting..." : "Submit Research"}
          </button>
        </div>
      </div>
    </div>
  );
}