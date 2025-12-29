'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiGet, apiPost } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function PrivateTripPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    id_destinasi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    jumlah_peserta: '',
    budget: '',
    catatan: '',
    nama_kontak: '',
    nomor_hp: '',
    email: ''
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      setDestinations(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setSuccessMessage('');

    try {
      await apiPost('/api/private-trips', {
        ...formData,
        id_user: user.id,
        status: 'pending'
      });
      
      setSuccessMessage('Permintaan Private Trip berhasil dikirim! Kami akan menghubungi Anda segera.');
      
      // Reset form
      setFormData({
        id_destinasi: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        jumlah_peserta: '',
        budget: '',
        catatan: '',
        nama_kontak: '',
        nomor_hp: '',
        email: ''
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Gagal mengirim permintaan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDurationDays = () => {
    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      const start = new Date(formData.tanggal_mulai);
      const end = new Date(formData.tanggal_selesai);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hiking-trail-hero.png"
            alt="Private Trip"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white drop-shadow-lg">Private Trip</span>
            <br />
            <span className="gradient-text drop-shadow-lg">Petualangan Eksklusif Anda</span>
          </h1>
          <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
            Rencanakan perjalanan pendakian custom sesuai jadwal dan preferensi grup Anda dengan layanan private trip
          </p>
        </div>
      </section>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white animate-scale-in shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="font-bold text-lg">Berhasil!</h3>
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card rounded-2xl p-6 text-center animate-scale-in">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-white font-bold mb-2">Fleksibel</h3>
              <p className="text-slate-300 text-sm">Tentukan jadwal dan durasi sesuai keinginan Anda</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center animate-scale-in delay-100">
              <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
              <h3 className="text-white font-bold mb-2">Privasi</h3>
              <p className="text-slate-300 text-sm">Hanya untuk grup Anda, lebih intimate dan personal</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center animate-scale-in delay-200">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-white font-bold mb-2">Customizable</h3>
              <p className="text-slate-300 text-sm">Sesuaikan itinerary dengan kebutuhan khusus</p>
            </div>
          </div>

          {/* Request Form */}
          <div className="glass-card rounded-3xl p-8 md:p-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-white mb-2">Request Private Trip</h2>
            <p className="text-slate-400 mb-8">Isi form di bawah ini dan kami akan menghubungi Anda untuk diskusi lebih lanjut</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Destination */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Destinasi <span className="text-red-400">*</span>
                </label>
                <select
                  name="id_destinasi"
                  value={formData.id_destinasi}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Pilih Destinasi</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.nama_destinasi} {dest.ketinggian ? `(${dest.ketinggian} mdpl)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Tanggal Mulai <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_mulai"
                    value={formData.tanggal_mulai}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Tanggal Selesai <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_selesai"
                    value={formData.tanggal_selesai}
                    onChange={handleChange}
                    required
                    min={formData.tanggal_mulai || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Duration Display */}
              {getDurationDays() > 0 && (
                <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-xl p-4">
                  <p className="text-emerald-400">
                    ⏱️ Durasi: <span className="font-bold">{getDurationDays()} hari</span>
                  </p>
                </div>
              )}

              {/* Group Size and Budget */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Jumlah Peserta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="jumlah_peserta"
                    value={formData.jumlah_peserta}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="Misal: 5"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Budget (per orang)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Misal: 2000000"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-slate-500 text-sm mt-1">Optional - bantu kami memberikan rekomendasi terbaik</p>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Catatan Khusus
                </label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Misalnya: permintaan khusus, dietary requirements, kondisi kesehatan yang perlu diperhatikan, dll."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              {/* Contact Information */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Informasi Kontak</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Nama Lengkap <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_kontak"
                      value={formData.nama_kontak}
                      onChange={handleChange}
                      required
                      placeholder="Nama lengkap Anda"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Nomor WhatsApp <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="nomor_hp"
                        value={formData.nomor_hp}
                        onChange={handleChange}
                        required
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg rounded-2xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-2xl shadow-emerald-600/30 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Mengirim...
                    </span>
                  ) : (
                    '🚀 Kirim Permintaan Private Trip'
                  )}
                </button>
                
                {!user && (
                  <p className="text-center text-slate-400 text-sm mt-4">
                    Anda akan diarahkan ke halaman login jika belum masuk
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 glass-card rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Pertanyaan Umum</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">📞 Berapa lama proses konfirmasi?</h4>
                <p className="text-slate-300">Tim kami akan menghubungi Anda dalam 1x24 jam untuk diskusi detail trip.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">💰 Bagaimana sistem pembayaran?</h4>
                <p className="text-slate-300">Setelah deal, kami akan mengirim invoice dan informasi pembayaran melalui email/WhatsApp.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">📅 Berapa minimal booking sebelum keberangkatan?</h4>
                <p className="text-slate-300">Minimal 2 minggu sebelum tanggal keberangkatan untuk persiapan yang optimal.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">👥 Berapa minimal peserta?</h4>
                <p className="text-slate-300">Minimal 2 orang untuk private trip. Untuk solo trip, silakan hubungi kami langsung.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
