import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import ShopCategory from './pages/ShopCategory';
import SellerManagement from './pages/SellerManagement';
import BuyerManagement from './pages/BuyerManagement';
import AdminManagement from './pages/AdminManagement';
import VoucherManagement from './pages/VoucherManagement';
import BlogManagement from './pages/BlogManagement';
import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import ArticleDetail from './pages/ArticleDetail';
import NotificationManagement from './pages/NotificationManagement';
import AdminProfile from './pages/AdminProfile';
import BannerManagement from './pages/BannerManagement';
import Login from './pages/Login';
import AdminRoute from './components/AdminRoute';

import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
    <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />
        
        <Route path="/dashboard" element={
          <AdminRoute>
            <Navigate to="/" replace />
          </AdminRoute>
        } />

        <Route path="/category" element={
          <AdminRoute>
            <ShopCategory />
          </AdminRoute>
        } />

        <Route path="/seller" element={
          <AdminRoute>
            <SellerManagement />
          </AdminRoute>
        } />

        <Route path="/buyer" element={
          <AdminRoute>
            <BuyerManagement />
          </AdminRoute>
        } />

        <Route path="/admin-management" element={
          <AdminRoute>
            <AdminManagement />
          </AdminRoute>
        } />

        <Route path="/voucher" element={
          <AdminRoute>
            <VoucherManagement />
          </AdminRoute>
        } />

        <Route path="/blog-management" element={
          <AdminRoute>
            <BlogManagement />
          </AdminRoute>
        } />

        <Route path="/create-article" element={
          <AdminRoute>
            <CreateArticle />
          </AdminRoute>
        } />

        <Route path="/edit-article/:id" element={
          <AdminRoute>
            <EditArticle />
          </AdminRoute>
        } />

        <Route path="/article/:id" element={
          <AdminRoute>
            <ArticleDetail />
          </AdminRoute>
        } />

        {/* Legacy blog route redirect */}
        <Route path="/blog" element={
          <AdminRoute>
            <Navigate to="/blog-management" replace />
          </AdminRoute>
        } />

        <Route path="/notification" element={
          <AdminRoute>
            <NotificationManagement />
          </AdminRoute>
        } />

        <Route path="/profile" element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        } />

        <Route path="/admin-profile" element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        } />


        <Route path="/banner" element={
          <AdminRoute>
            <BannerManagement />
          </AdminRoute>
        } />

        {/* Catch all - replace with 404 component if you want */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
