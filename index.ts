#!/usr/bin/env bun

// Bun natively supports jsr: specifiers out of the box!
import { parse } from "@std/csv";

// 1. Parse and validate CLI arguments
const [csvPath, outputDir] = Bun.argv.slice(2);

if (!csvPath || !outputDir) {
  console.error("❌ Error: Missing arguments.");
  console.log("Usage: bolo <path-to-csv> <output-directory>");
  process.exit(1);
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

    // 4. Execute the macOS native 'say' command
    const process = Bun.spawn(["say", text, "-o", outputPath]);
    
    // Wait for the current audio file to finish generating
    await process.exited;
  }

  console.log(`\n🎉 Success! All audio files saved to: ${cleanOutputDir}`);

} catch (error) {
  console.error("❌ An error occurred:", error instanceof Error ? error.message : error);
  process.exit(1);
}