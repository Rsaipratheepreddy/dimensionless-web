/**
 * Migration script: Extract base64 images from DB, upload to S3, update URLs
 * 
 * Usage: node migrate-images-to-s3.js
 * 
 * Requires: AWS CLI configured with proper credentials
 * Environment: AWS_REGION=ap-south-1, S3_BUCKET=dimensionless-media
 */

const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const CLOUDFRONT_DOMAIN = 'd24u4o9o334g7y.cloudfront.net';
const S3_BUCKET = 'dimensionless-media';
const AWS_REGION = 'ap-south-1';

const DB_CONFIG = {
  host: 'dimensionless-db.cbaeu2kkebwk.ap-south-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'DimensionlessPass2024',
  database: 'dimensionless',
  ssl: { rejectUnauthorized: false },
};

const s3 = new S3Client({ region: AWS_REGION });

function base64ToBuffer(dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;
  return {
    contentType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
    extension: matches[1].split('/')[1] || 'png',
  };
}

async function uploadToS3(buffer, contentType, folder, extension) {
  const key = `${folder}/${uuidv4()}.${extension}`;
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  }));
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
}

async function migrateTable(client, table, imageColumn, nameColumn, folder) {
  console.log(`\n--- Migrating ${table} ---`);
  const { rows } = await client.query(
    `SELECT id, "${nameColumn}", "${imageColumn}" FROM "${table}" WHERE "${imageColumn}" LIKE 'data:%'`
  );
  console.log(`Found ${rows.length} rows with base64 images`);

  let migrated = 0, failed = 0;
  for (const row of rows) {
    try {
      const parsed = base64ToBuffer(row[imageColumn]);
      if (!parsed) { console.log(`  SKIP: ${row[nameColumn]} - invalid base64`); failed++; continue; }

      const cdnUrl = await uploadToS3(parsed.buffer, parsed.contentType, folder, parsed.extension);
      await client.query(
        `UPDATE "${table}" SET "${imageColumn}" = $1 WHERE id = $2`,
        [cdnUrl, row.id]
      );
      migrated++;
      console.log(`  OK: ${row[nameColumn]} (${(parsed.buffer.length / 1024).toFixed(0)}KB) -> ${cdnUrl.split('/').pop()}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL: ${row[nameColumn]} - ${err.message}`);
    }
  }
  console.log(`${table}: ${migrated} migrated, ${failed} failed`);
  return migrated;
}

async function migrateArtworkImages(client) {
  console.log(`\n--- Migrating artwork_images ---`);
  const { rows } = await client.query(
    `SELECT ai.id, ai.image_url, a.title FROM artwork_images ai JOIN artworks a ON ai.artwork_id = a.id WHERE ai.image_url LIKE 'data:%'`
  );
  console.log(`Found ${rows.length} artwork images with base64`);

  let migrated = 0, failed = 0;
  for (const row of rows) {
    try {
      const parsed = base64ToBuffer(row.image_url);
      if (!parsed) { failed++; continue; }

      const cdnUrl = await uploadToS3(parsed.buffer, parsed.contentType, 'artworks', parsed.extension);
      await client.query('UPDATE artwork_images SET image_url = $1 WHERE id = $2', [cdnUrl, row.id]);
      migrated++;
      console.log(`  OK: ${row.title} (${(parsed.buffer.length / 1024).toFixed(0)}KB)`);
    } catch (err) {
      failed++;
      console.error(`  FAIL: ${row.title} - ${err.message}`);
    }
  }
  console.log(`artwork_images: ${migrated} migrated, ${failed} failed`);
  return migrated;
}

async function main() {
  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to database');

  let total = 0;

  // Migrate tattoo_designs
  total += await migrateTable(client, 'tattoo_designs', 'image_url', 'name', 'tattoos');

  // Migrate artwork_images (Supabase URLs -> keep as-is, only base64)
  total += await migrateArtworkImages(client);

  // Migrate piercing_designs if exists
  try {
    const { rows } = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'piercing_designs')");
    if (rows[0].exists) {
      total += await migrateTable(client, 'piercing_designs', 'image_url', 'name', 'piercings');
    }
  } catch (e) { /* table doesn't exist */ }

  console.log(`\n=== Migration complete: ${total} images moved to S3/CloudFront ===`);
  await client.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
