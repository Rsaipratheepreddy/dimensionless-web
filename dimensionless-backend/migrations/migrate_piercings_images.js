// Usage: cat insert_piercing_designs.sql | node migrate_piercings_images.js
// Or: psql -f insert_piercing_designs.sql
const { Client } = require('pg');

async function main() {
  let sql = '';
  for await (const chunk of process.stdin) sql += chunk;

  const client = new Client({
    host: 'dimensionless-db.cbaeu2kkebwk.ap-south-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'DimensionlessPass2024',
    database: 'dimensionless',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected. Executing SQL...');

  const res = await client.query(sql);
  console.log('Done. Result:', res.command, res.rowCount, 'rows');

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
