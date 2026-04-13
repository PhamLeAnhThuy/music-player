---
name: commit-description-required
description: "Require commit descriptions with both title and detail. Use when creating commits or preparing git commit messages for backend, frontend, or full-stack changes."
argument-hint: "Provide changed files and context so the skill can produce a title + detailed body."
---

# Commit Description Required

## Purpose
Ensure every commit includes:
- A clear title (subject line)
- A detailed description (commit body)

This applies to backend-only, frontend-only, and backend+frontend commits.

## When To Use
- Before running git commit
- When user asks to commit and push
- When writing or reviewing commit messages
- When multiple files changed and context needs explanation

## Required Commit Format
Use this structure:

```text
<Title in imperative mood, <= 72 chars>

<Detail paragraph explaining why the change is needed>

Backend:
- <What changed in backend>

Frontend:
- <What changed in frontend>

Validation:
- <Checks run, test result, or "Not run"> 
```

## Rules
1. Title must describe the primary intent, not a generic action.
2. Detail section must explain what changed and why.
3. Do not include contributor tags or prefixes like `[dev2]`, `[dev]`, or `[bot]` in the title or body.
4. Always include both Backend and Frontend sections:
- If one side has no changes, write `- None`.
5. Validation must be explicit:
- Include commands/checks if run.
- If not run, state `Not run`.
6. Do not commit with title-only messages.
7. Check backend and frontend repositories independently before commit/push.
8. If a repository has no changes, do not create a commit and do not push for that repository.

## Agent Workflow
1. Inspect backend and frontend repository status independently.
2. Skip commit/push for any repository with no changes.
3. For each changed repository, inspect staged/targeted files.
4. Classify impact: backend, frontend, or both.
5. Draft commit title.
6. Draft detailed body using the required format.
7. Commit with title + body.
8. If user asks to push, push only repositories that had a commit.

## Example
```text
Add song-list route and protect authenticated screens

Improve Home navigation by opening category song lists in a dedicated view
and enforce persisted login routing so authenticated users skip sign-in.

Backend:
- None

Frontend:
- Added SongList screen and /song-list route
- Updated Home "See all" actions to navigate to SongList
- Added auth route guards in App routing

Validation:
- Type check: Not run
```
