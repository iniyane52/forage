import stream1raw from "../../content/stream1.json";
import commoncoreRaw from "../../content/commoncore.json";
import aimlRaw from "../../content/aiml.json";
import sweRaw from "../../content/swe.json";
import fullstackRaw from "../../content/fullstack.json";
import dataRaw from "../../content/data.json";
import cyberRaw from "../../content/cyber.json";

export type Example = { code: string; note?: string };
export type Check = { q: string; a: string };
export type Resource = {
  label: string;
  url: string;
  kind: "docs" | "course" | "book" | "practice" | "video" | "reference" | "community";
};
export type Topic = {
  id: string;
  title: string;
  concept: string;
  analogy?: string;
  examples?: Example[];
  warn?: string;
  mistakes?: string[];
  handsOn: string;
  doneWhen: string;
  checks?: Check[];
  keyTakeaways?: string[];
  resources?: Resource[];
};
export type ContentModule = {
  id: string;
  title: string;
  tag?: string;
  tagClass?: string;
  why: string;
  topics: Topic[];
};

// Common Core first (free foundation), then Cloud & DevOps (ex-Stream 1), then the
// other Pro paths as their modules are authored.
export const commoncore: ContentModule[] = commoncoreRaw as ContentModule[];
export const stream1: ContentModule[] = stream1raw as ContentModule[];
export const aiml: ContentModule[] = aimlRaw as ContentModule[];
export const swe: ContentModule[] = sweRaw as ContentModule[];
export const fullstack: ContentModule[] = fullstackRaw as ContentModule[];
export const data: ContentModule[] = dataRaw as ContentModule[];
export const cyber: ContentModule[] = cyberRaw as ContentModule[];
const allModules: ContentModule[] = [...commoncore, ...stream1, ...aiml, ...swe, ...fullstack, ...data, ...cyber];

export type FlatLesson = { module: ContentModule; topic: Topic; index: number };

const flat: FlatLesson[] = [];
for (const m of allModules) for (const t of m.topics) flat.push({ module: m, topic: t, index: flat.length });

export function getAllLessons(): FlatLesson[] {
  return flat;
}

export function getLesson(slug: string): FlatLesson | undefined {
  return flat.find((l) => l.topic.id === slug);
}

export function getAdjacent(slug: string): { prev?: FlatLesson; next?: FlatLesson } {
  const i = flat.findIndex((l) => l.topic.id === slug);
  if (i === -1) return {};
  return { prev: flat[i - 1], next: flat[i + 1] };
}
