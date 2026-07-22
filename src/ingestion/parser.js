import fs from "fs/promises";
import path from "path";
import srtParser2 from "srt-parser-2";
import { parse as parseVtt } from "node-webvtt";

function formatSecondsToTime(seconds) {
  const date = new Date(null);
  date.setSeconds(seconds);
  return date.toISOString().slice(11, 19);
}

async function parseSRT(filePath, lessonName) {
  const content = await fs.readFile(filePath, "utf-8");
  const parser = new srtParser2();
  const parsedData = parser.fromSrt(content);

  return parsedData.map((block) => ({
    lessonName,
    startTime: block.startTime.split(",")[0],
    endTime: block.endTime.split(",")[0],
    text: block.text.replace(/\n/g, " ").trim(),
  }));
}

async function parseVTT(filePath, lessonName) {
  const content = await fs.readFile(filePath, "utf-8");
  const parsedData = parseVtt(content, { strict: false });

  return parsedData.cues.map((cue) => ({
    lessonName,
    startTime: formatSecondsToTime(cue.start),
    endTime: formatSecondsToTime(cue.end),
    text: cue.text.replace(/\n/g, " ").trim(),
  }));
}

export async function processTranscripts(directoryPath) {
  const dirents = await fs.readdir(directoryPath, {
    withFileTypes: true,
    recursive: true,
  });
  let allChunks = [];

  for (const dirent of dirents) {
    if (!dirent.isFile()) continue;

    const ext = path.extname(dirent.name).toLowerCase();
    if (ext !== ".srt" && ext !== ".vtt") continue;

    // FIX: Use dirent.parentPath (Node 20+) or fallback to dirent.path (older Node)
    const parentDir = dirent.parentPath || dirent.path;
    const filePath = path.join(parentDir, dirent.name);

    const lessonName = path.basename(dirent.name, ext);

    try {
      let chunks = [];
      if (ext === ".srt") {
        chunks = await parseSRT(filePath, lessonName);
      } else if (ext === ".vtt") {
        chunks = await parseVTT(filePath, lessonName);
      }

      allChunks.push(...chunks);
      console.log(
        `✅ Parsed: ${lessonName} (${chunks.length} segments extracted)`,
      );
    } catch (error) {
      console.error(`❌ Error parsing ${dirent.name}:`, error.message);
    }
  }

  return allChunks;
}
