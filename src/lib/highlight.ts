import { codeToHtml } from "shiki";

// Lesson content JSON never carries an explicit language tag on worked examples
// (180 lessons, hundreds of snippets -- retrofitting every entry isn't worth it for
// a display upgrade), so the language is inferred from the code itself. Order
// matters: more specific/unambiguous signatures first, generic ones last.
export function detectLanguage(code: string): string {
  if (/^FROM\s+\S+/m.test(code) && /\b(RUN|COPY|WORKDIR|EXPOSE|CMD|ENTRYPOINT)\b/.test(code)) return "docker";
  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|CREATE\s+INDEX)\b/im.test(code)) return "sql";
  if (/\b(public\s+class|public\s+static\s+void\s+main|System\.out)\b/.test(code)) return "java";
  if (/#include\s*[<"]|std::/.test(code)) return "cpp";
  if (/\b(interface\s+\w+|:\s*(string|number|boolean)\b)/.test(code)) return "typescript";
  if (/\b(const\s|let\s|=>|function\s*\(|console\.log)\b/.test(code)) return "javascript";
  if (/\b(def\s+\w+\(|import\s+\w+|elif\s|None\b|True\b|False\b|self\.)/.test(code)) return "python";
  if (/^\s*\$\s|^\s*(cd|ls|mkdir|docker|git|npm|curl|sudo|chmod|cat)\s/m.test(code)) return "bash";
  return "text";
}

// Both themes' colors are baked into one inline-styled render (light as the plain
// `color`/`background-color`, dark as `--shiki-dark`/`--shiki-dark-bg` custom
// properties) -- the `.dark .shiki` rule in globals.css picks the dark ones when the
// theme toggle is on dark. No client JS, no second render per theme.
const THEMES = { light: "github-light", dark: "github-dark" };

/** Server-only: pre-colored HTML with inline styles, no client JS/runtime cost. */
export async function highlightCode(code: string, lang?: string): Promise<string> {
  const language = lang ?? detectLanguage(code);
  try {
    return await codeToHtml(code, { lang: language, themes: THEMES });
  } catch {
    // Unknown/unsupported language id for whatever detectLanguage guessed --
    // fall back to plain-text highlighting rather than breaking the lesson page.
    return await codeToHtml(code, { lang: "text", themes: THEMES });
  }
}
