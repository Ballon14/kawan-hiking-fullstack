import { getDb } from './mongodb.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    const db = await getDb();

    // 1. USERS
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const usersResult = await db.collection('users').insertMany([
      {
        username: 'admin',
        email: 'admin@kawanhiking.com',
        password: adminPassword,
        role: 'admin',
        nomor_hp: '081234567890',
        alamat: 'Jakarta',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'iqbal',
        email: 'iqbal@example.com',
        password: hashedPassword,
        role: 'user',
        nomor_hp: '081234567891',
        alamat: 'Bandung',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'budi',
        email: 'budi@example.com',
        password: hashedPassword,
        role: 'user',
        nomor_hp: '081234567892',
        alamat: 'Surabaya',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log(`✅ Created ${usersResult.insertedCount} users`);

    // 2. DESTINATIONS
    console.log('\n🏔️  Creating destinations...');
    const destinationsResult = await db.collection('destinations').insertMany([
      {
        nama_destinasi: 'Gunung Semeru',
        lokasi: 'Lumajang, Jawa Timur',
        ketinggian: 3676,
        kesulitan: 'Sulit',
        durasi: '3-4 hari',
        deskripsi: 'Gunung tertinggi di Pulau Jawa dengan pemandangan Ranu Kumbolo yang memukau',
        jalur_pendakian: ['Ranu Pani', 'Ranu Kumbolo', 'Kalimati', 'Mahameru'],
        fasilitas: ['Pos pendakian', 'Shelter', 'Sumber air'],
        tips: ['Bawa sleeping bag hangat', 'Persiapkan fisik', 'Cek cuaca'],
        gambar: '/images/semeru.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama_destinasi: 'Gunung Rinjani',
        lokasi: 'Lombok, NTB',
        ketinggian: 3726,
        kesulitan: 'Sulit',
        durasi: '3-4 hari',
        deskripsi: 'Gunung dengan danau Segara Anak yang indah dan pemandangan sunrise spektakuler',
        jalur_pendakian: ['Sembalun', 'Pelawangan Sembalun', 'Segara Anak', 'Plawangan Senaru'],
        fasilitas: ['Pos pendakian', 'Pemandu lokal', 'Area camping'],
        tips: ['Bawa pakaian hangat', 'Gunakan trekking pole', 'Jaga kebersihan'],
        gambar: '/images/rinjani.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama_destinasi: 'Gunung Bromo',
        lokasi: 'Probolinggo, Jawa Timur',
        ketinggian: 2329,
        kesulitan: 'Mudah',
        durasi: '1-2 hari',
        deskripsi: 'Ikon wisata Jawa Timur dengan sunrise terbaik dan lautan pasir',
        jalur_pendakian: ['Cemoro Lawang', 'Lautan Pasir', 'Kawah Bromo'],
        fasilitas: ['Jeep tour', 'Penginapan', 'Warung'],
        tips: ['Datang pagi untuk sunrise', 'Sewa masker debu', 'Bawa jaket tebal'],
        gambar: '/images/bromo.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama_destinasi: 'Gunung Sumbing',
        lokasi: 'Wonosobo, Jawa Tengah',
        ketinggian: 3371,
        kesulitan: 'Sedang',
        durasi: '2-3 hari',
        deskripsi: 'Gunung kembar Sindoro dengan jalur terjal dan view 360 derajat',
        jalur_pendakian: ['Garung', 'Pos 1-5', 'Puncak'],
        fasilitas: ['Pos pendakian', 'Sumber air', 'Area camping'],
        tips: ['Bawa air cukup', 'Gunakan headlamp', 'Hati-hati jalur licin'],
        gambar: '/images/sumbing.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log(`✅ Created ${destinationsResult.insertedCount} destinations`);

    const destinations = await db.collection('destinations').find({}).toArray();

    // 3. GUIDES
    console.log('\n🧗 Creating guides...');
    const guidesResult = await db.collection('guides').insertMany([
      {
        nama: 'Pak Agus',
        bio: 'Guide berpengalaman 15 tahun di Jawa Timur',
        pengalaman: '15 tahun',
        sertifikasi: ['Level 3 Mountain Guide', 'First Aid'],
        foto: '/images/guide1.jpg',
        spesialisasi: ['Semeru', 'Bromo', 'Ijen'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama: 'Mas Budi',
        bio: 'Spesialis pendakian Rinjani',
        pengalaman: '10 tahun',
        sertifikasi: ['Level 2 Mountain Guide'],
        foto: '/images/guide2.jpg',
        spesialisasi: ['Rinjani', 'Lombok trails'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama: 'Kang Dedi',
        bio: 'Guide lokal Jawa Tengah',
        pengalaman: '8 tahun',
        sertifikasi: ['Level 2 Mountain Guide', 'First Aid'],
        foto: '/images/guide3.jpg',
        spesialisasi: ['Sumbing', 'Sindoro', 'Merbabu'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log(`✅ Created ${guidesResult.insertedCount} guides`);

    // 4. OPEN TRIPS
    console.log('\n📅 Creating open trips...');
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const openTripsResult = await db.collection('open_trips').insertMany([
      {
        id_destinasi: destinations[0]._id, // Semeru
        nama_trip: 'Semeru New Year Trip 2026',
        tanggal_berangkat: new Date('2026-01-05'),
        durasi: 4,
        kuota: 15,
        harga_per_orang: 2500000,
        gambar: '/images/semeru-trip.jpg',
        fasilitas: ['Guide profesional', 'Tenda', 'Makan 3x/hari', 'Transportasi', 'Sertifikat'],
        itinerary: 'Hari 1: Jakarta - Malang - Ranu Pani\nHari 2: Ranu Pani - Ranu Kumbolo\nHari 3: Summit Mahameru\nHari 4: Turun - Pulang',
        dokumentasi: [],
        dilaksanakan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_destinasi: destinations[1]._id, // Rinjani
        nama_trip: 'Rinjani Adventure February',
        tanggal_berangkat: new Date('2026-02-15'),
        durasi: 3,
        kuota: 12,
        harga_per_orang: 3000000,
        gambar: '/images/rinjani-trip.jpg',
        fasilitas: ['Guide bersertifikat', 'Porter', 'Tenda', 'Sleeping bag', 'Makan', 'Transportasi'],
        itinerary: 'Hari 1: Sembalun - Pelawangan\nHari 2: Summit - Segara Anak\nHari 3: Turun via Senaru',
        dokumentasi: [],
        dilaksanakan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_destinasi: destinations[2]._id, // Bromo
        nama_trip: 'Bromo Sunrise Tour',
        tanggal_berangkat: nextMonth,
        durasi: 2,
        kuota: 20,
        harga_per_orang: 1500000,
        gambar: '/images/bromo-trip.jpg',
        fasilitas: ['Jeep 4x4', 'Guide', 'Hotel 1 malam', 'Makan 2x', 'Dokumentasi'],
        itinerary: 'Hari 1: Surabaya - Bromo (malam)\nHari 2: Sunrise hunting - Kawah - Pulang',
        dokumentasi: [],
        dilaksanakan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log(`✅ Created ${openTripsResult.insertedCount} open trips`);

    // 5. PRIVATE TRIPS
    console.log('\n🎒 Creating private trips...');
    const users = await db.collection('users').find({ role: 'user' }).toArray();
    
    const privateTripsResult = await db.collection('private_trips').insertMany([
      {
        id_user: users[0]._id,
        id_destinasi: destinations[3]._id, // Sumbing
        destinasi: 'Gunung Sumbing',
        min_peserta: 8,
        harga_paket: 1800000,
        paket_pilihan: ['Guide', 'Tenda', 'Logistik'],
        custom_form: {
          username: users[0].username,
          online_id: users[0]._id.toString(),
          tanggal_keberangkatan: '2026-03-20',
          jumlah_peserta: 10,
          status: 'pending',
          catatan: 'Rombongan kantor, butuh guide berpengalaman'
        },
        estimasi_biaya: 18000000,
        dokumentasi: [],
        dilaksanakan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_user: users[1]._id,
        id_destinasi: destinations[0]._id, // Semeru
        destinasi: 'Gunung Semeru',
        min_peserta: 5,
        harga_paket: 2500000,
        paket_pilihan: ['Guide', 'Tenda', 'Carrier', 'Logistik'],
        custom_form: {
          username: users[1].username,
          online_id: users[1]._id.toString(),
          tanggal_keberangkatan: '2026-04-10',
          jumlah_peserta: 6,
          status: 'aktif',
          catatan: 'Trip keluarga, mohon perhatian extra untuk keamanan'
        },
        estimasi_biaya: 15000000,
        dokumentasi: [],
        dilaksanakan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log(`✅ Created ${privateTripsResult.insertedCount} private trips`);

    // 6. CHAT MESSAGES
    console.log('\n💬 Creating chat messages...');
    const chatResult = await db.collection('chat_messages').insertMany([
      {
        username: users[0].username,
        message: 'Halo, saya mau tanya tentang trip ke Semeru',
        role: 'user',
        is_read: true,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        username: 'admin',
        message: 'Halo! Ada yang bisa saya bantu? Trip Semeru kami tersedia untuk bulan Januari',
        role: 'admin',
        is_read: true,
        createdAt: new Date(Date.now() - 3000000),
      },
      {
        username: users[0].username,
        message: 'Untuk 6 orang bisa custom trip tidak?',
        role: 'user',
        is_read: true,
        createdAt: new Date(Date.now() - 2400000),
      },
      {
        username: 'admin',
        message: 'Tentu bisa! Silakan submit private trip request melalui menu Private Trips',
        role: 'admin',
        is_read: false,
        createdAt: new Date(Date.now() - 1800000),
      }
    ]);
    console.log(`✅ Created ${chatResult.insertedCount} chat messages`);

    // 7. HISTORY
    console.log('\n📜 Creating history records...');
    const historyResult = await db.collection('history').insertMany([
      {
        username: 'admin',
        role: 'admin',
        action: 'create',
        trip_type: 'open_trip',
        trip_id: (await db.collection('open_trips').find({}).toArray())[0]._id,
        request_body: { nama_trip: 'Semeru New Year Trip 2026' },
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        username: 'admin',
        role: 'admin',
        action: 'approve',
        trip_type: 'private_trip',
        trip_id: (await db.collection('private_trips').find({ 'custom_form.status': 'aktif' }).toArray())[0]._id,
        request_body: { status: 'aktif' },
        createdAt: new Date(Date.now() - 43200000), // 12 hours ago
      }
    ]);
    console.log(`✅ Created ${historyResult.insertedCount} history records`);

    // Summary
    console.log('\n🎉 Database seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${usersResult.insertedCount}`);
    console.log(`   - Destinations: ${destinationsResult.insertedCount}`);
    console.log(`   - Guides: ${guidesResult.insertedCount}`);
    console.log(`   - Open Trips: ${openTripsResult.insertedCount}`);
    console.log(`   - Private Trips: ${privateTripsResult.insertedCount}`);
    console.log(`   - Chat Messages: ${chatResult.insertedCount}`);
    console.log(`   - History: ${historyResult.insertedCount}`);
    console.log('\n✅ Login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   User 1: iqbal / password123');
    console.log('   User 2: budi / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
