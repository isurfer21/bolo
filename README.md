# bolo
Batch TTS converter for macOS

A lightweight, blazing-fast native Bun CLI tool that reads text from a single-column CSV file and converts each row into an audio file using macOS native Text-to-Speech (`say`).

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- macOS (uses the native `say` terminal utility)

## Setup

1. Clone or navigate to the repository directory.
2. Install the required dependencies:

```bash
   bun install
```

## Installation

To access the command system-wide:

```bash
bun link
```

## Usage

Run the tool using `bun` by providing the path to your 1-column CSV file and the target output directory:

```bash
bolo <path-to-csv> <output-directory>
```

### Example

If you have a `phrases.csv` file with text strings line by line:

```bash
bolo phrases.csv ./audio-output
```

This will generate sequentially numbered `.aiff` audio files inside the `./audio-output` directory (e.g., `001_audio.aiff`, `002_audio.aiff`, etc.).

## Dependencies

* `@std/csv` - Fast, compliant CSV parser imported via JSR registry integration.
