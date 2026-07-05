import stream1raw from "../../content/stream1.json";
import commoncoreRaw from "../../content/commoncore.json";

export type Example = { code: string; note?: string };
export type Check = { q: string; a: string };
export type Resource = { label: string; url: string; kind: "docs" | "course" | "book" | "practice" };
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

// Common Core first (free foundation), then the Cloud & DevOps content (ex-Stream 1).
export const commoncore: ContentModule[] = commoncoreRaw as ContentModule[];
export const stream1: ContentModule[] = stream1raw as ContentModule[];
const allModules: ContentModule[] = [...commoncore, ...stream1];

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
