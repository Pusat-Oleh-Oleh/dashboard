import React, { useState, useEffect } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import UserFormModal from '../components/UserFormModal';
import { getAllBuyers, toggleBuyerBan, createBuyer, updateBuyer } from '../api/buyer';
import toast from 'react-hot-toast';
import { Eye, Ban, CheckCircle, ShoppingCart, Calendar, Mail, Phone, TrendingUp, Edit } from 'lucide-react';

function BuyerManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const buyersData = await getAllBuyers();
      setBuyers(buyersData);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch buyers data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle ban/unban
  const handleToggleBan = async (userId) => {
    try {
      const response = await toggleBuyerBan(userId);
      toast.success(response.message);
      // Update local state
      setBuyers(buyers.map(buyer =>
        buyer._id === userId
          ? { ...buyer, isBanned: !buyer.isBanned }
          : buyer
      ));
    } catch (error) {
      toast.error(error.message || 'Failed to update buyer status');
    }
  };

  // Handle view buyer details
  const handleViewBuyer = (buyer) => {
    setSelectedBuyer(buyer);
    setShowModal(true);
  };

  // Handle create buyer
  const handleCreateBuyer = () => {
    setEditingBuyer(null);
    setShowFormModal(true);
  };

  // Handle edit buyer
  const handleEditBuyer = (buyer) => {
    setEditingBuyer(buyer);
    setShowFormModal(true);
  };

  // Handle form submit
  const handleFormSubmit = async (userData) => {
    try {
      setIsFormLoading(true);

      if (editingBuyer) {
        // Update existing buyer
        const response = await updateBuyer(editingBuyer._id, userData);
        toast.success(response.message || 'Buyer updated successfully');

        // Update local state
        setBuyers(buyers.map(buyer =>
          buyer._id === editingBuyer._id
            ? { ...buyer, ...response.user }
            : buyer
        ));
      } else {
        // Create new buyer
        const response = await createBuyer(userData);
        toast.success(response.message || 'Buyer created successfully');

        // Add to local state
        setBuyers([response.user, ...buyers]);
      }

      setShowFormModal(false);
      setEditingBuyer(null);
    } catch (error) {
      toast.error(error.message || `Failed to ${editingBuyer ? 'update' : 'create'} buyer`);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    if (!isFormLoading) {
      setShowFormModal(false);
      setEditingBuyer(null);
    }
  };

  // Filter buyers based on search and status
  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && !buyer.isBanned) ||
                         (statusFilter === 'banned' && buyer.isBanned);
    return matchesSearch && matchesStatus;
  });

  // Get buyer statistics
  const stats = {
    total: buyers.length,
    active: buyers.filter(b => !b.isBanned).length,
    banned: buyers.filter(b => b.isBanned).length,
    newThisMonth: buyers.filter(b => {
      const created = new Date(b.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
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
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Buyer Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage customer accounts and monitor buyer activity</p>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search buyers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-9 py-2"
                  />
                  <div className="absolute inset-0 left-0 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 fill-current text-gray-400 ml-3" viewBox="0 0 16 16">
                      <path d="m11.742 10.344 6.814 6.814a1 1 0 0 1-1.414 1.414l-6.814-6.814a6 6 0 1 1 1.414-1.414ZM5 10a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
                    </svg>
                  </div>
                </div>
                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
                {/* Add buyer button */}
                <button
                  onClick={handleCreateBuyer}
                  className="btn bg-violet-500 hover:bg-violet-600 text-white"
                >
                  <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="hidden xs:block ml-2">Add Buyer</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg mr-3">
                    <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Buyers</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Buyers</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.active}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg mr-3">
                    <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Banned Buyers</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.banned}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.newThisMonth}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyers Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                  Buyers <span className="text-gray-400 dark:text-gray-500 font-medium">({filteredBuyers.length} of {buyers.length})</span>
                </h2>
              </header>
              <div className="p-3">
                {isLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full dark:text-gray-300">
                      <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
                        <tr>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Buyer Info</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Contact</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Join Date</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Status</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-right">Actions</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredBuyers.map((buyer) => {
                          return (
                            <tr key={buyer._id}>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                                    <img
                                      className="rounded-full"
                                      src={buyer.image?.url || "https://via.placeholder.com/40x40"}
                                      width="40"
                                      height="40"
                                      alt={buyer.name}
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-800 dark:text-gray-100">
                                      {buyer.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {buyer._id.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div>
                                  <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                                    {buyer.email}
                                  </div>
                                  {buyer.phoneNumber && (
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <Phone className="w-4 h-4 mr-1 text-gray-400" />
                                      {buyer.phoneNumber}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div className="flex items-center text-sm">
                                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                  {buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                                {buyer.createdAt && (
                                  <div className="text-xs text-gray-500">
                                    {Math.floor((new Date() - new Date(buyer.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                                  </div>
                                )}
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${
                                  buyer.isBanned
                                    ? 'bg-red-100 dark:bg-red-400/30 text-red-600 dark:text-red-400'
                                    : 'bg-emerald-100 dark:bg-emerald-400/30 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {buyer.isBanned ? 'Banned' : 'Active'}
                                </div>
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleViewBuyer(buyer)}
                                    className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 rounded"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditBuyer(buyer)}
                                    className="p-1 text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400 rounded"
                                    title="Edit Buyer"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleBan(buyer._id)}
                                    className={`p-1 rounded ${
                                      buyer.isBanned
                                        ? 'text-green-500 hover:text-green-600 dark:text-green-400'
                                        : 'text-red-500 hover:text-red-600 dark:text-red-400'
                                    }`}
                                    title={buyer.isBanned ? 'Unban Buyer' : 'Ban Buyer'}
                                  >
                                    {buyer.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Buyer Details Modal */}
      {showModal && selectedBuyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Buyer Details: {selectedBuyer.name}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Buyer Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
                    Personal Information
                  </h4>
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedBuyer.image?.url || "https://via.placeholder.com/80x80"}
                      alt={selectedBuyer.name}
                      className="w-20 h-20 rounded-full"
                    />
                    <div className="flex-1">
                      <h5 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                        {selectedBuyer.name}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400">{selectedBuyer.email}</p>
                      {selectedBuyer.phoneNumber && (
                        <p className="text-gray-600 dark:text-gray-400">{selectedBuyer.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500 dark:text-gray-400">Status</label>
                      <p className={`font-medium ${
                        selectedBuyer.isBanned ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedBuyer.isBanned ? 'Banned' : 'Active'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-gray-400">User ID</label>
                      <p className="font-mono text-gray-800 dark:text-gray-100 text-xs">{selectedBuyer._id}</p>
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-gray-400">Role</label>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedBuyer.role}</p>
                    </div>
                    {selectedBuyer.createdAt && (
                      <div>
                        <label className="text-gray-500 dark:text-gray-400">Joined</label>
                        <p className="text-gray-800 dark:text-gray-100">
                          {new Date(selectedBuyer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
                    Account Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Age</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {selectedBuyer.createdAt
                          ? Math.floor((new Date() - new Date(selectedBuyer.createdAt)) / (1000 * 60 * 60 * 24))
                          : 0} days
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className={`text-lg font-semibold ${
                        selectedBuyer.isBanned ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedBuyer.isBanned ? 'Banned' : 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditBuyer(selectedBuyer);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                >
                  Edit Buyer
                </button>
                <button
                  onClick={() => {
                    handleToggleBan(selectedBuyer._id);
                    setShowModal(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedBuyer.isBanned
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {selectedBuyer.isBanned ? 'Unban Buyer' : 'Ban Buyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      <UserFormModal
        isOpen={showFormModal}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        user={editingBuyer}
        userType="buyer"
        isLoading={isFormLoading}
      />
    </div>
  );
}

export default BuyerManagement;
