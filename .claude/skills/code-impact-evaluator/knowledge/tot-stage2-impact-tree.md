# ToT Stage 2: Impact Tree Exploration

**⚠️ THIS IS INTERNAL REASONING - DO NOT OUTPUT THESE DETAILS**

## Objective
Systematically explore the tree of impacts for each validated hypothesis using adaptive search strategies and explicit backtracking.

## Search Algorithm Selection

From Stage 1, we determined the search strategy based on complexity score:

- **BFS Mode (Score 3-5)**: Breadth-First Search
  - Explore all hypotheses level-by-level in parallel
  - Good for moderate complexity with multiple possible impacts
  - Prevents getting stuck in one deep path

- **DFS Mode (Score 6+)**: Depth-First Search  
  - Deep dive into highest-priority hypothesis first
  - Good for critical changes requiring thorough exploration
  - Follows most concerning path to its conclusion

## Five-Step Process

### Step 1: Direct Impact Discovery (Level 1)

For each hypothesis from Stage 1, identify immediate impacts:

```markdown
=== Hypothesis: {{HYPOTHESIS_NAME}} ===

Direct Impacts (Level 1):

1. **{{FILE_OR_MODULE_NAME}}** ({{IMPACT_TYPE}})
   - Severity: 🔴 Critical | 🟡 Warning | 🟢 Info
   - Impact Scope: [1-10 scale]
   - Description: {{WHAT_IS_AFFECTED}}
   - Evidence: {{CODE_PATTERN_OR_DEPENDENCY}}
   - Status: ACTIVE | DEAD-END
   
2. **{{FILE_OR_MODULE_NAME}}** ({{IMPACT_TYPE}})
   [Same structure]

3. ...
```

**Impact Types:**
- Breaking Change
- Compatibility Issue
- Type Propagation
- Performance Change
- Security Concern
- Test Update Required
- Documentation Update

**Severity Assignment:**
- 🔴 Critical: Breaks functionality, security issue, data loss risk
- 🟡 Warning: Compatibility issue, requires careful attention
- 🟢 Info: Minor change, low risk

**Status Assignment:**
- ACTIVE: Worth exploring further
- DEAD-END: No significant downstream impact

### Step 2: Indirect Impact Expansion (Level 2+)

For each ACTIVE path from Level 1, explore downstream effects:

```markdown
=== Expanding: {{PARENT_IMPACT}} → Level 2 ===

Indirect Impacts:

1. **Type Propagation**
   - {{TYPE_NAME}} changes affect {{N}} type definitions
   - Files: {{LIST_OF_AFFECTED_FILES}}
   - Severity: {{LEVEL}}
   - Continue?: YES | NO (reason)

2. **Data Flow Dependencies**
   - {{FUNCTION_NAME}} is called by {{N}} other functions
   - Call chain: {{A}} → {{B}} → {{C}}
   - Severity: {{LEVEL}}
   - Continue?: YES | NO (reason)

3. **Performance Implications**
   - Async overhead may increase response time
   - Affected endpoints: {{LIST}}
   - Estimated impact: {{PERCENTAGE}}
   - Continue?: YES | NO (reason)

4. **Error Handling Chain**
   - New async errors need try-catch blocks
   - Affected error handlers: {{LIST}}
   - Severity: {{LEVEL}}
   - Continue?: YES | NO (reason)

5. **Test Coverage**
   - Affected test files: {{LIST}}
   - Tests need async updates
   - Severity: {{LEVEL}}
   - Continue?: YES | NO (reason)
```

**Backtracking Triggers** (PRUNE this path if):

| Condition | Action | Reasoning |
|-----------|--------|-----------|
| Severity drops to 🟢 at Level 2 | PRUNE ✂️ | Minor impacts don't warrant deep exploration |
| No new files affected at Level 3+ | PRUNE ✂️ | Impact contained, no further propagation |
| Expert consensus: "impossible" | PRUNE ✂️ | Professional judgment overrides speculation |
| Duplicate of existing path | PRUNE ✂️ | Avoid redundant analysis |
| Contradicts proven fact | PRUNE ✂️ | Evidence-based elimination |
| Critical severity maintained | CONTINUE ➡️ | Deep impact requires full exploration |
| Uncovers new attack surface | CONTINUE ➡️ | Security implications need tracking |

**Example Backtracking Decision:**

```markdown
Path: getFromCache → DataLoader → API Response Layer → Frontend

Level 1: getFromCache (Breaking Change) 🔴 → ACTIVE
Level 2: DataLoader (Compatibility Issue) 🟡 → ACTIVE
Level 3: API Response Layer (Timeout Config) 🟢 → PRUNE ✂️
  Reason: Severity dropped to Info, unlikely to cause issues

Alternative Path:
Level 1: getFromCache (Breaking Change) 🔴 → ACTIVE
Level 2: Type System (Promise<T> propagation) 🟡 → ACTIVE
Level 3: Generic Constraints (5 files affected) 🟡 → CONTINUE ➡️
  Reason: Severity maintained, new files discovered
Level 4: Consumer Code (14 call sites) 🔴 → CONTINUE ➡️
  Reason: Critical - breaks existing functionality
```

### Step 3: Cross-Hypothesis Validation

Compare impact trees across different hypotheses to build confidence:

```markdown
=== Cross-Hypothesis Validation ===

OVERLAPPING Impacts (Multiple hypotheses predict):
- Impact: "14 files need await keyword"
  - Predicted by: Hypothesis A1 (Async), Hypothesis B1 (Fallback)
  - Confidence: HIGH ✅✅
  - Priority: MUST DO (consensus)

- Impact: "Type definitions need Promise<T>"
  - Predicted by: Hypothesis A1 (Async), Hypothesis A2 (Distributed)
  - Confidence: HIGH ✅✅
  - Priority: MUST DO (consensus)

UNIQUE Impacts (Only one hypothesis predicts):
- Impact: "Network retry logic needed"
  - Predicted by: Hypothesis A2 (Distributed) only
  - Confidence: MEDIUM ⚠️
  - Priority: CONSIDER (single hypothesis, no validation)

- Impact: "Cache warming strategy needed"
  - Predicted by: Hypothesis C1 (Optimize) only
  - Confidence: MEDIUM ⚠️
  - Priority: CONSIDER (nice-to-have)

CONTRADICTING Impacts (Hypotheses predict opposite):
- Hypothesis A1: "Performance will degrade (async overhead)"
- Hypothesis C1: "Performance will improve (better cache hits)"
  → REVISIT Stage 1, need expert re-evaluation
  → Likely both are true in different scenarios
```

**Confidence Scoring:**
- **HIGH**: 2+ hypotheses agree, strong evidence
- **MEDIUM**: Single hypothesis, reasonable evidence
- **LOW**: Speculative, weak evidence

### Step 4: Dead-End Documentation

Track all pruned paths for learning and transparency:

```markdown
=== Dead-End Paths (Pruned) ===

1. **Worker Thread Synchronization**
   - Initial Hypothesis: "Async breaks worker thread usage"
   - Investigation: Checked for worker thread patterns
   - Finding: No worker threads in codebase
   - Pruned at: Level 2
   - Flagged by: Expert A
   - Learning: Always check for actual usage before assuming impact

2. **Legacy Callback Code**
   - Initial Hypothesis: "Breaks callback-based code"
   - Investigation: Searched for callback patterns
   - Finding: All legacy code migrated to Promises in v2.0
   - Pruned at: Level 1
   - Flagged by: Expert C
   - Learning: Check migration history before flagging legacy concerns

3. **Circular Dependency Risk**
   - Initial Hypothesis: "Async creates circular dependencies"
   - Investigation: Analyzed module graph
   - Finding: No circular dependencies in cache module
   - Pruned at: Level 2
   - Flagged by: Expert B
   - Learning: Use actual dependency graph, not speculation
```

**Learning Categories:**
- False Positives: Seemed relevant but proved false
- Misleading Patterns: Code patterns that suggest issues but don't cause them
- Historical Context: Past migrations or refactorings that resolved concerns

### Step 5: Impact Tree Consolidation

Merge all findings into a unified impact map:

```markdown
=== Unified Impact Map ===

Prioritized by: (Severity × Scope × Confidence)

1. **Breaking API Change** [Score: 🔴 × 10 × HIGH = CRITICAL]
   - Affected: 14 call sites across 8 files
   - Change: sync → async function signature
   - Validation: Confirmed by 2 hypotheses
   - Actions Required:
     → Add await to all call sites
     → Update TypeScript definitions
     → Modify tests to async

2. **Type System Propagation** [Score: 🟡 × 8 × HIGH = HIGH]
   - Affected: 5 type definitions
   - Change: CacheValue → Promise<CacheValue>
   - Validation: Confirmed by 2 hypotheses
   - Actions Required:
     → Update type files
     → Check generic constraints
     → Verify type exports

3. **Error Handling Updates** [Score: 🟡 × 6 × MEDIUM = MEDIUM]
   - Affected: Error recovery logic
   - Change: Sync errors → async errors
   - Validation: Single hypothesis
   - Actions Recommended:
     → Add try-catch blocks
     → Implement error logging
     → Test error scenarios

4. **Performance Monitoring** [Score: 🟢 × 4 × MEDIUM = LOW]
   - Affected: Performance metrics
   - Change: Response time patterns
   - Validation: Single hypothesis (contested)
   - Actions Consider:
     → Add performance tracking
     → Monitor cache hit rates
     → A/B test if possible
```

**Consolidation Rules:**
1. OVERLAPPING impacts → Merge and prioritize as MUST DO
2. UNIQUE impacts with HIGH severity → Promote to SHOULD DO
3. UNIQUE impacts with MEDIUM severity → Keep as CONSIDER
4. CONTRADICTING impacts → Document both perspectives
5. DEAD-END paths → Exclude from output (but keep for internal learning)

## Search Strategy Examples

### BFS Example (Score 3-5)

```
Level 1 (All Hypotheses):
  Hypothesis A: Direct Impact 1, Direct Impact 2
  Hypothesis B: Direct Impact 3, Direct Impact 4
  Hypothesis C: Direct Impact 5

Level 2 (Expand All Active from Level 1):
  Impact 1 → Indirect A, Indirect B
  Impact 2 → Indirect C (PRUNED - severity dropped)
  Impact 3 → Indirect D, Indirect E
  Impact 4 → Indirect F (PRUNED - duplicate)
  Impact 5 → Indirect G

Level 3 (Continue Active from Level 2):
  Indirect A → Deeper Impact X
  Indirect B → Deeper Impact Y (PRUNED - no new files)
  Indirect D → Deeper Impact Z
  ...
```

**Advantage**: Covers all hypotheses evenly, good for moderate complexity.

### DFS Example (Score 6+)

```
Hypothesis A (Highest Priority):
  Level 1: Direct Impact 1 (CRITICAL) → DIVE DEEPER
    Level 2: Indirect A (HIGH) → CONTINUE
      Level 3: Deeper X (HIGH) → CONTINUE
        Level 4: Even Deeper X1 (MEDIUM) → CONTINUE
          Level 5: Bottom X1a (LOW) → PRUNE ✂️
          Backtrack to Level 4
        Level 4: Even Deeper X2 (HIGH) → CONTINUE
          Level 5: Bottom X2a (CRITICAL) → FOUND KEY INSIGHT! 🎯
          Document and continue
    Level 2: Indirect B (MEDIUM) → CONTINUE
      Level 3: Deeper Y (LOW) → PRUNE ✂️
      Backtrack to Level 2
  Level 1: Direct Impact 2 (MEDIUM) → CONTINUE
    ...

Hypothesis B (Second Priority):
  [Continue DFS on next hypothesis]
```

**Advantage**: Deep exploration of critical paths, good for high-risk changes.

## Output to Stage 3

The consolidated impact map becomes input for Stage 3 (Risk Consolidation).

**DO NOT OUTPUT THESE DETAILS TO USER** - This is internal reasoning.

Key outputs:
- Unified impact map with severity × scope × confidence scores
- List of affected areas (files, types, APIs)
- Prioritized action items (Must/Should/Consider)
- Evidence trail for each impact
- Dead-end documentation (internal learning only)

Next stage will consolidate these findings through iterative expert consensus.
