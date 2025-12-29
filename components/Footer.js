import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🏔️</span>
              <span className="font-bold text-xl text-emerald-400">Kawan Hiking</span>
            </Link>
            <p className="text-slate-400 text-sm">
              Platform terpercaya untuk petualangan hiking dan pendakian gunung di Indonesia.
              Bersama guide berpengalaman untuk pengalaman tak terlupakan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Menu</h3>
            <ul className="space-y-2">
              <li><Link href="/destinasi" className="text-slate-400 hover:text-emerald-400 text-sm">Destinasi</Link></li>
              <li><Link href="/open-trip" className="text-slate-400 hover:text-emerald-400 text-sm">Open Trip</Link></li>
              <li><Link href="/private-trip" className="text-slate-400 hover:text-emerald-400 text-sm">Private Trip</Link></li>
              <li><Link href="/guide" className="text-slate-400 hover:text-emerald-400 text-sm">Guide</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>📧 info@kawanhiking.id</li>
              <li>📞 +62 812-3456-7890</li>
              <li>📍 Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Kawan Hiking. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
