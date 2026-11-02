/**
 * Parser for <example> blocks in skill descriptions
 *
 * Example format:
 * ```markdown
 * description: This skill should be used when... Examples:
 *
 * <example>
 * Context: User wants to check PR status
 * user: "Check if PR #55 is ready to merge"
 * assistant: "I'll use the github skill"
 * <commentary>
 * This triggers because user asks about PR status
 * </commentary>
 * </example>
 * ```
 */

export type SkillExample = {
  context?: string;
  user?: string;
  assistant?: string;
  commentary?: string;
};

/**
 * Parse <example> blocks from skill description
 */
export function parseSkillExamples(description: string): SkillExample[] {
  const examples: SkillExample[] = [];
  const regex = /<example>([\s\S]*?)<\/example>/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(description)) !== null) {
    const block = match[1];
    const example: SkillExample = {
      context: extractTextField(block, "Context"),
      user: extractTextField(block, "user"),
      assistant: extractTextField(block, "assistant"),
      commentary: extractCommentary(block),
    };
    examples.push(example);
  }

  return examples;
}

/**
 * Extract a text field value from an example block
 */
function extractTextField(block: string, fieldName: string): string | undefined {
  const pattern = new RegExp(`${fieldName}:\\s*([^\\n]+)`, "i");
  const match = block.match(pattern);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract commentary from <commentary> tags
 */
function extractCommentary(block: string): string | undefined {
  const pattern = /<commentary>([\s\S]*?)<\/commentary>/i;
  const match = block.match(pattern);
  return match ? match[1].trim() : undefined;
}

/**
 * Check if user input matches an example
 */
export function matchExample(example: SkillExample, userInput: string): boolean {
  if (!example.user) {
    return false;
  }

  // Extract keywords from example user input
  const exampleKeywords = extractKeywords(example.user);
  const inputKeywords = extractKeywords(userInput);

  // Check if any keyword matches
  for (const keyword of exampleKeywords) {
    if (inputKeywords.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Extract keywords from text for matching
 */
function extractKeywords(text: string): string[] {
  // Remove quotes and common stop words
  const cleaned = text
    .toLowerCase()
    .replace(/["']/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !isStopWord(word));

  return [...new Set(cleaned)];
}

/**
 * Common stop words to ignore
 */
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "and",
    "or",
    "but",
    "if",
    "then",
    "else",
    "when",
    "how",
    "what",
    "which",
    "who",
    "whom",
    "whose",
    "why",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
  ]);
  return stopWords.has(word);
}
