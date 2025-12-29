import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-mountain.png"
            alt="Mountain Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white drop-shadow-lg">Jelajahi Keindahan</span>
              <br />
              <span className="gradient-text drop-shadow-lg">Alam Indonesia</span>
            </h1>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto drop-shadow-md">
              Temukan pengalaman pendakian terbaik bersama guide berpengalaman. 
              Open Trip & Private Trip untuk semua level pendaki.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-300">
            <Link
              href="/open-trip"
              className="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg rounded-2xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-2xl shadow-emerald-600/30 hover-lift hover-glow"
            >
              <span className="flex items-center justify-center gap-2">
                🏔️ Lihat Open Trip
              </span>
            </Link>
            <Link
              href="/private-trip"
              className="px-10 py-5 glass-card text-white font-bold text-lg rounded-2xl hover-lift border-2 border-slate-600 hover:border-emerald-500"
            >
              <span className="flex items-center justify-center gap-2">
                ⛰️ Request Private Trip
              </span>
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float z-10">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Destinasi </span>
              <span className="gradient-text">Populer</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Jelajahi keindahan gunung-gunung terbaik Indonesia bersama kami
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Destination 1 - Semeru */}
            <div className="group image-overlay rounded-3xl overflow-hidden card-shine hover-lift animate-scale-in">
              <div className="relative h-96">
                <Image
                  src="/destination-semeru.png"
                  alt="Mount Semeru"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <h3 className="text-3xl font-bold text-white mb-2">Gunung Semeru</h3>
                  <p className="text-emerald-300 font-semibold mb-3">Atap Jawa - 3,676 MDPL</p>
                  <p className="text-slate-200 mb-4">Gunung tertinggi di Pulau Jawa dengan pemandangan kawah Jonggring Saloko yang memukau</p>
                  <Link 
                    href="/destinasi" 
                    className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            </div>

            {/* Destination 2 - Bromo */}
            <div className="group image-overlay rounded-3xl overflow-hidden card-shine hover-lift animate-scale-in delay-100">
              <div className="relative h-96">
                <Image
                  src="/destination-bromo.png"
                  alt="Mount Bromo"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <h3 className="text-3xl font-bold text-white mb-2">Gunung Bromo</h3>
                  <p className="text-emerald-300 font-semibold mb-3">Sunrise Terbaik - 2,329 MDPL</p>
                  <p className="text-slate-200 mb-4">Nikmati sunrise spektakuler dengan lautan pasir dan pemandangan yang menakjubkan</p>
                  <Link 
                    href="/destinasi" 
                    className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 animate-fade-in">
            <Link 
              href="/destinasi" 
              className="inline-block px-8 py-4 glass-card text-white font-semibold rounded-xl hover-lift border-2 border-slate-700 hover:border-emerald-500"
            >
              Lihat Semua Destinasi →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 animate-fade-in-up">
            Mengapa <span className="gradient-text">Kawan Hiking</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-3xl p-10 card-shine hover-lift animate-fade-in-up delay-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 animate-float">
                <span className="text-4xl">🏔️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Destinasi Terbaik</h3>
              <p className="text-slate-300 leading-relaxed">
                Pilihan destinasi pendakian terbaik di seluruh Indonesia dengan pemandangan yang menakjubkan dan pengalaman tak terlupakan.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-10 card-shine hover-lift animate-fade-in-up delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 animate-float" style={{animationDelay: '0.5s'}}>
                <span className="text-4xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Guide Berpengalaman</h3>
              <p className="text-slate-300 leading-relaxed">
                Guide profesional dan bersertifikat yang akan memandu perjalanan Anda dengan aman, ramah, dan penuh dedikasi.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-10 card-shine hover-lift animate-fade-in-up delay-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 animate-float" style={{animationDelay: '1s'}}>
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Harga Terjangkau</h3>
              <p className="text-slate-300 leading-relaxed">
                Paket trip dengan harga transparan dan terjangkau tanpa biaya tersembunyi. Kualitas terbaik dengan harga bersahabat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hiking-community.png"
            alt="Hiking Community"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-emerald-900/90 to-slate-900/95"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bergabung dengan Komunitas
            </h2>
            <p className="text-xl text-emerald-100 mb-4">
              Lebih dari <span className="text-emerald-400 font-bold text-3xl">1,000+</span> pendaki telah mempercayai kami
            </p>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Jadilah bagian dari petualangan seru dan temukan teman-teman baru yang memiliki passion yang sama dalam menjelajahi alam Indonesia
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mb-12 animate-scale-in delay-200">
            <div className="glass-card rounded-2xl p-6">
              <div className="text-4xl font-bold gradient-text mb-2">50+</div>
              <div className="text-slate-300">Destinasi</div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="text-4xl font-bold gradient-text mb-2">100+</div>
              <div className="text-slate-300">Trip/Tahun</div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="text-4xl font-bold gradient-text mb-2">4.9★</div>
              <div className="text-slate-300">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 rounded-3xl p-12 md:p-16 shadow-2xl hover-lift animate-scale-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Untuk Petualangan?
            </h2>
            <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto">
              Daftar sekarang dan mulai jelajahi destinasi pendakian terbaik di Indonesia bersama Kawan Hiking
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-5 bg-white text-emerald-700 font-bold text-lg rounded-2xl hover:bg-emerald-50 transition-all shadow-xl hover-lift hover:shadow-2xl"
            >
              🚀 Daftar Gratis Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
