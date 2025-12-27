#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_FONT_SIZE = 16; // 1rem = 16px
const SRC_DIR = path.join(__dirname, '../src');
const DRY_RUN = process.argv.includes('--dry-run');

// Convert rem value to px
function remToPx(remValue) {
    const numericValue = parseFloat(remValue);
    const pxValue = numericValue * BASE_FONT_SIZE;

    // Round to 1 decimal place if needed, otherwise use integer
    return pxValue % 1 === 0 ? Math.round(pxValue) : Math.round(pxValue * 10) / 10;
}

// Process CSS content
function convertRemToPx(content) {
    let convertedCount = 0;

    // Match rem values with optional negative sign and decimal
    const remPattern = /(-?\d+\.?\d*)\s*rem\b/g;

    const newContent = content.replace(remPattern, (match, value) => {
        convertedCount++;
        const pxValue = remToPx(value);
        return `${pxValue}px`;
    });

    return { newContent, convertedCount };
}

// Process a single file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { newContent, convertedCount } = convertRemToPx(content);

        if (convertedCount > 0) {
            if (!DRY_RUN) {
                fs.writeFileSync(filePath, newContent, 'utf8');
            }

            const relativePath = path.relative(process.cwd(), filePath);
            console.log(`✓ ${relativePath}: ${convertedCount} conversion${convertedCount > 1 ? 's' : ''}`);

            return convertedCount;
        }

        return 0;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

// Recursively find all CSS files
function findCSSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules, dist, .next directories
            if (!['node_modules', 'dist', '.next', '.git'].includes(file)) {
                findCSSFiles(filePath, fileList);
            }
        } else if (file.endsWith('.css')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Main execution
function main() {
    console.log('🔍 Searching for CSS files...\n');

    // Find all CSS files
    const cssFiles = findCSSFiles(SRC_DIR);

    console.log(`Found ${cssFiles.length} CSS files\n`);

    if (DRY_RUN) {
        console.log('🔬 DRY RUN MODE - No files will be modified\n');
    }

    let totalConversions = 0;
    let filesModified = 0;

    // Process each file
    for (const file of cssFiles) {
        const conversions = processFile(file);
        if (conversions > 0) {
            totalConversions += conversions;
            filesModified++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Conversion complete!`);
    console.log(`   Files processed: ${cssFiles.length}`);
    console.log(`   Files modified: ${filesModified}`);
    console.log(`   Total conversions: ${totalConversions}`);

    if (DRY_RUN) {
        console.log('\n💡 Run without --dry-run to apply changes');
    } else {
        console.log('\n✅ All changes have been applied');
        console.log('💡 Review changes with: git diff');
    }
}

// Run the script
try {
    main();
} catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
}
