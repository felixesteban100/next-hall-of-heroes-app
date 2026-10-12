// app/api/admin/process-images/route.ts
import { NextResponse } from "next/server";
import smartcrop from "smartcrop-sharp";
import sharp from "sharp";
import { collectionCharacters } from "@/db/mongodb";

export async function GET() {
    try {
        const characters = await collectionCharacters.find({ imageFocus: { $exists: false } })/* .limit(10) */.toArray();
        let processedCount = 0;
        let errors = [];

        for (const char of characters) {
            try {
                if (!char.images?.md) {
                    continue;
                }

                const response = await fetch(char.images.md);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    throw new Error("Received empty buffer from fetch response");
                }
                const buffer = Buffer.from(arrayBuffer);

                const metadata = await sharp(buffer).metadata();
                const cropResult = await smartcrop.crop(buffer, { width: 300, height: 300 });
                const topCrop = cropResult.topCrop;

                const xPct = Math.round((topCrop.x / (metadata.width || 300)) * 100);
                const yPct = Math.round((topCrop.y / (metadata.height || 300)) * 100);
                const focusString = `${xPct}% ${yPct}%`;

                await collectionCharacters.updateOne(
                    { id: char.id },
                    { $set: { imageFocus: focusString } }
                );

                processedCount++;
            } catch (err: any) {
                errors.push({ id: char.id, name: char.name, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedCount,
            skippedOrFailed: errors.length,
            errors
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}