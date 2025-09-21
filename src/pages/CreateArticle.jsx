import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Trash2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { createArticle, uploadArticleCover, uploadArticleImages } from '../api/article';
import { getCategories, getProductsByCategory } from '../api/category';
import toast from 'react-hot-toast';

function CreateArticle() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    productIds: [],
    coverImage: null,
    images: [],
    active: true
  });

  const [errors, setErrors] = useState({});

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (formData.categoryId) {
        try {
          const products = await getProductsByCategory(formData.categoryId);
          setCategoryProducts(products);
        } catch (error) {
          console.error('Failed to fetch products:', error);
          setCategoryProducts([]);
        }
      } else {
        setCategoryProducts([]);
      }
    };

    fetchCategoryProducts();
  }, [formData.categoryId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCoverImageChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      coverImage: file
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImagesChange = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length + formData.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagesPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
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
      handleCoverImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({
      ...prev,
      coverImage: null
    }));
    setCoverPreview(null);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      // Create article
      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        productIds: formData.productIds,
        active: formData.active
      };

      const response = await createArticle(articleData);
      const articleId = response.data._id;

      // Upload cover image if provided
      if (formData.coverImage) {
        await uploadArticleCover(articleId, formData.coverImage);
      }

      // Upload article images if provided
      if (formData.images.length > 0) {
        await uploadArticleImages(articleId, formData.images);
      }

      toast.success('Article created successfully!');
      navigate('/blog-management');
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error(error.message || 'Failed to create article');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={() => navigate('/blog-management')}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Create New Article</h1>
                  <p className="text-gray-500 dark:text-gray-400">Write and publish a new blog article</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`form-input w-full text-xl ${
                      errors.title ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="Enter a compelling title for your article"
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                {/* Category and Products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          categoryId: e.target.value,
                          productIds: []
                        }));
                        if (errors.categoryId) {
                          setErrors(prev => ({ ...prev, categoryId: '' }));
                        }
                      }}
                      className={`form-select w-full ${
                        errors.categoryId ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Related Products
                    </label>
                    <select
                      multiple
                      name="productIds"
                      value={formData.productIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({ ...prev, productIds: selected }));
                      }}
                      className="form-multiselect w-full"
                      disabled={isLoading || !formData.categoryId}
                    >
                      {categoryProducts.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Hold Ctrl/Cmd to select multiple products
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Article Content *
                  </label>
                  <div className={`${errors.content ? 'border-2 border-red-500 rounded-lg' : ''}`}>
                    <MDEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value || '' })}
                      preview="edit"
                      hideToolbar={false}
                      height={400}
                      data-color-mode="auto"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.content.length} characters
                  </p>
                </div>

                {/* Cover Image */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Image
                  </label>

                  {coverPreview && (
                    <div className="mb-6 relative group">
                      <div className="relative overflow-hidden rounded-xl shadow-lg">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="absolute top-3 right-3 p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 transform scale-90 hover:scale-100"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image Preview</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Click the × button to remove</p>
                      </div>
                    </div>
                  )}

                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                      dragActive
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverImageChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isLoading}
                    />

                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium">Drop your cover image here, or click to browse</p>
                        <p className="mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Recommended size: 1200x630px for best social media sharing
                  </p>
                </div>

                {/* Article Images */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Article Images
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImagesChange(e.target.files)}
                    className="form-input w-full"
                    disabled={isLoading}
                  />

                  {imagesPreviews.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Article Images ({imagesPreviews.length}/5)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagesPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="relative overflow-hidden rounded-xl shadow-md">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-28 object-cover transition-all duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 transform scale-90 hover:scale-100"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Image {index + 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    You can upload up to 5 images. These will be available to embed in your article content.
                  </p>
                </div>

                {/* Publish Settings */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="form-checkbox text-violet-500"
                    disabled={isLoading}
                  />
                  <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                    Publish article immediately
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/blog-management')}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
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
                      Creating Article...
                    </span>
                  ) : (
                    'Create Article'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateArticle;