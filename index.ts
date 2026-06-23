#!/usr/bin/env bun

// Bun natively supports jsr: specifiers out of the box!
import { parse } from "@std/csv";

// 1. Parse and validate CLI arguments
const [csvPath, outputDir] = Bun.argv.slice(2);

if (!csvPath || !outputDir) {
  console.error("❌ Error: Missing arguments.");
  console.log("Usage: bolo <path-to-csv> <output-directory> [--voice <artist-name>] [--rate <wpm-speed>]");
  process.exit(1);
}

// Optional voice artist name (e.g., "Alice", "Bob")
const voiceArgIndex = Bun.argv.findIndex(arg => arg.startsWith("--voice"));
let selectedVoice: string | undefined;
if (voiceArgIndex !== -1 && Bun.argv[voiceArgIndex + 1]) {
  const providedVoice = Bun.argv[voiceArgIndex + 1];
  if (!providedVoice || !/^[A-Za-z\s]+$/.test(providedVoice)) {
    console.error("❌ Error: Invalid voice name. Use a valid macOS system voice (e.g., 'Alice', 'Bob').");
    process.exit(1);
  }
  selectedVoice = providedVoice;
}

if (!selectedVoice) {
  // Default to first available voice if none specified
  console.log("ℹ️ Using default voice.");
} else {
  console.log(`🎭 Selected voice: "${selectedVoice}"`);
}

// Optional voice over speed 
// 120–140 wpm: Slower rate, excellent for careful listening or language learning.
// 150–180 wpm: Comfortable default pace for standard narration.
// 200–250 wpm: Faster pace, great for scanning or reviewing text quickly.
// 300+ wpm: Highly accelerated speed for rapid playback.
const rateArgIndex = Bun.argv.findIndex(arg => arg.startsWith("--rate"));
let selectedRate: string | undefined;
if (rateArgIndex !== -1 && Bun.argv[rateArgIndex + 1]) {
  const providedRate = Bun.argv[rateArgIndex + 1];
  if (!providedRate || !/^[0-9]+$/.test(providedRate)) {
    console.error("❌ Error: Invalid wpm rate number. Use a valid macOS system rate (e.g., in between 120 to 300).");
    process.exit(1);
  }
  selectedRate = providedRate;
}

try {
  // 2. Read and parse the CSV file using Bun.file and JSR's parse
  const csvFile = Bun.file(csvPath);
  if (!(await csvFile.exists())) {
    console.error(`❌ Error: CSV file not found at "${csvPath}"`);
    process.exit(1);
  }
  
  const fileContent = await csvFile.text();
  
  // @std/csv parse() returns an array of arrays by default
  const rows = parse(fileContent);

  console.log(`🚀 Starting TTS conversion for ${rows.length} rows...\n`);

  // Ensure output directory doesn't have a trailing slash
  const cleanOutputDir = outputDir.replace(/\/$/, "");

  // 3. Loop through rows and convert to audio
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) {
      console.log(`⚠️ Skipping row ${i + 1}: Invalid data.`);
      continue;
    }
    // Get the first column item
    const text = row[0]?.trim();

    if (!text) {
      console.log(`⚠️ Skipping row ${i + 1}: Empty line.`);
      continue;
    }

    // Generate a clean filename (e.g., 001_audio.aiff)
    const fileIndex = String(i + 1).padStart(3, "0");
    const outputPath = `${cleanOutputDir}/${fileIndex}_audio.aiff`;

    console.log(`🎙️ Processing [${fileIndex}]: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);

    // 4. Execute the macOS native 'say' command with optional voice selection
    const sayArgs = ["say", text, "-o", outputPath];
    if (selectedVoice) {
      sayArgs.splice(1, 0, "-v", selectedVoice);
    }
    if (selectedRate) {
      sayArgs.splice(1, 0, "-r", selectedRate);
    }

    const process = Bun.spawn(sayArgs);
    
    // Wait for the current audio file to finish generating
    await process.exited;
  }

  console.log(`\n🎉 Success! All audio files saved to: ${cleanOutputDir}`);

} catch (error) {
  console.error("❌ An error occurred:", error instanceof Error ? error.message : error);
  process.exit(1);
}