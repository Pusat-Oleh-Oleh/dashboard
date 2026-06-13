import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Supported courier codes (sama dengan rajaongkir.js backend) ────────────
const COURIER_OPTIONS = [
  { code: 'jne',      label: 'JNE' },
  { code: 'pos',      label: 'POS Indonesia' },
  { code: 'tiki',     label: 'TIKI' },
  { code: 'jnt',      label: 'J&T Express' },
  { code: 'sicepat',  label: 'SiCepat' },
  { code: 'anteraja', label: 'AnterAja' },
  { code: 'ninja',    label: 'Ninja Xpress' },
  { code: 'lion',     label: 'Lion Parcel' },
  { code: 'idl',      label: 'IDL' },
  { code: 'rex',      label: 'REX' },
];

const emptyForm = { name: '', code: '', receiptSecret: '', cost: '' };

function CourierManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Cek ongkir state
  const [ongkirForm, setOngkirForm] = useState({ origin: '', destination: '', weight: '' });
  const [ongkirLoading, setOngkirLoading] = useState(false);
  const [ongkirResults, setOngkirResults] = useState(null);

  // ─── Get token ───────────────────────────────────────────────────────────
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  // ─── Fetch couriers ───────────────────────────────────────────────────────
  const fetchCouriers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/courier`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCouriers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Gagal memuat data kurir');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCouriers(); }, [fetchCouriers]);

  // ─── Open modal ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setForm({ name: c.name, code: c.code, receiptSecret: c.receiptSecret || '', cost: c.cost || '' });
    setIsEditing(c._id);
    setModalOpen(true);
  };

  // ─── Submit form ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error('Nama dan kode kurir wajib diisi');
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading(isEditing ? 'Memperbarui kurir...' : 'Menambah kurir...');
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/courier/update/${isEditing}`, form, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success('Kurir berhasil diperbarui', { id: toastId });
      } else {
        await axios.post(`${API_URL}/courier/create`, form, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success('Kurir berhasil ditambahkan', { id: toastId });
      }
      setModalOpen(false);
      fetchCouriers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Toggle status ────────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    const toastId = toast.loading('Mengubah status...');
    try {
      await axios.patch(`${API_URL}/courier/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success('Status kurir diperbarui', { id: toastId });
      fetchCouriers();
    } catch {
      toast.error('Gagal mengubah status', { id: toastId });
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus kurir "${name}"?`)) return;
    const toastId = toast.loading('Menghapus...');
    try {
      await axios.delete(`${API_URL}/courier/delete/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success('Kurir berhasil dihapus', { id: toastId });
      fetchCouriers();
    } catch {
      toast.error('Gagal menghapus kurir', { id: toastId });
    }
  };

  // ─── Cek Ongkir ───────────────────────────────────────────────────────────
  const handleCekOngkir = async (e) => {
    e.preventDefault();
    if (!ongkirForm.origin || !ongkirForm.destination || !ongkirForm.weight) {
      toast.error('Isi semua field cek ongkir terlebih dahulu');
      return;
    }
    setOngkirLoading(true);
    setOngkirResults(null);
    try {
      const res = await axios.post(
        `${API_URL}/courier/cost`,
        { origin: ongkirForm.origin, destination: ongkirForm.destination, weight: parseInt(ongkirForm.weight) },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setOngkirResults(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghitung ongkir');
    } finally {
      setOngkirLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-8">

            {/* ── Page Header ── */}
            <div className="sm:flex sm:justify-between sm:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Manajemen Kurir
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Kelola daftar kurir & cek ongkos kirim via RajaOngkir
                </p>
              </div>
              <button
                onClick={openAdd}
                className="mt-4 sm:mt-0 btn bg-violet-500 hover:bg-violet-600 text-white flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                </svg>
                Tambah Kurir
              </button>
            </div>

            {/* ── Courier Table ── */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                  Daftar Kurir
                  <span className="ml-2 text-gray-400 dark:text-gray-500 font-medium text-sm">
                    {couriers.length} kurir
                  </span>
                </h2>
              </header>
              <div className="p-3 overflow-x-auto">
                {loading ? (
                  <div className="text-center py-10 text-gray-400">Memuat data kurir...</div>
                ) : couriers.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    Belum ada kurir. Tambah kurir terlebih dahulu.
                  </div>
                ) : (
                  <table className="table-auto w-full dark:text-gray-300 text-sm">
                    <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/20">
                      <tr>
                        <th className="px-3 py-3 text-left">Nama Kurir</th>
                        <th className="px-3 py-3 text-left">Kode</th>
                        <th className="px-3 py-3 text-left">Biaya Default</th>
                        <th className="px-3 py-3 text-left">Status</th>
                        <th className="px-3 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {couriers.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                          <td className="px-3 py-3">
                            <div className="font-medium text-gray-800 dark:text-gray-100">{c.name}</div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded text-xs font-mono uppercase">
                              {c.code}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
                            {c.cost ? `Rp${Number(c.cost).toLocaleString('id-ID')}` : '—'}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => handleToggle(c._id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                c.isActive
                                  ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-400 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {c.isActive ? '● Aktif' : '○ Nonaktif'}
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEdit(c)}
                                className="text-gray-400 hover:text-violet-500 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(c._id, c.name)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Hapus"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* ── Cek Ongkir ── */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Cek Ongkos Kirim (RajaOngkir)</h2>
                <p className="text-xs text-gray-400 mt-0.5">Hitung ongkir real-time menggunakan semua kurir yang didukung</p>
              </header>
              <div className="p-5">
                <form onSubmit={handleCekOngkir} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Kota Asal
                    </label>
                    <input
                      type="text"
                      value={ongkirForm.origin}
                      onChange={(e) => setOngkirForm(p => ({ ...p, origin: e.target.value }))}
                      placeholder="Contoh: Jakarta Barat"
                      className="form-input w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Kota Tujuan
                    </label>
                    <input
                      type="text"
                      value={ongkirForm.destination}
                      onChange={(e) => setOngkirForm(p => ({ ...p, destination: e.target.value }))}
                      placeholder="Contoh: Bandung"
                      className="form-input w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Berat (gram)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={ongkirForm.weight}
                        onChange={(e) => setOngkirForm(p => ({ ...p, weight: e.target.value }))}
                        placeholder="1000"
                        className="form-input flex-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={ongkirLoading}
                        className="btn bg-violet-500 hover:bg-violet-600 text-white text-sm px-4 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {ongkirLoading ? '...' : 'Cek'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Ongkir Results */}
                {ongkirResults && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Hasil untuk {ongkirResults.origin} → {ongkirResults.destination} ({ongkirResults.weight?.toLocaleString('id-ID')}g) —{' '}
                      <span className="font-medium">{ongkirResults.results?.length || 0} layanan</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table-auto w-full text-sm dark:text-gray-300">
                        <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/20">
                          <tr>
                            <th className="px-3 py-2 text-left">Kurir</th>
                            <th className="px-3 py-2 text-left">Layanan</th>
                            <th className="px-3 py-2 text-left">Deskripsi</th>
                            <th className="px-3 py-2 text-left">ETD</th>
                            <th className="px-3 py-2 text-right">Ongkir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {(ongkirResults.results || []).map((r, i) => (
                            <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors ${i === 0 ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  {i === 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 rounded font-medium">
                                      Termurah
                                    </span>
                                  )}
                                  <span className="font-medium text-gray-800 dark:text-gray-100">{r.courier}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium">
                                  {r.service}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{r.description || '—'}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">
                                {r.etd && r.etd !== '-' ? `${r.etd} hari` : '—'}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="font-semibold text-violet-600 dark:text-violet-400">
                                  Rp{Number(r.cost).toLocaleString('id-ID')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {isEditing ? 'Edit Kurir' : 'Tambah Kurir Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Kurir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: JNE Express"
                  className="form-input w-full rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-100 px-3 py-2"
                  required
                />
              </div>

              {/* Kode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kode Kurir (RajaOngkir) <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.code}
                  onChange={(e) => {
                    const selected = COURIER_OPTIONS.find(c => c.code === e.target.value);
                    setForm(p => ({
                      ...p,
                      code: e.target.value,
                      name: p.name || (selected?.label ?? ''),
                    }));
                  }}
                  className="form-select w-full rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-100 px-3 py-2"
                  required
                >
                  <option value="">-- Pilih kode kurir --</option>
                  {COURIER_OPTIONS.map(c => (
                    <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Kode digunakan untuk query ke API RajaOngkir
                </p>
              </div>

              {/* Biaya default */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Biaya Default (opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                  <input
                    type="number"
                    min={0}
                    value={form.cost}
                    onChange={(e) => setForm(p => ({ ...p, cost: e.target.value }))}
                    placeholder="0"
                    className="form-input w-full rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-100 pl-9 pr-3 py-2"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Ongkir aktual dihitung real-time via RajaOngkir</p>
              </div>

              {/* Receipt Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Receipt Secret (opsional)
                </label>
                <input
                  type="text"
                  value={form.receiptSecret}
                  onChange={(e) => setForm(p => ({ ...p, receiptSecret: e.target.value }))}
                  placeholder="Secret untuk verifikasi resi"
                  className="form-input w-full rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-100 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Kurir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourierManagement;
