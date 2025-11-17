# Prompt A/B Static Analyzer

## Purpose

Perform static analysis on two prompts (A vs B) to compare their effectiveness across multiple dimensions:

- **Token Efficiency**: Expected token consumption
- **Time Efficiency**: Expected execution time and parallelization
- **Result Quality**: Output clarity, completeness, and structure
- **Scalability**: Ability to scale and parallelize operations

Generate comprehensive comparison report with scoring, recommendations, and improvement suggestions.

## Command Usage

```bash
/prompt-analyze <promptA_path> <promptB_path> [options]
```

### Options

- `--output <path>`: Report output path (default: `claudedocs/prompt-analysis-{timestamp}.md`)
- `--weights <token,time,quality,scale>`: Custom weights (default: `25,25,30,20`)
- `--format <md|json|table>`: Output format (default: `md`)
- `--detailed`: Include detailed analysis breakdown
- `--no-suggestions`: Skip improvement suggestions

### Examples

```bash
# Basic comparison
/prompt-analyze prompts/versionA.txt prompts/versionB.txt

# Custom weights (prioritize quality)
/prompt-analyze promptA.txt promptB.txt --weights 15,15,50,20

# JSON output with detailed analysis
/prompt-analyze promptA.txt promptB.txt --format json --detailed

# Save to specific location
/prompt-analyze promptA.txt promptB.txt --output analysis/comparison.md
```

## Analysis Methodology

### 1. Token Efficiency Analysis (Default: 25%)

**Metrics**:

- Prompt character count and token estimation
- Expected output token count (based on instructions)
- Structural complexity (nesting, conditionals, loops)
- Verbosity indicators

**Calculation**:

```javascript
tokenScore = 100 - (estimatedTokens / baselineTokens) * 100;
// Lower token usage = higher score
// Baseline: 5000 tokens for typical prompt

estimatedTokens =
  promptLength / 4 + // Rough token estimate
  outputComplexity * 500 + // Expected output
  structuralComplexity * 200; // Nested instructions
```

**Scoring Bands**:

- 90-100: Excellent (< 2000 tokens)
- 75-89: Good (2000-4000 tokens)
- 60-74: Average (4000-6000 tokens)
- 40-59: Below Average (6000-8000 tokens)
- 0-39: Poor (> 8000 tokens)

### 2. Time Efficiency Analysis (Default: 25%)

**Metrics**:

- Sequential processing steps
- Parallelizable operations
- Tool call complexity
- Dependency chain length

**Calculation**:

```javascript
timeScore = parallelizationBonus - sequentialPenalty;

parallelizationBonus = (parallelOps / totalOps) * 40; // Max 40 points

sequentialPenalty = sequentialChainLength * 5; // Each sequential step costs 5 points

toolCallPenalty = complexToolCalls * 10; // Heavy operations (e.g., web search, browser)
```

**Indicators**:

- ✅ Parallel operations: "run concurrently", "in parallel", "batch process"
- ⚠️ Sequential dependencies: "then", "after", "once completed"
- 🔧 Tool calls: "search", "fetch", "navigate", "analyze with"

**Scoring Bands**:

- 90-100: Excellent (High parallelization, < 30s expected)
- 75-89: Good (Some parallelization, 30-60s)
- 60-74: Average (Mostly sequential, 60-120s)
- 40-59: Below Average (Sequential, 120-180s)
- 0-39: Poor (Fully sequential, > 180s)

### 3. Result Quality Analysis (Default: 30%)

**Sub-Metrics**:

#### Clarity (33.3%)

- Clear instructions and objectives
- Unambiguous language
- Well-defined success criteria
- Explicit constraints

```javascript
clarityScore =
  hasObjective * 25 +
  isUnambiguous * 25 +
  hasSuccessCriteria * 25 +
  hasConstraints * 25;
```

#### Completeness (33.3%)

- All required information present
- Context provided
- Examples included
- Edge cases addressed

```javascript
completenessScore =
  hasContext * 25 +
  hasExamples * 25 +
  addressesEdgeCases * 25 +
  includesValidation * 25;
```

#### Structure (33.3%)

- Logical organization
- Step-by-step breakdown
- Hierarchical decomposition
- Output format specification

```javascript
structureScore =
  isWellOrganized * 25 +
  hasStepBreakdown * 25 +
  hasHierarchy * 25 +
  specifiesOutputFormat * 25;
```

**Final Quality Score**:

```javascript
qualityScore = (clarityScore + completenessScore + structureScore) / 3;
```

**Scoring Bands**:

- 90-100: Excellent (Clear, complete, well-structured)
- 75-89: Good (Minor gaps or ambiguity)
- 60-74: Average (Some clarity issues)
- 40-59: Below Average (Significant ambiguity)
- 0-39: Poor (Unclear or incomplete)

### 4. Scalability Analysis (Default: 20%)

**Sub-Metrics**:

#### Parallelization (50%)

- Independent subtask identification
- Batch operation support
- Concurrent execution potential

```javascript
parallelizationScore =
  (independentSubtasks / totalSubtasks) * 50 +
  hasBatchOperations * 25 +
  explicitParallelDirectives * 25;
```

#### Extensibility (50%)

- Modular structure
- Reusable components
- Scalable to larger inputs
- Pattern-based approach

```javascript
extensibilityScore =
  isModular * 25 +
  hasReusableComponents * 25 +
  canHandleLargeInputs * 25 +
  usesPatterns * 25;
```

**Final Scalability Score**:

```javascript
scalabilityScore = (parallelizationScore + extensibilityScore) / 2;
```

**Scoring Bands**:

- 90-100: Excellent (Highly parallelizable, modular)
- 75-89: Good (Some parallelization possible)
- 60-74: Average (Limited scalability)
- 40-59: Below Average (Mostly sequential)
- 0-39: Poor (Non-scalable design)

## Analysis Execution

### Phase 1: Input Processing

```bash
# Read both prompts
READ promptA from file_path_A
READ promptB from file_path_B

# Validate inputs
if [ -z "$promptA" ] || [ -z "$promptB" ]; then
  echo "❌ Error: Both prompts must be provided"
  exit 1
fi

# Extract metadata
promptA_length = length(promptA)
promptB_length = length(promptB)
```

### Phase 2: Static Analysis

**For each prompt, analyze**:

1. **Token Analysis**:
   - Character count
   - Estimated token count
   - Complexity indicators
   - Expected output length

2. **Time Analysis**:
   - Count sequential steps
   - Identify parallel operations
   - Detect tool calls
   - Calculate dependency chains

3. **Quality Analysis**:
   - Parse structure
   - Check clarity indicators
   - Verify completeness
   - Assess organization

4. **Scalability Analysis**:
   - Identify independent tasks
   - Check for batch operations
   - Assess modularity
   - Evaluate extensibility

### Phase 3: Scoring

```javascript
// Parse options
const weights = parseWeights(options.weights || "25,25,30,20");
const [tokenWeight, timeWeight, qualityWeight, scaleWeight] = weights;

// Calculate weighted scores
for (const prompt of [promptA, promptB]) {
  prompt.tokenScore = analyzeTokens(prompt);
  prompt.timeScore = analyzeTime(prompt);
  prompt.qualityScore = analyzeQuality(prompt);
  prompt.scaleScore = analyzeScalability(prompt);

  prompt.totalScore =
    (prompt.tokenScore * tokenWeight +
      prompt.timeScore * timeWeight +
      prompt.qualityScore * qualityWeight +
      prompt.scaleScore * scaleWeight) /
    100;
}
```

### Phase 4: Comparison

```javascript
const winner = promptA.totalScore > promptB.totalScore ? "A" : "B";
const scoreDiff = Math.abs(promptA.totalScore - promptB.totalScore);

const recommendation =
  scoreDiff > 20
    ? `Strong preference for Prompt ${winner}`
    : scoreDiff > 10
      ? `Moderate preference for Prompt ${winner}`
      : scoreDiff > 5
        ? `Slight preference for Prompt ${winner}`
        : "Both prompts are comparable";
```

### Phase 5: Report Generation

Generate comprehensive markdown report with:

- Executive summary
- Detailed metric breakdown
- Comparative analysis
- Improvement suggestions
- Visual score comparison

## Report Template

```markdown
# 🔍 Prompt A/B Static Analysis Report

**Generated**: {timestamp}
**Analyzer**: Claude Code - SuperClaude Framework
**Analysis Mode**: Static (no execution)

---

## 📊 Executive Summary

### 🏆 Winner: Prompt {winner}

**Final Scores**:

- 🅰️ Prompt A: **{scoreA}/100**
- 🅱️ Prompt B: **{scoreB}/100**
- 📈 Difference: **{diff} points**

**Recommendation**: {recommendation}

**Key Findings**:

- {key_finding_1}
- {key_finding_2}
- {key_finding_3}

---

## 📈 Detailed Comparison

### 🅰️ Prompt A Analysis

#### 1️⃣ Token Efficiency ({tokenWeight}%)

- **Estimated Tokens**: {estimatedTokens}
- **Complexity**: {complexity}
- **Score**: {tokenScore}/100
- **Grade**: {tokenGrade}

**Breakdown**:

- Prompt length: {promptLength} chars
- Expected output: {outputTokens} tokens
- Structural complexity: {structuralComplexity}/10

#### 2️⃣ Time Efficiency ({timeWeight}%)

- **Expected Duration**: {expectedTime}s
- **Parallel Operations**: {parallelOps}
- **Sequential Chain**: {sequentialSteps} steps
- **Score**: {timeScore}/100
- **Grade**: {timeGrade}

**Breakdown**:

- Parallelizable tasks: {parallelTasks}
- Tool calls: {toolCalls}
- Dependency depth: {depthLevel}

#### 3️⃣ Result Quality ({qualityWeight}%)

- **Clarity**: {clarityScore}/100
- **Completeness**: {completenessScore}/100
- **Structure**: {structureScore}/100
- **Score**: {qualityScore}/100
- **Grade**: {qualityGrade}

**Breakdown**:

- ✅ Clear objectives: {hasObjective}
- ✅ Context provided: {hasContext}
- ✅ Well-structured: {isStructured}
- ✅ Examples included: {hasExamples}

#### 4️⃣ Scalability ({scaleWeight}%)

- **Parallelization**: {parallelScore}/100
- **Extensibility**: {extensibilityScore}/100
- **Score**: {scaleScore}/100
- **Grade**: {scaleGrade}

**Breakdown**:

- Independent tasks: {independentTasks}/{totalTasks}
- Batch operations: {batchOps}
- Modular design: {isModular}

**Total Score**: **{totalScoreA}/100**

---

### 🅱️ Prompt B Analysis

[Same structure as Prompt A]

**Total Score**: **{totalScoreB}/100**

---

## 📊 Side-by-Side Comparison

| Metric           | Prompt A          | Prompt B          | Winner              |
| ---------------- | ----------------- | ----------------- | ------------------- |
| Token Efficiency | {tokenScoreA}     | {tokenScoreB}     | {tokenWinner}       |
| Time Efficiency  | {timeScoreA}      | {timeScoreB}      | {timeWinner}        |
| Result Quality   | {qualityScoreA}   | {qualityScoreB}   | {qualityWinner}     |
| Scalability      | {scaleScoreA}     | {scaleScoreB}     | {scaleWinner}       |
| **TOTAL**        | **{totalScoreA}** | **{totalScoreB}** | **{overallWinner}** |

### 📉 Visual Comparison
```

Token Efficiency
A: ████████████████░░░░ {tokenScoreA}
B: ██████████████░░░░░░ {tokenScoreB}

Time Efficiency
A: ██████████████████░░ {timeScoreA}
B: ████████████░░░░░░░░ {timeScoreB}

Result Quality
A: ███████████████████░ {qualityScoreA}
B: █████████████████░░░ {qualityScoreB}

Scalability
A: ████████████████░░░░ {scaleScoreA}
B: ██████████████████░░ {scaleScoreB}

```

---

## 💡 Improvement Suggestions

### For Prompt A

**Strengths**:
- {strength_1}
- {strength_2}

**Areas for Improvement**:
1. **{improvement_area_1}**
   - Issue: {issue_description}
   - Suggestion: {specific_suggestion}
   - Expected impact: {impact_description}

2. **{improvement_area_2}**
   - Issue: {issue_description}
   - Suggestion: {specific_suggestion}
   - Expected impact: {impact_description}

**Optimized Version** (estimated +{improvement_points} points):
```

{optimized_prompt_A_snippet}

```

### For Prompt B

[Same structure as Prompt A]

---

## 🎯 Recommended Actions

### Immediate Actions
1. **Use Prompt {winner}** for production
2. {action_2}
3. {action_3}

### Future Improvements
1. {future_improvement_1}
2. {future_improvement_2}
3. {future_improvement_3}

### A/B Testing Considerations
- **When to use Prompt A**: {scenario_A}
- **When to use Prompt B**: {scenario_B}
- **Hybrid approach**: {hybrid_suggestion}

---

## 📝 Analysis Metadata

**Configuration**:
- Weights: Token={tokenWeight}%, Time={timeWeight}%, Quality={qualityWeight}%, Scale={scaleWeight}%
- Analysis Mode: Static
- Format: {outputFormat}
- Detailed: {isDetailed}

**Input Files**:
- Prompt A: {promptA_path} ({promptA_size} chars)
- Prompt B: {promptB_path} ({promptB_size} chars)

**Generated**: {timestamp}
**Analyzer Version**: SuperClaude Framework v2.0

---

> **Note**: This is a **static analysis** based on prompt structure and patterns.
> For runtime performance validation, consider running both prompts with identical inputs and comparing actual results.

---

**Copyright © 2025 Vincent K. Kelvin. All rights reserved.**
```

## Implementation Logic

### Token Estimation Algorithm

```javascript
function estimateTokens(prompt) {
  const chars = prompt.length;
  const baseTokens = Math.ceil(chars / 4); // Rough estimate: 4 chars ≈ 1 token

  // Adjust for Korean (more tokens per char)
  const koreanChars = (prompt.match(/[가-힣]/g) || []).length;
  const koreanAdjustment = Math.ceil(koreanChars / 2);

  // Analyze output expectations
  const outputIndicators = {
    generate: 500,
    create: 500,
    write: 700,
    analyze: 800,
    comprehensive: 1000,
    detailed: 800,
    "step-by-step": 600,
    explain: 500,
  };

  let expectedOutput = 300; // default
  for (const [keyword, tokens] of Object.entries(outputIndicators)) {
    if (prompt.toLowerCase().includes(keyword)) {
      expectedOutput = Math.max(expectedOutput, tokens);
    }
  }

  // Count structural complexity
  const hasNestedInstructions = (prompt.match(/\d+\./g) || []).length > 3;
  const hasConditionals = /if|when|unless|depending/.test(prompt);
  const hasLoops = /for each|all|every|iterate/.test(prompt);

  const complexityBonus =
    (hasNestedInstructions ? 200 : 0) +
    (hasConditionals ? 150 : 0) +
    (hasLoops ? 200 : 0);

  return baseTokens + koreanAdjustment + expectedOutput + complexityBonus;
}
```

### Time Estimation Algorithm

```javascript
function estimateTime(prompt) {
  let baseTime = 10; // seconds

  // Count processing steps
  const steps = (prompt.match(/\d+\.|step|phase|then|next|after/gi) || [])
    .length;
  baseTime += steps * 5;

  // Identify parallel operations
  const parallelIndicators =
    /parallel|concurrent|simultaneously|batch|at once/gi;
  const hasParallel = parallelIndicators.test(prompt);

  if (hasParallel) {
    const parallelOps = (prompt.match(parallelIndicators) || []).length;
    baseTime *= 1 - parallelOps * 0.1; // 10% reduction per parallel hint
  }

  // Count tool calls (expensive operations)
  const toolCalls = {
    search: 15,
    web: 15,
    fetch: 10,
    browse: 20,
    navigate: 20,
    screenshot: 10,
    analyze: 8,
    read: 2,
    write: 3,
  };

  for (const [tool, time] of Object.entries(toolCalls)) {
    if (prompt.toLowerCase().includes(tool)) {
      baseTime += time;
    }
  }

  // Sequential dependency chains increase time
  const sequentialChain = (
    prompt.match(/then|after that|once|following|subsequently/gi) || []
  ).length;
  baseTime += sequentialChain * 8;

  return Math.max(baseTime, 5); // minimum 5 seconds
}
```

### Quality Scoring Algorithm

```javascript
function analyzeQuality(prompt) {
  // Clarity Analysis
  const hasObjective = /goal|objective|purpose|aim|target/.test(prompt);
  const hasConstraints = /constraint|limit|requirement|must|should/.test(
    prompt,
  );
  const hasSuccessCriteria = /success|complete when|done if|criteria/.test(
    prompt,
  );
  const isUnambiguous = !/maybe|perhaps|possibly|might/.test(prompt);

  const clarityScore =
    (hasObjective ? 25 : 0) +
    (isUnambiguous ? 25 : 0) +
    (hasSuccessCriteria ? 25 : 0) +
    (hasConstraints ? 25 : 0);

  // Completeness Analysis
  const hasContext = /context|background|scenario|situation/.test(prompt);
  const hasExamples = /example|for instance|such as|e\.g\./.test(prompt);
  const addressesEdgeCases = /edge case|exception|error|if.*fail/.test(prompt);
  const includesValidation = /verify|validate|check|ensure|confirm/.test(
    prompt,
  );

  const completenessScore =
    (hasContext ? 25 : 0) +
    (hasExamples ? 25 : 0) +
    (addressesEdgeCases ? 25 : 0) +
    (includesValidation ? 25 : 0);

  // Structure Analysis
  const hasNumberedSteps = (prompt.match(/\d+\./g) || []).length > 2;
  const hasSections = (prompt.match(/##|###|section|phase/gi) || []).length > 1;
  const specifiesOutput = /output|format|result should|generate.*format/.test(
    prompt,
  );
  const isHierarchical = hasNumberedSteps && hasSections;

  const structureScore =
    (hasNumberedSteps ? 25 : 0) +
    (isHierarchical ? 25 : 0) +
    (hasSections ? 25 : 0) +
    (specifiesOutput ? 25 : 0);

  return {
    clarityScore,
    completenessScore,
    structureScore,
    totalScore: (clarityScore + completenessScore + structureScore) / 3,
  };
}
```

### Scalability Scoring Algorithm

```javascript
function analyzeScalability(prompt) {
  // Parallelization Analysis
  const totalTasks =
    (prompt.match(/task|step|operation|action/gi) || []).length || 1;
  const parallelKeywords =
    prompt.match(/parallel|concurrent|batch|simultaneously/gi) || [];
  const independentTasks = (
    prompt.match(/independent|separate|isolated/gi) || []
  ).length;

  const parallelizationScore = Math.min(
    (independentTasks / totalTasks) * 50 +
      (parallelKeywords.length > 0 ? 25 : 0) +
      (prompt.includes("batch") ? 25 : 0),
    100,
  );

  // Extensibility Analysis
  const isModular = /module|component|reusable|function/.test(prompt);
  const hasPatterns = /pattern|template|framework/.test(prompt);
  const canScale = /scale|extend|grow|expand|adapt/.test(prompt);
  const hasAbstraction = /abstract|generic|general|flexible/.test(prompt);

  const extensibilityScore =
    (isModular ? 25 : 0) +
    (hasPatterns ? 25 : 0) +
    (canScale ? 25 : 0) +
    (hasAbstraction ? 25 : 0);

  return {
    parallelizationScore,
    extensibilityScore,
    totalScore: (parallelizationScore + extensibilityScore) / 2,
  };
}
```

## Error Handling

### Invalid Input

```bash
if [ ! -f "$promptA_path" ]; then
  echo "❌ Error: Prompt A file not found: $promptA_path"
  exit 1
fi

if [ ! -f "$promptB_path" ]; then
  echo "❌ Error: Prompt B file not found: $promptB_path"
  exit 1
fi
```

### Invalid Weights

```javascript
function parseWeights(weightsString) {
  const weights = weightsString.split(",").map(Number);

  if (weights.length !== 4) {
    console.warn("⚠️  Invalid weights format. Using defaults: 25,25,30,20");
    return [25, 25, 30, 20];
  }

  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    console.warn(`⚠️  Weights sum to ${sum}, not 100. Normalizing...`);
    return weights.map((w) => (w / sum) * 100);
  }

  return weights;
}
```

### Missing Output Directory

```bash
# Ensure output directory exists
output_dir=$(dirname "$output_path")
if [ ! -d "$output_dir" ]; then
  mkdir -p "$output_dir"
  echo "📁 Created output directory: $output_dir"
fi
```

## Integration with SuperClaude

This analyzer integrates with:

- **Sequential Thinking MCP**: For complex structural analysis
- **Token Efficiency Mode**: Uses symbol system for reporting
- **Task Management**: Can create improvement tasks from suggestions

---

> **Last Updated**: 2025-01-17
> **Purpose**: Static analysis and comparison of prompt effectiveness
> **Framework**: SuperClaude v2.0
