# ToT Stage 1: Collaborative Hypothesis Generation

**⚠️ THIS IS INTERNAL REASONING - DO NOT OUTPUT THESE DETAILS**

## Objective
Generate high-quality hypotheses about change intent through multi-expert collaborative review with progressive refinement.

## Search Strategy Selection

Based on complexity score from assessment:

- **Score 3-5**: Use **BFS (Breadth-First Search)**
  - Explore multiple hypotheses in parallel
  - Good for moderate complexity with multiple possible intents
  
- **Score 6+**: Use **DFS (Depth-First Search)**
  - Deep dive into highest-priority hypothesis first
  - Good for complex changes with clear primary concern

## Three-Round Progressive Refinement

### Round 1: Independent Hypothesis Generation

**Each expert generates 2 hypotheses independently**

```markdown
=== Expert A - Senior Architect (System Design Perspective) ===

Hypothesis A1: [State the hypothesis clearly]
- Likelihood: 확실함 (Certain) | 아마도 (Maybe) | 불가능함 (Impossible)
- Reasoning: [Why this might be the intent]
- Evidence from code: [Specific code patterns observed]
- Confidence: [0-100%]

Hypothesis A2: [State the hypothesis clearly]
- Likelihood: 확실함 | 아마도 | 불가능함
- Reasoning: [Why this might be the intent]
- Evidence from code: [Specific code patterns observed]
- Confidence: [0-100%]

=== Expert B - Security & Quality Specialist ===

Hypothesis B1: [State the hypothesis clearly]
- Likelihood: 확실함 | 아마도 | 불가능함
- Reasoning: [Security/quality angle]
- Evidence from code: [Security patterns, quality indicators]
- Confidence: [0-100%]

Hypothesis B2: [State the hypothesis clearly]
- Likelihood: 확실함 | 아마도 | 불가능함
- Reasoning: [Security/quality angle]
- Evidence from code: [Security patterns, quality indicators]
- Confidence: [0-100%]

=== Expert C - Performance Engineer ===

Hypothesis C1: [State the hypothesis clearly]
- Likelihood: 확실함 | 아마도 | 불가능함
- Reasoning: [Performance angle]
- Evidence from code: [Performance patterns, bottlenecks]
- Confidence: [0-100%]

Hypothesis C2: [State the hypothesis clearly]
- Likelihood: 확실함 | 아마도 | 불가능함
- Reasoning: [Performance angle]
- Evidence from code: [Performance patterns, bottlenecks]
- Confidence: [0-100%]
```

### Round 2: Cross-Expert Review (Share with Group)

**Each expert reviews and challenges others' hypotheses**

```markdown
=== Expert A responds to B's and C's hypotheses ===

Re: Expert B's Hypothesis B1:
- Agreement/Challenge: [Do I agree or disagree?]
- Additional Evidence: [Support or counter-evidence from my perspective]
- Updated Confidence: [My confidence in this hypothesis]
- Contradictions: [Any logical issues I see]

Re: Expert B's Hypothesis B2:
[Same structure]

Re: Expert C's Hypothesis C1:
[Same structure]

Re: Expert C's Hypothesis C2:
[Same structure]

=== Expert B responds to A's and C's hypotheses ===
[Same structure for all A and C hypotheses]

=== Expert C responds to A's and B's hypotheses ===
[Same structure for all A and B hypotheses]
```

### Round 3: Expert Self-Correction (Leave if Wrong)

**Each expert re-evaluates their own hypotheses based on peer feedback**

```markdown
=== Expert A Self-Correction ===

Hypothesis A1 Review:
- Peer Feedback Summary: [What did B and C say?]
- Strong Counter-Evidence?: [Did 2+ experts contradict with evidence?]
- My Updated Confidence: [0-100%]
- Decision: KEEP | LEAVE
- Reason: [Why keeping or leaving]

Hypothesis A2 Review:
[Same structure]

=== Expert B Self-Correction ===
[Same structure]

=== Expert C Self-Correction ===
[Same structure]
```

**Leaving Criteria:**
- ❌ Contradicted by strong evidence from 2+ experts → LEAVE
- ❌ Confidence drops below 30% after review → LEAVE
- ❌ Becomes "불가능함" after peer feedback → LEAVE
- ✅ Confidence 50%+ and at least "아마도" → KEEP

### Final Filter

```markdown
=== Hypothesis Filtering Results ===

KEPT Hypotheses:
1. [Hypothesis name] - Supported by [Expert A, B] - Confidence: 75%
2. [Hypothesis name] - Supported by [Expert B, C] - Confidence: 80%
3. [Hypothesis name] - Supported by [Expert A, C] - Confidence: 65%

DISCARDED Hypotheses:
- [Hypothesis name] - Reason: Contradicted by 2 experts, confidence dropped to 20%
- [Hypothesis name] - Reason: Expert self-correction revealed logical flaw
- [Hypothesis name] - Reason: Marked as "불가능함" after review

MERGED Hypotheses:
- [Hypothesis X] + [Hypothesis Y] → [Combined hypothesis]
  Reason: Both experts described the same intent from different angles

=== Final Hypothesis Set for Stage 2 ===
Typically 2-4 high-quality hypotheses remain
Each has:
- Clear statement
- 50%+ confidence
- Multi-expert validation or at minimum no strong contradiction
- Evidence-based reasoning
```

## Example: Async Cache Conversion

### Round 1: Independent Generation

```markdown
=== Expert A - Senior Architect ===

Hypothesis A1: Converting to async pattern for better concurrency
- Likelihood: 확실함 ✅
- Reasoning: Function signature changed from sync to async, added await keywords
- Evidence: `async function`, `await cache.get()`, `Promise<T>` return type
- Confidence: 90%

Hypothesis A2: Preparing for distributed caching system
- Likelihood: 아마도 🟡
- Reasoning: Async is prerequisite for network-based caching
- Evidence: Async pattern, but no network imports yet
- Confidence: 60%

=== Expert B - Security & Quality ===

Hypothesis B1: Adding fallback mechanism for reliability
- Likelihood: 확실함 ✅
- Reasoning: New `fetchFallback()` call in return statement
- Evidence: `value ?? (await fetchFallback(key))`
- Confidence: 95%

Hypothesis B2: Fixing a race condition bug
- Likelihood: 불가능함 ❌
- Reasoning: Original code had no concurrent operations
- Evidence: No race condition patterns in original code
- Confidence: 10%

=== Expert C - Performance Engineer ===

Hypothesis C1: Optimizing cache miss penalty
- Likelihood: 아마도 🟡
- Reasoning: Fallback reduces repeated failed lookups
- Evidence: Fallback mechanism, async enables batching
- Confidence: 70%

Hypothesis C2: Adding cache preloading capability
- Likelihood: 아마도 🟡
- Reasoning: Async allows background preloading
- Evidence: Async pattern, but no preload logic visible
- Confidence: 50%
```

### Round 2: Cross-Expert Review

```markdown
=== Expert A responds ===

Re: Expert B's "race condition" hypothesis (B2):
- Challenge: I agree this is unlikely - the original sync code had no concurrency
- Confidence: 5% (down from B's 10%)

Re: Expert B's "fallback mechanism" (B1):
- Agreement: Strong agreement - this is clearly visible in the code
- Confidence: 95% (matches B's assessment)

Re: Expert C's "cache miss penalty" (C1):
- Agreement: This makes sense as a side benefit of the fallback
- Additional evidence: Fallback reduces wasted retries
- Confidence: 75%

=== Expert B responds ===

Re: Expert A's "async for concurrency" (A1):
- Agreement: Absolutely - this is the most obvious change
- Confidence: 95%

Re: Expert C's "cache preloading" (C2):
- Challenge: No evidence of preloading in this change
- Concern: Might be future plan, but not in this commit
- Confidence: 30%

=== Expert C responds ===

Re: Expert B's "race condition" (B2):
- Challenge: No evidence of race conditions
- Counter-evidence: Original code was simple synchronous lookup
- Confidence: 0% (recommend LEAVE)
```

### Round 3: Expert Self-Correction

```markdown
=== Expert B Self-Correction ===

Hypothesis B2 (race condition) Review:
- Peer Feedback: Both A and C provided counter-evidence
- Strong Counter-Evidence: Yes - both experts agree no race condition existed
- Updated Confidence: 0%
- Decision: LEAVE ❌
- Reason: Original hypothesis was based on assumption, not evidence. Peers correctly identified this as unfounded.

Hypothesis B1 (fallback mechanism) Review:
- Peer Feedback: Both A and C strongly agree
- Updated Confidence: 95%
- Decision: KEEP ✅
- Reason: Clear evidence in code, multi-expert consensus

=== Expert C Self-Correction ===

Hypothesis C2 (cache preloading) Review:
- Peer Feedback: Expert B challenged lack of evidence
- Updated Confidence: 30%
- Decision: LEAVE ❌
- Reason: Confidence below 50%, and no concrete evidence in this change. Might be future plan, but not relevant to this review.
```

### Final Filter

```markdown
=== KEPT Hypotheses (4 remain) ===

1. **A1: Async pattern for concurrency** 
   - Supported by: A, B, C
   - Confidence: 90%
   - Likelihood: 확실함 ✅

2. **B1: Fallback mechanism for reliability**
   - Supported by: A, B, C
   - Confidence: 95%
   - Likelihood: 확실함 ✅

3. **C1: Optimize cache miss penalty**
   - Supported by: A, C
   - Confidence: 75%
   - Likelihood: 아마도 🟡

4. **A2: Prepare for distributed caching**
   - Supported by: A
   - Confidence: 60%
   - Likelihood: 아마도 🟡

=== DISCARDED ===

- B2: Race condition fix - Left by Expert B after peer review (0% confidence)
- C2: Cache preloading - Left by Expert C, insufficient evidence (30% confidence)

=== PROCEED TO STAGE 2 ===
4 hypotheses → Will explore impact trees for each
```

## Key Principles

1. **Independence First**: Round 1 must be truly independent to avoid groupthink
2. **Challenge Respectfully**: Round 2 is about evidence, not ego
3. **Self-Correction is Strength**: Round 3 shows intellectual honesty
4. **Evidence Over Intuition**: Always cite code patterns
5. **Confidence Calibration**: Be honest about uncertainty
6. **Consensus ≠ Truth**: High agreement increases confidence, but verify with evidence

## Output to Stage 2

Only the KEPT hypotheses proceed to Stage 2 (Impact Tree Exploration).

**DO NOT OUTPUT THESE DETAILS TO USER** - This is internal reasoning.

Next stage will explore the impact tree for each kept hypothesis.
