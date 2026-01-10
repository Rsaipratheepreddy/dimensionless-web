import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // To load .env.local if available

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const BUCKET_NAME = 'artwork-images';

async function optimizeImages() {
    console.log('🚀 Starting image optimization process...');

    try {
        // 1. List all files in the bucket
        const { data: files, error: listError } = await supabase.storage
            .from(BUCKET_NAME)
            .list('', { limit: 1000 });

        if (listError) throw listError;

        console.log(`Found ${files.length} folders/files in bucket.`);

        for (const folder of files) {
            if (folder.id === null) { // It's likely a folder
                const { data: subFiles, error: subError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .list(folder.name);

                if (subError) continue;

                for (const file of subFiles) {
                    const filePath = `${folder.name}/${file.name}`;
                    await processFile(filePath);
                }
            } else {
                await processFile(folder.name);
            }
        }
    } catch (error) {
        console.error('❌ General Error:', error);
    }
}

async function processFile(filePath) {
    // Only process images
    if (!/\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
        console.log(`⏭️ Skipping non-image file: ${filePath}`);
        return;
    }

    console.log(`\n📄 Processing: ${filePath}`);

    try {
        // 1. Download image
        const { data: blob, error: downloadError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(filePath);

        if (downloadError) throw downloadError;

        const buffer = Buffer.from(await blob.arrayBuffer());
        console.log(`   Initial size: ${(buffer.length / 1024).toFixed(2)} KB`);

        // 2. Optimize image using sharp
        const optimizedBuffer = await sharp(buffer)
            .resize({
                width: 1600, // Reasonable max width
                withoutEnlargement: true
            })
            .webp({ quality: 80 }) // Convert to WebP for best compression
            .toBuffer();

        console.log(`   Optimized size: ${(optimizedBuffer.length / 1024).toFixed(2)} KB`);

        if (optimizedBuffer.length >= buffer.length) {
            console.log('   ℹ️ Optimized version is not smaller. Skipping replacement.');
            return;
        }

        // 3. Upload back (upsert)
        // We upload as webp so we might want to change the file extension in some cases,
        // but for simplicity and not breaking existing DB refs, let's keep the name if possible
        // OR just use same extension but optimized.
        // Let's stick to same extension for now but optimized content to avoid DB breaks.

        // However, if we want WebP, we should update DB. 
        // For this script, let's just optimize the existing format to be safe.

        const finalBuffer = await sharp(buffer)
            .resize({ width: 1600, withoutEnlargement: true })
            .toBuffer(); // Keeps original format mostly

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, finalBuffer, {
                upsert: true,
                contentType: blob.type
            });

        if (uploadError) throw uploadError;

        console.log(`   ✅ Successfully optimized and re-uploaded.`);
    } catch (error) {
        console.error(`   ❌ Error processing ${filePath}:`, error.message);
    }
}

optimizeImages();
