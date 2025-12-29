// Migration script to add columns to private_trips table
const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  
  try {
    // Create connection (adjust these if needed)
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kolleksi-dolan-manut'
    });

    console.log('✅ Connected to database');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM private_trips WHERE Field IN (
        'tanggal_mulai', 'tanggal_selesai', 'jumlah_peserta', 
        'budget', 'catatan', 'nama_kontak', 'nomor_hp', 'email', 'status'
      )
    `);

    if (columns.length > 0) {
      console.log('⚠️  Some columns already exist. Skipping migration.');
      console.log('Existing columns:', columns.map(c => c.Field).join(', '));
      return;
    }

    console.log('🔄 Running migration...');

    // Add new columns
    await connection.query(`
      ALTER TABLE private_trips 
      ADD COLUMN tanggal_mulai DATE NULL AFTER id_destinasi,
      ADD COLUMN tanggal_selesai DATE NULL AFTER tanggal_mulai,
      ADD COLUMN jumlah_peserta INT NULL AFTER tanggal_selesai,
      ADD COLUMN budget DECIMAL(10,2) NULL AFTER jumlah_peserta,
      ADD COLUMN catatan TEXT NULL AFTER budget,
      ADD COLUMN nama_kontak VARCHAR(255) NULL AFTER catatan,
      ADD COLUMN nomor_hp VARCHAR(20) NULL AFTER nama_kontak,
      ADD COLUMN email VARCHAR(255) NULL AFTER nomor_hp,
      ADD COLUMN status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending' AFTER email
    `);
    console.log('✅ Added new columns');

    // Update existing rows
    await connection.query(`
      UPDATE private_trips SET status = 'pending' WHERE status IS NULL
    `);
    console.log('✅ Updated existing rows');

    // Add indexes
    await connection.query(`
      CREATE INDEX idx_status ON private_trips (status)
    `);
    await connection.query(`
      CREATE INDEX idx_tanggal_mulai ON private_trips (tanggal_mulai)
    `);
    console.log('✅ Added indexes');

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
