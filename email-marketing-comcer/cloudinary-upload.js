import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cache file to track uploaded images
const CACHE_FILE = '.cloudinary-cache.json';

// Load cache
async function loadCache() {
    try {
        const data = await fs.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save cache
async function saveCache(cache) {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// Get file hash
async function getFileHash(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash('md5');
    hash.update(fileBuffer);
    return hash.digest('hex');
}

// Scan directories for images
async function scanForImages(directories) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const images = [];
    
    for (const dir of directories) {
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });
            
            for (const file of files) {
                if (file.isFile()) {
                    const ext = path.extname(file.name).toLowerCase();
                    if (imageExtensions.includes(ext)) {
                        const filePath = path.join(dir, file.name);
                        const publicId = path.basename(file.name, ext)
                            .replace(/\s+/g, '-')
                            .replace(/[^a-zA-Z0-9-_]/g, '')
                            .toLowerCase();
                        
                        images.push({
                            path: filePath,
                            name: file.name,
                            publicId: `email-marketing/${dir}/${publicId}`,
                            ext: ext
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dir}:`, error.message);
        }
    }
    
    return images;
}

// Upload image with optimizations
async function uploadImage(image, cache) {
    const fileHash = await getFileHash(image.path);
    const cacheKey = `${image.publicId}_${fileHash}`;
    
    // Check if already uploaded
    if (cache[cacheKey]) {
        console.log(`⏩ ${image.name} already uploaded (cached)`);
        console.log(`   URL: ${cache[cacheKey].url}`);
        console.log(`   WebP: ${cache[cacheKey].webpUrl}\n`);
        return cache[cacheKey];
    }
    
    try {
        console.log(`📤 Uploading ${image.name}...`);
        
        // Upload with optimizations
        const uploadResult = await cloudinary.uploader.upload(
            image.path,
            {
                public_id: image.publicId,
                overwrite: true,
                resource_type: 'image',
                transformation: [
                    { quality: 'auto:best' },
                    { fetch_format: 'auto' }
                ],
                eager: [
                    { format: 'webp', quality: 'auto' }
                ],
                eager_async: false
            }
        );
        
        // Generate optimized URLs
        const standardUrl = uploadResult.secure_url;
        const webpUrl = cloudinary.url(uploadResult.public_id, {
            format: 'webp',
            quality: 'auto',
            fetch_format: 'auto',
            secure: true
        });
        
        // Responsive versions
        const responsiveUrls = {
            small: cloudinary.url(uploadResult.public_id, {
                format: 'webp',
                quality: 'auto',
                width: 300,
                crop: 'scale',
                secure: true
            }),
            medium: cloudinary.url(uploadResult.public_id, {
                format: 'webp',
                quality: 'auto',
                width: 600,
                crop: 'scale',
                secure: true
            }),
            large: cloudinary.url(uploadResult.public_id, {
                format: 'webp',
                quality: 'auto',
                width: 1200,
                crop: 'scale',
                secure: true
            })
        };
        
        const result = {
            url: standardUrl,
            webpUrl: webpUrl,
            responsive: responsiveUrls,
            publicId: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            size: uploadResult.bytes
        };
        
        // Save to cache
        cache[cacheKey] = result;
        
        console.log(`✅ Upload successful!`);
        console.log(`   Standard: ${standardUrl}`);
        console.log(`   WebP: ${webpUrl}`);
        console.log(`   Sizes: Small (300w), Medium (600w), Large (1200w)`);
        console.log(`   Original: ${uploadResult.width}x${uploadResult.height}, ${(uploadResult.bytes / 1024).toFixed(1)}KB\n`);
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error uploading ${image.name}:`, error.message);
        return null;
    }
}

// Generate markdown report
async function generateReport(results) {
    let report = '# Cloudinary Upload Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += '## Uploaded Images\n\n';
    
    for (const result of results) {
        if (result.data) {
            report += `### ${result.image.name}\n\n`;
            report += `- **Public ID**: ${result.data.publicId}\n`;
            report += `- **Dimensions**: ${result.data.width}x${result.data.height}\n`;
            report += `- **Size**: ${(result.data.size / 1024).toFixed(1)}KB\n`;
            report += `- **Standard URL**: ${result.data.url}\n`;
            report += `- **WebP URL**: ${result.data.webpUrl}\n`;
            report += `- **Responsive URLs**:\n`;
            report += `  - Small (300w): ${result.data.responsive.small}\n`;
            report += `  - Medium (600w): ${result.data.responsive.medium}\n`;
            report += `  - Large (1200w): ${result.data.responsive.large}\n\n`;
        }
    }
    
    await fs.writeFile('cloudinary-urls.md', report);
    console.log('📄 Report saved to cloudinary-urls.md');
}

// Main function
async function main() {
    console.log('🚀 Cloudinary Optimized Upload Script\n');
    
    // Directories to scan
    const directories = ['images', 'emails'];
    
    // Load cache
    const cache = await loadCache();
    
    // Scan for images
    console.log('🔍 Scanning for images...\n');
    const images = await scanForImages(directories);
    console.log(`Found ${images.length} images\n`);
    
    // Upload images
    const results = [];
    for (const image of images) {
        const data = await uploadImage(image, cache);
        results.push({ image, data });
    }
    
    // Save cache
    await saveCache(cache);
    
    // Generate report
    await generateReport(results);
    
    console.log('\n✨ Done!');
}

// Run
main().catch(console.error);