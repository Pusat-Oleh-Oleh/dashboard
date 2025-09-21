import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import Transition from '../../utils/Transition';
import toast from 'react-hot-toast';

function AddBannerModal({
  modalOpen,
  setModalOpen,
  onSubmit,
  newBanner,
  setNewBanner,
  isEditing,
  selectedBanner = null,
  isLoading = false
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  const $cdnUrl = import.meta.env.VITE_CDN_URL || 'http://localhost:8000';

  // Initialize preview when modal opens or selectedBanner changes
  useEffect(() => {
    if (modalOpen) {
      if (isEditing && selectedBanner?.url) {
        const normalizedUrl = normalizeUrl(selectedBanner.url);
        setImagePreview(normalizedUrl);
      } else {
        setImagePreview(null);
      }
      setErrors({});
    }
  }, [modalOpen, isEditing, selectedBanner]);

  // Normalize URL function
  const normalizeUrl = (url) => {
    if (!url) return null;

    try {
      const urlObj = new URL(url.replace(/\\/g, "/"));
      const pathname = urlObj.pathname;
      return new URL(pathname, $cdnUrl).toString();
    } catch (e) {
      const cleanPath = url
        .replace(/^(?:https?:)?(?:\/\/)?[^/]+/, '')
        .replace(/\\/g, "/")
        .replace(/^\/+/, '/');
      return `${$cdnUrl}${cleanPath}`;
    }
  };

  const handleImageChange = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB for banners)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setNewBanner({ ...newBanner, banner: file });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors.banner) {
      setErrors(prev => ({ ...prev, banner: '' }));
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageChange(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setNewBanner({ ...newBanner, banner: null });
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Image validation
    if (!newBanner.banner && !isEditing) {
      newErrors.banner = 'Banner image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please select a banner image');
      return;
    }

    onSubmit(e);
  };

  const handleClose = () => {
    setImagePreview(null);
    setErrors({});
    setModalOpen(false);
  };

  return (
    <>
      {/* Modal Backdrop */}
      <Transition
        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 transition-opacity"
        show={modalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <Transition
        className="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6"
        show={modalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-auto max-w-2xl w-full max-h-[90vh]">
          {/* Modal header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {isEditing ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEditing ? 'Update banner image' : 'Upload a new hero banner'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Banner Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Banner Image *
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full max-w-md h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Drag & Drop Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                    dragActive
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } ${errors.banner ? 'border-red-500' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />

                  <div className="text-center">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium text-lg mb-2">Drop your banner image here, or click to browse</p>
                      <p className="text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {errors.banner && (
                  <p className="mt-2 text-sm text-red-600">{errors.banner}</p>
                )}

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Recommended size: 1920x1080px for best quality. Banner will be displayed as hero image on the homepage.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditing ? 'Updating...' : 'Uploading...'}
                    </span>
                  ) : (
                    isEditing ? 'Update Banner' : 'Add Banner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </>
  );
}

export default AddBannerModal;
