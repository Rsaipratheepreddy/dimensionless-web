const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '../public/logo-black.png'); // Change this to your source image
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generateIcons() {
    if (!fs.existsSync(SOURCE_IMAGE)) {
        console.error(`Error: Source image not found at ${SOURCE_IMAGE}`);
        console.log('Please update the SOURCE_IMAGE path in scripts/generate-pwa-icons.js');
        return;
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log(`Generating icons from ${SOURCE_IMAGE}...`);

    try {
        const promises = SIZES.map(size => {
            const fileName = `icon-${size}x${size}.png`;
            const outputPath = path.join(OUTPUT_DIR, fileName);

            return sharp(SOURCE_IMAGE)
                .resize(size, size)
                .toFile(outputPath)
                .then(() => console.log(`✓ Generated ${fileName}`))
                .catch(err => console.error(`✗ Failed to generate ${fileName}:`, err));
        });

        await Promise.all(promises);
        console.log('\nAll PWA icons generated successfully in public/icons/');
    } catch (error) {
        console.error('An error occurred during icon generation:', error);
    }
}

generateIcons();
