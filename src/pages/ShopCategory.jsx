import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import CategoryFormModal from '../components/CategoryFormModal';
import { getAllCategories, addNewCategory, updateCategory, deleteCategory } from '../api/category';
import toast from 'react-hot-toast';

function ShopCategory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const $cdnUrl = import.meta.env.VITE_CDN_URL || 'http://localhost:8000';

  const normalizeUrl = useCallback(
    (url) => {
      if (!url) return null;
      
      try {
        // Buat URL object untuk parsing
        const urlObj = new URL(url.replace(/\\/g, "/"));
        
        // Ambil pathname dari URL (bagian setelah host)
        const pathname = urlObj.pathname;
        
        // Gabungkan dengan CDN URL
        return new URL(pathname, $cdnUrl).toString();
      } catch (e) {
        // Jika URL invalid, coba cara alternatif
        const cleanPath = url
          .replace(/^(?:https?:)?(?:\/\/)?[^/]+/, '') // Hapus protocol dan host (perbaikan escape character)
          .replace(/\\/g, "/")                         // Normalize slashes
          .replace(/^\/+/, '/');                       // Pastikan hanya ada satu leading slash

        return `${$cdnUrl}${cleanPath}`;
      }
    },
    [$cdnUrl]
  );

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleSubmitCategory = async (categoryData) => {
    try {
      setIsSubmitting(true);

      if (selectedCategory?._id) {
        await updateCategory(selectedCategory._id, categoryData);
        toast.success('Category updated successfully');
      } else {
        await addNewCategory(categoryData);
        toast.success('Category added successfully');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) {
      toast.error('Invalid category ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error(error.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Shop Categories</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage product categories and their details</p>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <button className="btn bg-violet-500 hover:bg-violet-600 text-white" onClick={handleAddCategory}>
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:block ml-2">Add Category</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">All Categories</h2>
              </header>
              <div className="p-3">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="table-auto w-full dark:text-gray-300">
                    {/* Table header */}
                    <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/20">
                      <tr>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-left">Image</div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-left">Name</div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-left">Description</div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-right">Actions</div>
                        </th>
                      </tr>
                    </thead>
                    {/* Table body */}
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                      {categories
                        .filter(category =>
                          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          category.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(category => (
                        <tr key={category._id}>
                          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {category.image?.url ? (
                                <img
                                  src={normalizeUrl(category.image.url)}
                                  alt={category.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-800 dark:text-gray-100">
                              {category.name}
                            </div>
                          </td>
                          <td className="px-2 first:pl-5 last:pr-5 py-3">
                            <div className="text-left max-w-xs truncate text-gray-600 dark:text-gray-400">
                              {category.description}
                            </div>
                          </td>
                          <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="text-violet-500 hover:text-violet-600 transition-colors"
                                title="Edit Category"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                                title="Delete Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {categories.filter(category =>
                        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        category.description.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-2 first:pl-5 last:pr-5 py-8 text-center">
                            <div className="text-gray-500 dark:text-gray-400">
                              {searchTerm ? 'No categories found matching your search.' : 'No categories yet.'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Category Modal */}
      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitCategory}
        category={selectedCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default ShopCategory;
