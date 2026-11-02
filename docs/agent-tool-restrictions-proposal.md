# Agent Tool Restrictions Proposal

> PR 3: Add tool restriction mechanism for subagents

---

## Summary

Add support for restricting which tools a subagent can use, improving security and control over autonomous agent execution.

---

## Problem

Currently, when spawning a subagent via `sessions_spawn`, the subagent inherits all tools from the parent session. This can be problematic when:

1. You want to limit a subagent to read-only operations
2. You want to restrict access to specific tools (e.g., no exec)
3. You want to create specialized agents with focused capabilities

---

## Proposed Solution

### 1. Add `toolsAllow` parameter to `sessions_spawn`

```typescript
sessions_spawn({
  runtime: "subagent",
  task: "Analyze this code...",
  toolsAllow: ["read", "write", "grep"], // Only these tools allowed
});
```

### 2. Add `toolsDeny` parameter (optional)

```typescript
sessions_spawn({
  runtime: "subagent",
  task: "Review this code...",
  toolsDeny: ["exec", "process"], // These tools blocked
});
```

### 3. Agent Definition Format (future)

```markdown
---
name: code-reviewer
description: Reviews code for quality...
tools: Glob, Grep, Read # Only these tools
model: sonnet
---

You are a code reviewer...
```

---

## Implementation Plan

### Phase 1: sessions_spawn parameters

**Files to modify**:

- `src/routing/sessions-spawn.ts` - Add toolsAllow/toolsDeny parameters
- `src/agents/subagent-runtime.ts` - Apply tool restrictions

**Estimated effort**: 2-3h

### Phase 2: Agent definition format

**Files to modify**:

- `src/agents/agent-scope.ts` - Parse tools from agent definition
- `src/agents/skills/types.ts` - Extend Agent type

**Estimated effort**: 3-4h

### Phase 3: Testing

**Test files**:

- `src/routing/sessions-spawn.test.ts`
- `src/agents/subagent-runtime.test.ts`

**Estimated effort**: 1-2h

---

## Risk Assessment

| Risk                    | Severity | Mitigation                            |
| ----------------------- | -------- | ------------------------------------- |
| Breaking changes        | Low      | Backward compatible (optional params) |
| Tool restriction bypass | Medium   | Enforce at runtime level              |
| Performance impact      | Low      | Minimal (simple array check)          |

**Overall Risk**: LOW

---

## Related

- PR #65150: Tool Hook event system
- PR #65186: Skill `<example>` trigger mechanism
- Claude Code Agent `tools` field

---

**Created**: 2026-04-12
**Status**: Proposal ready for implementation
