import React, { useState } from 'react';
import { Upload, Link, FileText, Video, X } from 'lucide-react';
import { UploadFormData } from '../../types/faculty';

interface ResourceUploadProps {
  onUpload: (data: UploadFormData) => Promise<void>;
}

export const ResourceUpload = ({ onUpload }: ResourceUploadProps) => {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    type: 'document',
    subject: '',
    semester: 1,
    file: undefined,
    link: '',
  });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpload(formData);
    // Reset form after successful upload
    setFormData({
      title: '',
      description: '',
      type: 'document',
      subject: '',
      semester: 1,
      file: undefined,
      link: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Resource</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as UploadFormData['type'] })}
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="note">Note</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.type === 'link' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">Resource Link</label>
            <input
              type="url"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>
        ) : (
          <div
            className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-300" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormData({ ...formData, file: e.target.files[0] });
                      }
                    }}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PDF, DOC, or Video files up to 50MB
              </p>
            </div>
          </div>
        )}

        {formData.file && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              {formData.type === 'video' ? (
                <Video className="h-5 w-5 text-gray-400" />
              ) : (
                <FileText className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">{formData.file.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, file: undefined })}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upload Resource
          </button>
        </div>
      </form>
    </div>
  );
};