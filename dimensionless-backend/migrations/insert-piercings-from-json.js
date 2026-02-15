/**
 * Insert piercing designs from JSON data piped via stdin
 * Usage: cat piercings.json | node insert-piercings-from-json.js
 */
const { Client } = require('pg');

const DB_CONFIG = {
  host: 'dimensionless-db.cbaeu2kkebwk.ap-south-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'DimensionlessPass2024',
  database: 'dimensionless',
  ssl: { rejectUnauthorized: false },
};

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  const piercings = JSON.parse(input);
  console.log(`Parsed ${piercings.length} piercing designs`);

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to database');

  let inserted = 0, skipped = 0;
  for (const p of piercings) {
    try {
      // Check if already exists
      const existing = await client.query('SELECT id FROM piercing_designs WHERE id = $1', [p.id]);
      if (existing.rows.length > 0) {
        console.log(`  SKIP (exists): ${p.name}`);
        skipped++;
        continue;
      }

      await client.query(
        `INSERT INTO piercing_designs (id, name, description, category_id, size, estimated_duration, base_price, image_url, artist_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          p.id,
          p.name,
          p.description,
          p.category_id,
          p.size,
          p.estimated_duration,
          p.base_price,
          p.image_url,
          p.artist_id || null,
          p.is_active,
          p.created_at,
          p.updated_at,
        ]
      );
      inserted++;
      const imgSize = p.image_url ? (p.image_url.length / 1024).toFixed(0) + 'KB' : '0KB';
      console.log(`  OK: ${p.name} (image: ${imgSize})`);
    } catch (err) {
      console.error(`  FAIL: ${p.name} - ${err.message}`);
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`);
  await client.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
