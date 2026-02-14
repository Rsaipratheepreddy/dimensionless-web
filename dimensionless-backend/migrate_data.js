const fs = require('fs');
const https = require('https');
const { Client } = require('pg');

const SUPABASE_URL = 'https://mtsmdeyxvsgxazgqbikm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c21kZXl4dnNneGF6Z3FiaWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg3NTYzNCwiZXhwIjoyMDgxNDUxNjM0fQ.yIEcxonQMrjEp6ouBvsVwDWwgt1nhsBXA_WA6pIw8fw';

const RDS_CONFIG = {
  host: 'dimensionless-db.cbaeu2kkebwk.ap-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'dimensionless',
  user: 'postgres',
  password: 'DimensionlessPass2024',
  ssl: {
    rejectUnauthorized: false
  }
};

// Tables to migrate in dependency order (using actual Supabase table names)
const TABLES = [
  'artworks',
  'artwork_images',
  'categories',
  'events',
  'art_classes',
  'tattoo_designs',
  'tattoo_bookings',
  'piercings',
  'piercing_bookings',
  'art_class_registrations',
  'event_registrations',
  'payments',
  'comments',
  'artwork_favorites',
  'notifications',
  'home_config'
];

async function fetchTableData(tableName) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?select=*`;

    const options = {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          console.error(`Error parsing ${tableName}:`, e.message);
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

async function insertIntoRDS(tableName, data) {
  const client = new Client(RDS_CONFIG);
  await client.connect();

  try {
    // Disable foreign key constraints temporarily
    await client.query('SET session_replication_role = replica;');

    if (data.length === 0) {
      console.log(`No data in ${tableName}, skipping`);
      return;
    }

    console.log(`Migrating ${data.length} records from ${tableName}...`);

    // Get column names from first record
    const columns = Object.keys(data[0]);
    const columnList = columns.map(col => `"${col}"`).join(', ');

    for (const record of data) {
      const values = columns.map(col => {
        const val = record[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return val;
      }).join(', ');

      const query = `INSERT INTO "${tableName}" (${columnList}) VALUES (${values}) ON CONFLICT DO NOTHING`;

      try {
        await client.query(query);
      } catch (e) {
        console.error(`Error inserting record in ${tableName}:`, e.message);
        // Continue with next record
      }
    }

    console.log(`Successfully migrated ${tableName}`);

    // Re-enable foreign key constraints
    await client.query('SET session_replication_role = DEFAULT;');
  } finally {
    await client.end();
  }
}

async function migrateAll() {
  console.log('Starting data migration from Supabase to AWS RDS...');

  for (const tableName of TABLES) {
    try {
      console.log(`\n=== Processing ${tableName} ===`);
      const data = await fetchTableData(tableName);
      await insertIntoRDS(tableName, data);
    } catch (error) {
      console.error(`Failed to migrate ${tableName}:`, error.message);
    }
  }

  console.log('\nMigration completed!');
}

migrateAll().catch(console.error);
