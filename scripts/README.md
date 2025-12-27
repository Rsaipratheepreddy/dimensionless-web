# CSS Unit Conversion Script

## Overview
This script automatically converts all `rem` units to `px` units across your CSS files.

## Usage

### 1. Preview Changes (Dry Run)
```bash
node scripts/convert-rem-to-px.js --dry-run
```
This will show you what would be converted without making any changes.

### 2. Apply Conversions
```bash
node scripts/convert-rem-to-px.js
```
This will convert all `rem` values to `px` in your CSS files.

### 3. Review Changes
```bash
git diff
```
Review all changes before committing.

### 4. Revert if Needed
```bash
git checkout -- src/
```
Reverts all changes if something went wrong.

## Conversion Rules
- Base font size: **16px** (1rem = 16px)
- Examples:
  - `1rem` → `16px`
  - `0.5rem` → `8px`
  - `1.5rem` → `24px`
  - `0.875rem` → `14px`
  - `2.5rem` → `40px`

## What Gets Converted
- All CSS files in `src/` directory
- Padding, margin, font-size, width, height, gap, etc.
- Both positive and negative values
- Decimal values (e.g., `0.875rem`)

## What Doesn't Get Converted
- Files in `node_modules/`, `dist/`, `.next/`
- Non-rem units (px, em, %, vh, vw, etc.)

## Safety Features
- Dry-run mode to preview changes
- Git version control for easy rollback
- Detailed logging of all conversions
- Error handling for file operations
