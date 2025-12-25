import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ANSI Color Codes for pretty output
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";

console.log(`${CYAN}==========================================${RESET}`);
console.log(`${CYAN}   Stillbytes RAW Support Diagnostic      ${RESET}`);
console.log(`${CYAN}==========================================${RESET}\n`);

async function runDiagnostic() {
    // 1. Check Sharp Version and Formats
    console.log("1. Checking Image Engine (Sharp)...");
    try {
        const versions = sharp.versions;
        console.log(`   ${GREEN}✓ Engine loaded.${RESET} Version: ${versions.sharp}`);
        console.log(`   ${GREEN}✓ Libvips version:${RESET} ${versions.vips}`);
        
        // Check for specific RAW support indicators in format list if possible, 
        // or just rely on the functional test.
        console.log(`   (Engine is ready)\n`);
    } catch (e) {
        console.error(`${RED}❌ FATAL: Could not load 'sharp'.${RESET}`);
        console.error(e);
        process.exit(1);
    }

    // 2. Get File from Arguments
    const filePath = process.argv[2];

    if (!filePath) {
        console.log(`${YELLOW}No file provided to test.${RESET}`);
        console.log("To test a specific RAW photo, drag and drop it onto this script command.");
        console.log("Example: node scripts/check-raw-support.js \"C:\\Photos\\img_001.CR2\"\n");
        return;
    }

    // 3. functional Test
    console.log(`2. Testing file: ${YELLOW}${path.basename(filePath)}${RESET}`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`${RED}❌ File not found at path:${RESET} ${filePath}`);
        return;
    }

    try {
        console.log("   Attempting to decode and resize...");
        const startTime = Date.now();
        
        // Attempt to create a thumbnail (same logic as the app)
        const buffer = await sharp(filePath)
            .resize(300, 300, { fit: 'inside' })
            .jpeg()
            .toBuffer();

        const duration = Date.now() - startTime;
        
        console.log(`${GREEN}✓ SUCCESS!${RESET}`);
        console.log(`   - Output: Valid JPEG Image`);
        console.log(`   - Size: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log(`   - Time: ${duration}ms`);
        console.log(`\n${GREEN}This file format IS supported by your current installation.${RESET}`);

    } catch (error) {
        console.error(`${RED}❌ FAILED to decode this file.${RESET}`);
        console.error(`   Error message: ${error.message}`);
        console.log(`\n${YELLOW}Troubleshooting:${RESET}`);
        console.log("   - If this is a .CR2/.NEF/.ARW, the default 'sharp' installation might not support it.");
        console.log("   - We may need to install a specific 'libvips' version or use a different RAW decoder.");
    }
}

runDiagnostic();
