import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Tag, Package, Edit, Trash2, Eye } from 'lucide-react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { getAllArticles, deleteArticle } from '../api/article';
import toast from 'react-hot-toast';

function ArticleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const $cdnUrl = import.meta.env.VITE_CDN_URL || 'http://localhost:9000';

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

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const articlesData = await getAllArticles();
        const foundArticle = articlesData.find(a => a._id === id);

        if (!foundArticle) {
          toast.error('Article not found');
          navigate('/blog-management');
          return;
        }

        setArticle(foundArticle);
      } catch (error) {
        console.error('Failed to fetch article:', error);
        toast.error('Failed to load article');
        navigate('/blog-management');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/edit-article/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteArticle(id);
      toast.success('Article deleted successfully');
      navigate('/blog-management');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error(error.message || 'Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="grow flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-r-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/blog-management')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Article Details</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage article content</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 text-violet-600 hover:text-violet-700 border border-violet-300 hover:border-violet-400 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {/* Cover Image */}
              {article.cover?.url && (
                <div className="relative h-64 md:h-80 overflow-hidden group">
                  <img
                    src={normalizeUrl(article.cover.url)}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
                      <p className="text-white text-sm font-medium opacity-90">Article Cover</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Article Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      <Eye className="w-3 h-3 mr-1" />
                      {article.active ? 'Published' : 'Draft'}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(article.createdAt)}
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {article.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      <span className="font-medium">Category:</span>
                      <span className="ml-1 px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded">
                        {article.categoryId?.name || 'No Category'}
                      </span>
                    </div>

                    {article.productIds?.length > 0 && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        <span className="font-medium">Related Products:</span>
                        <span className="ml-1">{article.productIds.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {article.content}
                  </div>
                </div>

                {/* Article Images */}
                {article.images?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                      Article Images
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {article.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <img
                              src={normalizeUrl(image.url)}
                              alt={`Article image ${index + 1}`}
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <div className="backdrop-blur-sm bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                                <p className="text-white text-xs font-medium">Image {index + 1}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Products */}
                {article.productIds?.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Related Products
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {article.productIds.map((product) => (
                        <div key={product._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.description && product.description.length > 100
                              ? `${product.description.substring(0, 100)}...`
                              : product.description
                            }
                          </p>
                          {product.price && (
                            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-2">
                              Rp {product.price.toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Metadata */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{formatDate(article.createdAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2">{formatDate(article.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ArticleDetail;