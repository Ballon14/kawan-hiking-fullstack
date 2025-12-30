export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">🏔️ Tentang Kawan Hiking</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Platform terpercaya untuk petualangan hiking dan pendakian gunung di Indonesia
          </p>
        </div>

        {/* Story */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 mb-8">
          <h2 className="text-3xl font-bold text-emerald-400 mb-6">Cerita Kami</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Kawan Hiking didirikan oleh sekelompok pendaki yang passionate tentang gunung dan alam Indonesia. 
              Kami percaya bahwa setiap orang berhak merasakan keindahan puncak gunung, terlepas dari pengalaman mereka.
            </p>
            <p>
              Berawal dari komunitas kecil di tahun 2020, kini kami telah melayani ribuan pendaki yang ingin 
              menjelajahi keindahan gunung-gunung Indonesia dari Sabang sampai Merauke.
            </p>
            <p>
              Dengan tim guide profesional dan bersertifikat, kami berkomitmen memberikan pengalaman mendaki 
              yang aman, menyenangkan, dan tak terlupakan untuk setiap peserta.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-900/50 to-slate-800 rounded-2xl border border-emerald-700/30 p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-4">Misi Kami</h3>
            <ul className="space-y-2 text-slate-300">
              <li>✓ Membuat pendakian gunung accessible untuk semua orang</li>
              <li>✓ Menyediakan guide professional dan bersertifikat</li>
              <li>✓ Menjaga kelestarian alam dan budaya lokal</li>
              <li>✓ Membangun komunitas pendaki yang solid</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-slate-800 rounded-2xl border border-blue-700/30 p-8">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-2xl font-bold text-white mb-4">Visi Kami</h3>
            <p className="text-slate-300">
              Menjadi platform #1 untuk hiking dan pendakian gunung di Indonesia, 
              menginspirasi jutaan orang untuk mencintai alam, dan berkontribusi 
              pada pelestarian gunung-gunung Indonesia.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 mb-8">
          <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Nilai-nilai Kami</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-3">🔒</div>
              <h4 className="font-bold text-white mb-2">Keamanan</h4>
              <p className="text-slate-400 text-sm">
                Keselamatan peserta adalah prioritas utama kami
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">🌿</div>
              <h4 className="font-bold text-white mb-2">Sustainability</h4>
              <p className="text-slate-400 text-sm">
                Berkomitmen menjaga kelestarian alam
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">🤝</div>
              <h4 className="font-bold text-white mb-2">Komunitas</h4>
              <p className="text-slate-400 text-sm">
                Membangun kebersamaan antar pendaki
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">5000+</div>
            <div className="text-slate-400 text-sm">Pendaki Terlayani</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">50+</div>
            <div className="text-slate-400 text-sm">Destinasi Gunung</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">100+</div>
            <div className="text-slate-400 text-sm">Trip Terlaksana</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">4.9/5</div>
            <div className="text-slate-400 text-sm">Rating Rata-rata</div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-emerald-900 to-blue-900 rounded-2xl border border-emerald-700/50 p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Mari Bergabung!</h3>
          <p className="text-slate-200 mb-6 max-w-2xl mx-auto">
            Siap untuk petualangan berikutnya? Jelajahi destinasi kami atau hubungi tim untuk konsultasi gratis!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/destinasi"
              className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors inline-block"
            >
              Lihat Destinasi
            </a>
            <a
              href="/komunitas"
              className="px-8 py-3 bg-white text-emerald-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors inline-block"
            >
              Gabung Komunitas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
