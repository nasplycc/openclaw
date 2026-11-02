import { describe, expect, it } from "vitest";
import { matchExample, parseSkillExamples, type SkillExample } from "./example-parser.js";

describe("parseSkillExamples", () => {
  it("should parse single example block", () => {
    const description = `This skill should be used when... Examples:

<example>
Context: User wants to check PR status
user: "Check if PR #55 is ready to merge"
assistant: "I'll use the github skill"
<commentary>
This triggers because user asks about PR status
</commentary>
</example>`;

    const examples = parseSkillExamples(description);
    expect(examples).toHaveLength(1);
    expect(examples[0]).toEqual({
      context: "User wants to check PR status",
      user: "Check if PR #55 is ready to merge",
      assistant: "I'll use the github skill",
      commentary: "This triggers because user asks about PR status",
    });
  });

  it("should parse multiple example blocks", () => {
    const description = `Examples:

<example>
Context: First scenario
user: "First query"
assistant: "First response"
</example>

<example>
Context: Second scenario
user: "Second query"
assistant: "Second response"
</example>`;

    const examples = parseSkillExamples(description);
    expect(examples).toHaveLength(2);
    expect(examples[0].context).toBe("First scenario");
    expect(examples[1].context).toBe("Second scenario");
  });

  it("should handle missing fields", () => {
    const description = `<example>
user: "Query without context"
</example>`;

    const examples = parseSkillExamples(description);
    expect(examples).toHaveLength(1);
    expect(examples[0].user).toBe("Query without context");
    expect(examples[0].context).toBeUndefined();
  });

  it("should return empty array for no examples", () => {
    const description = "This skill does something useful.";
    const examples = parseSkillExamples(description);
    expect(examples).toHaveLength(0);
  });
});

describe("matchExample", () => {
  const example: SkillExample = {
    context: "User wants to check PR status",
    user: "Check if PR #55 is ready to merge",
    assistant: "I'll use the github skill",
    commentary: "This triggers because user asks about PR status",
  };

  it("should match when keywords overlap", () => {
    expect(matchExample(example, "Check if PR #55 is ready to merge")).toBe(true);
    expect(matchExample(example, "Is PR 55 ready?")).toBe(true);
    expect(matchExample(example, "PR status check")).toBe(true);
  });

  it("should not match when keywords don't overlap", () => {
    expect(matchExample(example, "Create a new issue")).toBe(false);
    expect(matchExample(example, "Merge the pull request")).toBe(false);
  });

  it("should handle case insensitivity", () => {
    expect(matchExample(example, "check if pr #55 is ready")).toBe(true);
    expect(matchExample(example, "CHECK IF PR #55 IS READY")).toBe(true);
  });

  it("should handle example without user field", () => {
    const exampleNoUser: SkillExample = {
      context: "Some context",
      commentary: "Some commentary",
    };
    expect(matchExample(exampleNoUser, "any query")).toBe(false);
  });
});

describe("extractKeywords", () => {
  // Internal function test via matchExample behavior
  it("should filter stop words", () => {
    // "the" and "is" should be filtered
    expect(matchExample({ user: "the PR is ready" }, "PR ready")).toBe(true);
  });

  it("should filter short words", () => {
    // "a" should be filtered
    expect(matchExample({ user: "check a PR" }, "check PR")).toBe(true);
  });
});
