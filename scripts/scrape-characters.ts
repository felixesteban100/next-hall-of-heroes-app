import { chromium, type Page } from 'playwright';
import * as fs from 'fs';

interface CharacterRecord {
    name: string;
    publisher: string;
    character_type: string; // "anime", "cartoon", "comic", "game", "movie", "tv show", "real life", "unknown"
    imageUrls: string[];
    imageFocus: string;
    status: 'success' | 'failed';
    error?: string;
}

type Target = {
    name: string;
    publisher: string;
    character_type: string;
};

const IMAGES_PER_CHARACTER = 10;

//{ name: "", publisher: "", character_type: "cartoon" },
const targets: Target[] = [
    { name: "Lion-O", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Tygra", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Cheetara", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Panthro", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "WilyKit", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "WilyKat", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Snarf", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Jaga", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Claudus", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Bengali", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Pumyra", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Lynx-O", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Snarfer", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Mumm-Ra", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Slithe", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Jackalman", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Monkian", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Vultureman", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Ratar-O", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Grune", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Luna", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Alluro", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Amok", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Chilla", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Tug-Mug", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Red-Eye", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Hammerhand", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Ro-Bear-Bill", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Ro-Bear-Belle", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Willa", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Mandora", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Safari Joe", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Ta-She", publisher: "ThunderCats", character_type: "cartoon" },
    { name: "Jagara", publisher: "ThunderCats", character_type: "cartoon" }
];

// to run command:
// npx ts-node scripts/scrape-characters.ts

const randomDelay = (minMs: number, maxMs: number) =>
    new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs));

async function collectImages(page: Page, limit: number): Promise<string[]> {
    const collected = new Set<string>();
    let staleScrolls = 0; // Safety counter in case Pinterest runs out of results

    while (collected.size < limit && staleScrolls < 4) {
        const previousSize = collected.size;

        // Target ONLY i.pinimg.com (actual pin images, ignoring s.pinimg.com UI icons)
        const rawSrcs = await page.$$eval('img[src*="i.pinimg.com"]', (imgs) =>
            imgs.map((img) => img.getAttribute('src')).filter((src): src is string => src !== null)
        );

        for (const src of rawSrcs) {
            if (collected.size >= limit) break;

            // Ignore tiny user avatars
            if (src.includes('75x75') || src.includes('30x30')) continue;

            // Upgrade to high-res (/736x/ avoids occasional 403 errors from /originals/)
            const highRes = src.replace(/\/\d+x\//, '/736x/');
            collected.add(highRes);
        }

        if (collected.size >= limit) break;

        if (collected.size === previousSize) {
            staleScrolls++;
        } else {
            staleScrolls = 0;
        }

        // Scroll down to trigger Pinterest's infinite scroll lazy-loader
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1500);
    }

    return Array.from(collected).slice(0, limit);
}

async function exportCharacters(): Promise<CharacterRecord[]> {
    const browser = await chromium.launch({ headless: true });
    let context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const exportedRecords: CharacterRecord[] = [];
    const failedNames: string[] = [];

    try {
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];

            // Rotate browser context every 8 characters to clear cookies & avoid login walls
            if (i > 0 && i % 8 === 0) {
                await context.close();
                context = await browser.newContext({
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                });
            }

            const page = await context.newPage();
            // Omitting "official art" yields better results for secondary/minor characters
            const searchQuery = `${target.name} ${target.publisher}`;
            const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;

            console.log(`[${i + 1}/${targets.length}] Fetching ${IMAGES_PER_CHARACTER} images for: ${target.name}...`);

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForSelector('img[src*="i.pinimg.com"]', { timeout: 12000 });

                const imageUrls = await collectImages(page, IMAGES_PER_CHARACTER);

                if (imageUrls.length > 0) {
                    exportedRecords.push({
                        name: target.name,
                        publisher: target.publisher,
                        character_type: target.character_type,
                        imageUrls,
                        imageFocus: "50% 15%",
                        status: 'success'
                    });

                    console.log(`  ✓ Collected ${imageUrls.length}/${IMAGES_PER_CHARACTER} for ${target.name}`);
                } else {
                    throw new Error("No valid pin images found on page");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message.split('\n')[0] : String(err);
                console.warn(`  ✗ Failed for ${target.name}: ${errorMessage}`);

                failedNames.push(target.name);
                exportedRecords.push({
                    name: target.name,
                    publisher: target.publisher,
                    character_type: target.character_type,
                    imageUrls: [],
                    imageFocus: "50% 15%",
                    status: 'failed',
                    error: errorMessage
                });
            } finally {
                await page.close();
            }

            // Randomized 4s - 6.5s delay to avoid rate limits
            await randomDelay(4000, 6500);
        }
    } finally {
        await browser.close();
    }

    fs.writeFileSync('characters_export.json', JSON.stringify(exportedRecords, null, 2), 'utf-8');

    console.log('\n=========================================');
    console.log(`DONE! Saved to characters_export.json`);
    console.log(`Total:     ${targets.length}`);
    console.log(`Succeeded: ${targets.length - failedNames.length}`);
    console.log(`Failed:    ${failedNames.length}`);
    if (failedNames.length > 0) {
        console.log(`Failed Characters: ${failedNames.join(', ')}`);
    }
    console.log('=========================================\n');

    return exportedRecords;
}

exportCharacters();