import { chromium } from 'playwright';
import * as fs from 'fs';

interface CharacterRecord {
    name: string;
    publisher: string;
    character_type: string; // "anime", "cartoon", "comic", "game", "movie", "tv show", "real life", "unknown"
    imageUrls: string[];
    imageFocus: string;
}

type Target = {
    name: string,
    publisher: string;
    character_type: string
}

const targets: Target[] = [

];
//   { name: "", publisher: "", character_type: "cartoon" },

// to run command
// npx ts-node scripts/scrape-characters.ts

async function exportMultipleCharacterImages(): Promise<CharacterRecord[]> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const exportedRecords: CharacterRecord[] = [];

    try {
        for (const target of targets) {
            const page = await context.newPage();
            // const searchQuery = `${target.name} ${target.publisher} official art`;
            const searchQuery = `${target.name} ${target.publisher}`;
            const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;

            console.log(`Scraping 3 images for: ${target.name}...`);

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                // Wait for pin images to render
                await page.waitForSelector('img[src*="pinimg.com"]', { timeout: 10000 });

                // Grab ALL matching image sources on the page
                const rawImgSrcs = await page.$$eval('img[src*="pinimg.com"]', (imgs) =>
                    imgs.map((img) => img.getAttribute('src')).filter((src): src is string => src !== null)
                );

                // Clean, format, deduplicate, and take the first 3 valid URLs
                const uniqueHighResUrls = Array.from(
                    new Set(
                        rawImgSrcs.map((src) =>
                            src.replace(/\/\d+x\//, '/originals/').replace(/\/230x\//, '/originals/')
                        )
                    )
                ).slice(0, 3); // Limit to 3 images

                if (uniqueHighResUrls.length > 0) {
                    exportedRecords.push({
                        name: target.name,
                        publisher: target.publisher,
                        character_type: target.character_type,
                        imageUrls: uniqueHighResUrls,
                        imageFocus: "50% 15%"
                    });

                    console.log(`Successfully mapped ${uniqueHighResUrls.length} images for ${target.name}`);
                }
            } catch (err) {
                console.error(`Error fetching images for ${target.name}:`, err);
            } finally {
                await page.close();
            }

            // Polite delay between requests
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    } finally {
        await browser.close();
    }

    // Export to JSON
    fs.writeFileSync('characters_export.json', JSON.stringify(exportedRecords, null, 2), 'utf-8');
    console.log('Export complete! Saved to characters_export.json');

    return exportedRecords;
}

exportMultipleCharacterImages();