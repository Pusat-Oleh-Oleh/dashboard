import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import { getAllArticles, deleteArticle } from '../api/article';
import { getCategories } from '../api/category';
import toast from 'react-hot-toast';

function BlogManagement() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const articlesData = await getAllArticles();
        setArticles(articlesData);
      } catch (error) {
        console.error('Error fetching articles:', error);
        toast.error(error.message || 'Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleCreateArticle = () => {
    navigate('/create-article');
  };

  const handleViewArticle = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  const handleEditArticle = (articleId) => {
    navigate(`/edit-article/${articleId}`);
  };

  const handleDeleteBlog = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(articleId);
        toast.success('Article deleted successfully');
        setArticles(articles.filter(article => article._id !== articleId));
      } catch (error) {
        toast.error(error.message || 'Failed to delete article');
      }
    }
  };

  const truncateText = (text, length) => {
    if (!text) return '';
    return text.length <= length ? text : text.substring(0, length) + '...';
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
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Articles</h1>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <FilterButton align="right" />
                <button className="btn bg-violet-500 hover:bg-violet-600 text-white" onClick={handleCreateArticle}>
                  <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="hidden xs:block ml-2">Add Article</span>
                </button>
              </div>
            </div>

            {/* Articles Grid */}
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                  <div key={article._id} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
                    <div className="relative aspect-video">
                      {article.cover ? (
                        <img
                          src={normalizeUrl(article.cover.url)}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400">No cover image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {truncateText(article.title, 50)}
                        </h2>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Category: {article.categoryId.name}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {truncateText(article.content, 120)}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {article.images?.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={normalizeUrl(image.url)}
                              alt={`Article image ${index + 1}`}
                              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                            />
                          ))}
                          {article.images?.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">
                              +{article.images.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewArticle(article._id)}
                            className="text-blue-500 hover:text-blue-600"
                            title="View Details"
                          >
                            <span className="sr-only">View</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditArticle(article._id)}
                            className="text-violet-500 hover:text-violet-600"
                            title="Edit Article"
                          >
                            <span className="sr-only">Edit</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(article._id)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete Article"
                          >
                            <span className="sr-only">Delete</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

export default BlogManagement;
