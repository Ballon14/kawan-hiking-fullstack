'use client';

import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Umum',
      questions: [
        {
          q: 'Apa itu Kawan Hiking?',
          a: 'Kawan Hiking adalah platform booking trip pendakian gunung yang menghubungkan pendaki dengan guide profesional. Kami menyediakan Open Trip dan Private Trip ke berbagai gunung di Indonesia.'
        },
        {
          q: 'Bagaimana cara mendaftar?',
          a: 'Klik menu "Daftar" di pojok kanan atas, isi data diri Anda, dan akun Anda akan langsung aktif. Setelah itu, Anda bisa langsung booking trip.'
        },
        {
          q: 'Apakah aman mendaki dengan Kawan Hiking?',
          a: 'Sangat aman! Semua guide kami bersertifikat dan berpengalaman. Kami juga menyediakan asuransi perjalanan untuk setiap trip.'
        }
      ]
    },
    {
      category: 'Booking & Pembayaran',
      questions: [
        {
          q: 'Bagaimana cara booking trip?',
          a: 'Pilih destinasi atau trip yang Anda inginkan, klik "Daftar", isi jumlah peserta, lalu lanjutkan ke pembayaran. Anda akan redirect ke Midtrans untuk proses pembayaran yang aman.'
        },
        {
          q: 'Metode pembayaran apa saja yang tersedia?',
          a: 'Kami menerima pembayaran melalui Midtrans: Transfer Bank (BCA, Mandiri, BNI, BRI), E-wallet (GoPay, OVO, Dana), dan Virtual Account.'
        },
        {
          q: 'Apakah bisa refund jika batal?',
          a: 'Bisa! Refund 100% jika pembatalan dilakukan H-7 sebelum keberangkatan. H-3 sampai H-6 refund 50%. Kurang dari H-3 tidak ada refund.'
        },
        {
          q: 'Kapan saya menerima konfirmasi booking?',
          a: 'Konfirmasi booking akan dikirim otomatis setelah pembayaran berhasil, maksimal 5 menit. Cek email atau notifikasi di website.'
        }
      ]
    },
    {
      category: 'Open Trip vs Private Trip',
      questions: [
        {
          q: 'Apa bedanya Open Trip dan Private Trip?',
          a: 'Open Trip adalah trip bersama peserta lain dengan jadwal tetap dan harga lebih terjangkau. Private Trip adalah trip khusus untuk group Anda dengan jadwal dan itinerary yang bisa disesuaikan.'
        },
        {
          q: 'Berapa minimal peserta untuk Private Trip?',
          a: 'Minimal peserta Private Trip berbeda-beda tergantung destinasi, biasanya 4-6 orang. Cek detail di halaman Private Trip.'
        },
        {
          q: 'Apakah Open Trip bisa untuk solo traveler?',
          a: 'Bisa banget! Open Trip sangat cocok untuk solo traveler yang ingin bertemu teman baru sambil mendaki.'
        }
      ]
    },
    {
      category: 'Persiapan Mendaki',
      questions: [
        {
          q: 'Apa saja yang perlu dibawa?',
          a: 'Carrier/tas gunung, sleeping bag, matras, pakaian hangat, jaket, sepatu tracking, headlamp, obat-obatan pribadi, dan perlengkapan mandi. Detail packing list akan dikirim setelah booking.'
        },
        {
          q: 'Apakah  disediakan peralatan?',
          a: 'Tenda, kompor, dan peralatan masak disediakan oleh tim. Perlengkapan pribadi seperti carrier dan sleeping bag bisa disewa dengan biaya tambahan.'
        },
        {
          q: 'Bagaimana jika tidak punya pengalaman mendaki?',
          a: 'Tidak masalah! Untuk pemula, pilih destinasi dengan tingkat kesulitan "Mudah". Guide kami akan membantu dan mendampingi selama perjalanan.'
        }
      ]
    },
    {
      category: 'Lain-lain',
      questions: [
        {
          q: 'Bagaimana cara menghubungi admin?',
          a: 'Klik icon chat di pojok kanan bawah untuk chat langsung dengan admin atau email ke support@kawanhiking.com'
        },
        {
          q: 'Apakah ada grup WhatsApp untuk setiap trip?',
          a: 'Ya! Setiap trip akan dibuatkan grup WhatsApp untuk koordinasi dan komunikasi peserta. Link grup akan dikirim H-3 sebelum keberangkatan.'
        },
        {
          q: 'Bisa tambah destinasi baru?',
          a: 'Tentu! Kirim saran destinasi melalui chat admin atau email. Kami senang mendengar masukan dari komunitas.'
        }
      ]
    }
  ];

  function toggleAccordion(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">❓ FAQ - Frequently Asked Questions</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Pertanyaan yang sering ditanyakan seputar Kawan Hiking
          </p>
        </div>

        {/* FAQ Categories */}
        {faqs.map((category, catIndex) => (
          <div key={catIndex} className="mb-8">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">
              {category.category}
            </h2>
            <div className="space-y-3">
              {category.questions.map((faq, qIndex) => {
                const globalIndex = `${catIndex}-${qIndex}`;
                const isOpen = openIndex === globalIndex;
                
                return (
                  <div
                    key={qIndex}
                    className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(globalIndex)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700 transition-colors"
                    >
                      <span className="font-semibold text-white pr-4">{faq.q}</span>
                      <span className={`text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        ⌄
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 bg-slate-900 border-t border-slate-700">
                        <p className="text-slate-300">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-emerald-900/50 to-slate-800 rounded-2xl border border-emerald-700/30 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Masih ada pertanyaan?</h3>
          <p className="text-slate-300 mb-6">
            Tim kami siap membantu Anda! Hubungi kami melalui chat atau email
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              💬 Chat dengan Admin
            </button>
            <a
              href="mailto:support@kawanhiking.com"
              className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
            >
              ✉️ Email Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
