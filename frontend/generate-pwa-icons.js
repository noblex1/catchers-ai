/**
 * PWA Icon Generator
 * 
 * This script generates PWA icons from the existing logo.
 * Run with: node generate-pwa-icons.js
 * 
 * Requirements: npm install sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_IMAGE = path.join(__dirname, 'public', 'images.jpg');
const OUTPUT_DIR = path.join(__dirname, 'public');

// Icon configurations
const icons = [
  {
    name: 'pwa-192x192.png',
    size: 192,
    padding: 30,
    background: null, // transparent
    description: 'Standard icon for Android'
  },
  {
    name: 'pwa-512x512.png',
    size: 512,
    padding: 80,
    background: null, // transparent
    description: 'Large icon for splash screens'
  },
  {
    name: 'pwa-maskable-192x192.png',
    size: 192,
    padding: 20,
    background: '#3b82f6', // blue background
    description: 'Maskable icon (small) - adapts to device shape'
  },
  {
    name: 'pwa-maskable-512x512.png',
    size: 512,
    padding: 60,
    background: '#3b82f6', // blue background
    description: 'Maskable icon (large) - adapts to device shape'
  }
];

async function generateIcons() {
  console.log('🎨 PWA Icon Generator\n');
  console.log(`📁 Input: ${INPUT_IMAGE}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  // Check if input image exists
  if (!fs.existsSync(INPUT_IMAGE)) {
    console.error(`❌ Error: Input image not found at ${INPUT_IMAGE}`);
    console.error('   Please ensure images.jpg exists in the public folder.');
    process.exit(1);
  }

  // Generate each icon
  for (const icon of icons) {
    try {
      const { name, size, padding, background, description } = icon;
      const logoSize = size - (padding * 2);
      const outputPath = path.join(OUTPUT_DIR, name);

      console.log(`⏳ Generating ${name}...`);
      console.log(`   ${description}`);

      // Create base image with background
      let image = sharp(INPUT_IMAGE)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: background 
            ? { r: 59, g: 130, b: 246, alpha: 1 } // #3b82f6
            : { r: 0, g: 0, b: 0, alpha: 0 } // transparent
        });

      // Add padding
      if (padding > 0) {
        image = image.extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: background
            ? { r: 59, g: 130, b: 246, alpha: 1 }
            : { r: 0, g: 0, b: 0, alpha: 0 }
        });
      }

      // Save as PNG
      await image.png().toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size}px)\n`);
    } catch (error) {
      console.error(`❌ Error generating ${icon.name}:`, error.message);
    }
  }

  console.log('🎉 All icons generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Check the generated icons in the public folder');
  console.log('   2. Run: npm run build');
  console.log('   3. Deploy to production');
  console.log('   4. Test PWA installation on your device\n');
}

generateIcons().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
