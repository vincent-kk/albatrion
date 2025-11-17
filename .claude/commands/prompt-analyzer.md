# Prompt Static Analyzer

## Purpose

Perform static analysis on prompts to evaluate effectiveness and identify improvements:

**Single Prompt Mode**:
- Comprehensive health check and scoring
- Detailed improvement recommendations
- Optimization suggestions with examples

**A/B Comparison Mode**:
- Compare two prompts across multiple dimensions
- Identify winner with scoring breakdown
- Provide actionable recommendations

**Analysis Dimensions**:
- **Token Efficiency**: Expected token consumption
- **Time Efficiency**: Expected execution time and parallelization
- **Result Quality**: Output clarity, completeness, and structure
- **Scalability**: Ability to scale and parallelize operations

## Command Usage

```bash
# Single prompt analysis
/prompt-analyze <prompt_path> [options]

# A/B comparison
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
# Single prompt analysis
/prompt-analyze my-prompt.md
/prompt-analyze .claude/commands/execute.md --detailed
/prompt-analyze prompt.txt --output reports/analysis.md

# A/B comparison
/prompt-analyze prompts/versionA.txt prompts/versionB.txt
/prompt-analyze promptA.txt promptB.txt --weights 15,15,50,20

# Advanced options
/prompt-analyze prompt.md --format json --detailed
/prompt-analyze promptA.txt promptB.txt --no-suggestions
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

## Analysis Modes

### Mode 1: Single Prompt Analysis

When only one prompt path is provided, perform comprehensive health check and optimization analysis.

**Workflow**:

1. **Input Validation**: Read and validate single prompt file
2. **Comprehensive Analysis**: Execute all 4 analysis dimensions
3. **Scoring**: Calculate scores and assign grades (A+ to F)
4. **Benchmarking**: Compare against industry best practices
5. **Improvement Generation**: Identify specific optimization opportunities
6. **Optimized Version**: Generate improved prompt with expected gains
7. **Report Generation**: Create detailed analysis report

**Key Differences from A/B Mode**:
- Absolute scoring against benchmarks (not relative comparison)
- More detailed improvement suggestions
- Includes optimized prompt generation
- Focuses on actionable next steps

### Mode 2: A/B Comparison

When two prompt paths are provided, perform comparative analysis.

**Workflow**:

1. **Input Validation**: Read and validate both prompt files
2. **Parallel Analysis**: Execute all 4 dimensions for both prompts
3. **Comparative Scoring**: Calculate relative scores and identify winner
4. **Side-by-Side Comparison**: Generate visual comparison charts
5. **Recommendations**: Suggest which prompt to use and when
6. **Hybrid Suggestions**: Propose combining strengths from both prompts
7. **Report Generation**: Create comparison report

## Analysis Execution

### Phase 1: Input Processing

```bash
# Detect analysis mode
if [ -z "$promptB_path" ]; then
  ANALYSIS_MODE="single"
  READ prompt from file_path

  # Validate single input
  if [ -z "$prompt" ]; then
    echo "❌ Error: Prompt file is empty or invalid"
    exit 1
  fi

  # Extract metadata
  prompt_length = length(prompt)
  prompt_lines = count_lines(prompt)

else
  ANALYSIS_MODE="comparison"

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
fi
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

if (ANALYSIS_MODE === "single") {
  // Single prompt scoring
  const analysis = {
    tokenScore: analyzeTokens(prompt),
    timeScore: analyzeTime(prompt),
    qualityScore: analyzeQuality(prompt),
    scaleScore: analyzeScalability(prompt),
  };

  analysis.totalScore =
    (analysis.tokenScore * tokenWeight +
      analysis.timeScore * timeWeight +
      analysis.qualityScore * qualityWeight +
      analysis.scaleScore * scaleWeight) /
    100;

  // Assign letter grade
  analysis.grade = getLetterGrade(analysis.totalScore);

  // Compare against benchmarks
  analysis.benchmarkComparison = compareToBenchmarks(analysis);

} else {
  // A/B comparison scoring
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
}

// Letter grade assignment
function getLetterGrade(score) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D";
  return "F";
}
```

### Phase 4: Analysis Mode-Specific Processing

#### Single Prompt Mode

```javascript
// Identify improvement opportunities
const improvements = identifyImprovements(analysis);

// Generate optimized version
const optimizedPrompt = generateOptimizedPrompt(prompt, improvements);

// Calculate expected improvements
const expectedGains = calculateExpectedGains(analysis, improvements);

// Benchmark comparison
const benchmarks = {
  excellent: { token: 90, time: 90, quality: 90, scale: 90 },
  good: { token: 75, time: 75, quality: 80, scale: 75 },
  average: { token: 60, time: 60, quality: 65, scale: 60 },
};

analysis.performanceLevel = determinePerfLevel(analysis, benchmarks);
```

#### A/B Comparison Mode

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

**Single Prompt Mode**:
- Health check summary with letter grade
- Detailed metric breakdown with benchmarks
- Improvement opportunities (ranked by impact)
- Optimized prompt version with annotations
- Expected performance gains
- Actionable next steps

**A/B Comparison Mode**:
- Executive summary with winner
- Detailed metric breakdown for both prompts
- Side-by-side comparison
- Improvement suggestions for both
- Hybrid recommendations
- Usage scenarios

## Report Templates

### Single Prompt Analysis Report

```markdown
# 🔍 Prompt Health Check & Optimization Report

**Generated**: {timestamp}
**Analyzer**: Claude Code - SuperClaude Framework
**Analysis Mode**: Single Prompt Static Analysis

---

## 📊 Executive Summary

### 🏆 Overall Grade: {letterGrade}

**Final Score**: **{totalScore}/100** ({performanceLevel})

**Performance Breakdown**:
- 🪙 Token Efficiency: **{tokenScore}/100** ({tokenGrade})
- ⏱️ Time Efficiency: **{timeScore}/100** ({timeGrade})
- ✨ Result Quality: **{qualityScore}/100** ({qualityGrade})
- 📈 Scalability: **{scaleScore}/100** ({scaleGrade})

**Quick Assessment**:
- ✅ Strengths: {top_3_strengths}
- ⚠️ Areas for Improvement: {top_3_weaknesses}
- 🎯 Expected Gain from Optimization: **+{expectedImprovement} points**

---

## 📈 Detailed Analysis

### 1️⃣ Token Efficiency ({tokenWeight}%) - Grade: {tokenGrade}

**Score**: {tokenScore}/100

**Metrics**:
- Estimated Tokens: {estimatedTokens} tokens
- Prompt Length: {promptLength} chars ({promptLines} lines)
- Expected Output: {outputTokens} tokens
- Structural Complexity: {structuralComplexity}/10

**Benchmark Comparison**:
```
Excellent (90+):  ████████████████████░ 90
Your Score:       {tokenBar} {tokenScore}
Good (75+):       ███████████████░░░░░░ 75
Average (60+):    ████████████░░░░░░░░░ 60
```

**Analysis**:
{tokenAnalysisText}

**Improvement Potential**: {tokenImprovementDesc}

---

### 2️⃣ Time Efficiency ({timeWeight}%) - Grade: {timeGrade}

**Score**: {timeScore}/100

**Metrics**:
- Expected Duration: {expectedTime}s
- Processing Steps: {totalSteps}
- Parallel Operations: {parallelOps} ({parallelPercentage}%)
- Sequential Chain Depth: {sequentialDepth}
- Tool Calls: {toolCallCount}

**Execution Pattern**:
```
{executionFlowDiagram}
```

**Benchmark Comparison**:
```
Excellent (90+):  ████████████████████░ 90
Your Score:       {timeBar} {timeScore}
Good (75+):       ███████████████░░░░░░ 75
Average (60+):    ████████████░░░░░░░░░ 60
```

**Analysis**:
{timeAnalysisText}

**Improvement Potential**: {timeImprovementDesc}

---

### 3️⃣ Result Quality ({qualityWeight}%) - Grade: {qualityGrade}

**Score**: {qualityScore}/100

**Sub-Metrics**:
- Clarity: {clarityScore}/100
- Completeness: {completenessScore}/100
- Structure: {structureScore}/100

**Quality Checklist**:
- {checkObjective} Clear objectives defined
- {checkContext} Sufficient context provided
- {checkExamples} Examples included
- {checkStructure} Well-structured instructions
- {checkConstraints} Explicit constraints
- {checkSuccess} Success criteria defined
- {checkEdgeCases} Edge cases addressed
- {checkValidation} Validation steps included

**Benchmark Comparison**:
```
Excellent (90+):  ████████████████████░ 90
Your Score:       {qualityBar} {qualityScore}
Good (75+):       ███████████████░░░░░░ 75
Average (60+):    ████████████░░░░░░░░░ 60
```

**Analysis**:
{qualityAnalysisText}

**Improvement Potential**: {qualityImprovementDesc}

---

### 4️⃣ Scalability ({scaleWeight}%) - Grade: {scaleGrade}

**Score**: {scaleScore}/100

**Sub-Metrics**:
- Parallelization: {parallelizationScore}/100
- Extensibility: {extensibilityScore}/100

**Scalability Checklist**:
- {checkIndependent} Independent subtasks identified
- {checkBatch} Batch operations supported
- {checkModular} Modular structure
- {checkReusable} Reusable components
- {checkPatterns} Pattern-based approach
- {checkExtensible} Easily extensible

**Benchmark Comparison**:
```
Excellent (90+):  ████████████████████░ 90
Your Score:       {scaleBar} {scaleScore}
Good (75+):       ███████████████░░░░░░ 75
Average (60+):    ████████████░░░░░░░░░ 60
```

**Analysis**:
{scaleAnalysisText}

**Improvement Potential**: {scaleImprovementDesc}

---

## 💡 Optimization Recommendations

### Priority 1: Critical Improvements (High Impact)

#### 1. {improvement_1_title}
- **Current Issue**: {issue_description}
- **Impact**: {impact_areas} ({estimatedGain} points)
- **Difficulty**: {difficulty_level}

**Suggested Change**:
```
{before_snippet}
```
↓
```
{after_snippet}
```

**Rationale**: {improvement_rationale}

---

#### 2. {improvement_2_title}
[Same structure]

---

### Priority 2: Important Enhancements (Medium Impact)

[Similar structure for 2-3 medium priority improvements]

---

### Priority 3: Nice-to-Have Optimizations (Low Impact)

[Similar structure for 1-2 low priority improvements]

---

## ✨ Optimized Prompt Version

**Expected Improvements**:
- Token Efficiency: {tokenBefore} → {tokenAfter} (**+{tokenGain} points**)
- Time Efficiency: {timeBefore} → {timeAfter} (**+{timeGain} points**)
- Result Quality: {qualityBefore} → {qualityAfter} (**+{qualityGain} points**)
- Scalability: {scaleBefore} → {scaleAfter} (**+{scaleGain} points**)
- **Overall**: {scoreBefore} → {scoreAfter} (**+{totalGain} points**, {gradeBefore} → {gradeAfter})

### Annotated Optimized Version

```markdown
{optimized_prompt_with_annotations}
```

**Key Changes Applied**:
1. {change_1_summary}
2. {change_2_summary}
3. {change_3_summary}

---

## 🎯 Action Plan

### Immediate Actions (Do Now)
1. ✅ **{action_1}** - {action_1_description}
2. ✅ **{action_2}** - {action_2_description}
3. ✅ **{action_3}** - {action_3_description}

### Short-term Improvements (This Week)
1. 🔄 **{short_1}** - {short_1_description}
2. 🔄 **{short_2}** - {short_2_description}

### Long-term Enhancements (This Month)
1. 📅 **{long_1}** - {long_1_description}
2. 📅 **{long_2}** - {long_2_description}

---

## 📊 Performance Tracking

**Baseline Metrics** (Current):
- Total Score: {currentScore}/100
- Token Usage: ~{currentTokens} tokens
- Expected Time: ~{currentTime}s

**Target Metrics** (After Optimization):
- Total Score: {targetScore}/100 (**+{scoreGain}**)
- Token Usage: ~{targetTokens} tokens (**-{tokenSavings}%**)
- Expected Time: ~{targetTime}s (**-{timeSavings}%**)

**Next Review**: {suggestedReviewDate}

---

## 📝 Analysis Metadata

**Input File**: {prompt_path} ({prompt_size} chars, {prompt_lines} lines)
**Weights**: Token={tokenWeight}%, Time={timeWeight}%, Quality={qualityWeight}%, Scale={scaleWeight}%
**Analysis Mode**: Single Prompt Health Check
**Generated**: {timestamp}
**Analyzer Version**: SuperClaude Framework v2.0

---

> **Note**: This is a **static analysis** based on prompt structure and patterns.
> For runtime validation, test the optimized prompt with representative inputs.

---

**Copyright © 2025 Vincent K. Kelvin. All rights reserved.**
```

---

### A/B Comparison Report

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

### Improvement Identification Algorithm (Single Prompt Mode)

```javascript
function identifyImprovements(analysis) {
  const improvements = [];

  // Token Efficiency Improvements
  if (analysis.tokenScore < 75) {
    if (analysis.verbosityIndicators > 0.3) {
      improvements.push({
        category: "token",
        priority: "high",
        title: "Reduce Verbosity",
        issue: "Prompt contains excessive explanatory text",
        suggestion: "Use concise instructions and remove redundant phrases",
        estimatedGain: 5-10,
        difficulty: "easy",
      });
    }

    if (analysis.hasLongExamples) {
      improvements.push({
        category: "token",
        priority: "medium",
        title: "Optimize Examples",
        issue: "Examples are too detailed or numerous",
        suggestion: "Provide shorter, focused examples or reference external docs",
        estimatedGain: 3-7,
        difficulty: "easy",
      });
    }

    if (analysis.structuralComplexity > 7) {
      improvements.push({
        category: "token",
        priority: "medium",
        title: "Simplify Structure",
        issue: "Overly complex nested instructions",
        suggestion: "Flatten hierarchy and use clear sequential steps",
        estimatedGain: 4-8,
        difficulty: "medium",
      });
    }
  }

  // Time Efficiency Improvements
  if (analysis.timeScore < 75) {
    if (analysis.parallelOps / analysis.totalOps < 0.3) {
      improvements.push({
        category: "time",
        priority: "high",
        title: "Increase Parallelization",
        issue: `Only ${Math.round(analysis.parallelOps / analysis.totalOps * 100)}% operations are parallel`,
        suggestion: "Identify independent tasks and explicitly request parallel execution",
        estimatedGain: 8-15,
        difficulty: "medium",
      });
    }

    if (analysis.sequentialChainLength > 5) {
      improvements.push({
        category: "time",
        priority: "high",
        title: "Reduce Sequential Dependencies",
        issue: "Long sequential dependency chain",
        suggestion: "Break down into independent subtasks that can run concurrently",
        estimatedGain: 6-12,
        difficulty: "medium",
      });
    }

    if (analysis.toolCalls.heavy > 3) {
      improvements.push({
        category: "time",
        priority: "medium",
        title: "Optimize Tool Usage",
        issue: "Multiple expensive tool calls (search, web, browser)",
        suggestion: "Batch operations or use lighter-weight alternatives where possible",
        estimatedGain: 5-10,
        difficulty: "hard",
      });
    }
  }

  // Quality Improvements
  if (analysis.qualityScore < 80) {
    // Clarity improvements
    if (!analysis.hasObjective) {
      improvements.push({
        category: "quality",
        priority: "high",
        title: "Add Clear Objective",
        issue: "No explicit goal or objective stated",
        suggestion: "Start with clear statement of what should be accomplished",
        estimatedGain: 5-8,
        difficulty: "easy",
      });
    }

    if (!analysis.hasSuccessCriteria) {
      improvements.push({
        category: "quality",
        priority: "high",
        title: "Define Success Criteria",
        issue: "No clear completion or success criteria",
        suggestion: "Specify how to determine when task is successfully completed",
        estimatedGain: 4-7,
        difficulty: "easy",
      });
    }

    if (analysis.ambiguityScore > 0.2) {
      improvements.push({
        category: "quality",
        priority: "high",
        title: "Reduce Ambiguity",
        issue: "Contains ambiguous language (maybe, perhaps, possibly)",
        suggestion: "Use definitive instructions and specific requirements",
        estimatedGain: 6-10,
        difficulty: "medium",
      });
    }

    // Completeness improvements
    if (!analysis.hasContext) {
      improvements.push({
        category: "quality",
        priority: "medium",
        title: "Provide Context",
        issue: "Lacks background or context information",
        suggestion: "Add relevant context to guide execution",
        estimatedGain: 3-6,
        difficulty: "easy",
      });
    }

    if (!analysis.hasExamples) {
      improvements.push({
        category: "quality",
        priority: "medium",
        title: "Include Examples",
        issue: "No examples provided",
        suggestion: "Add concrete examples to clarify expectations",
        estimatedGain: 4-7,
        difficulty: "easy",
      });
    }

    if (!analysis.addressesEdgeCases) {
      improvements.push({
        category: "quality",
        priority: "low",
        title: "Address Edge Cases",
        issue: "Edge cases and exceptions not considered",
        suggestion: "Specify how to handle errors and unusual scenarios",
        estimatedGain: 2-5,
        difficulty: "medium",
      });
    }

    // Structure improvements
    if (!analysis.hasNumberedSteps) {
      improvements.push({
        category: "quality",
        priority: "medium",
        title: "Add Step-by-Step Structure",
        issue: "Instructions lack clear sequential structure",
        suggestion: "Break down into numbered steps for clarity",
        estimatedGain: 5-8,
        difficulty: "easy",
      });
    }

    if (!analysis.specifiesOutput) {
      improvements.push({
        category: "quality",
        priority: "medium",
        title: "Specify Output Format",
        issue: "Expected output format not defined",
        suggestion: "Clearly describe desired output structure and format",
        estimatedGain: 4-7,
        difficulty: "easy",
      });
    }
  }

  // Scalability Improvements
  if (analysis.scaleScore < 75) {
    if (analysis.parallelizationScore < 50) {
      improvements.push({
        category: "scale",
        priority: "high",
        title: "Enable Batch Operations",
        issue: "No support for batch or parallel processing",
        suggestion: "Design prompt to handle multiple inputs efficiently",
        estimatedGain: 8-15,
        difficulty: "hard",
      });
    }

    if (!analysis.isModular) {
      improvements.push({
        category: "scale",
        priority: "medium",
        title: "Modularize Structure",
        issue: "Monolithic structure not easily reusable",
        suggestion: "Break into reusable components or sub-prompts",
        estimatedGain: 5-10,
        difficulty: "medium",
      });
    }

    if (!analysis.hasPatterns) {
      improvements.push({
        category: "scale",
        priority: "medium",
        title: "Use Pattern-Based Approach",
        issue: "Lacks pattern-based or template-driven design",
        suggestion: "Define patterns that can scale to larger inputs",
        estimatedGain: 4-8,
        difficulty: "hard",
      });
    }
  }

  // Sort by priority and estimated gain
  improvements.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, sort by estimated gain (use average)
    const aGain = typeof a.estimatedGain === 'string'
      ? parseInt(a.estimatedGain.split('-')[1])
      : a.estimatedGain;
    const bGain = typeof b.estimatedGain === 'string'
      ? parseInt(b.estimatedGain.split('-')[1])
      : b.estimatedGain;
    return bGain - aGain;
  });

  return improvements;
}
```

### Optimized Prompt Generation Algorithm

```javascript
function generateOptimizedPrompt(originalPrompt, improvements) {
  let optimized = originalPrompt;
  const appliedChanges = [];

  for (const improvement of improvements) {
    switch (improvement.title) {
      case "Add Clear Objective":
        optimized = addObjective(optimized, improvement);
        appliedChanges.push(improvement.title);
        break;

      case "Define Success Criteria":
        optimized = addSuccessCriteria(optimized, improvement);
        appliedChanges.push(improvement.title);
        break;

      case "Reduce Verbosity":
        optimized = reduceVerbosity(optimized, improvement);
        appliedChanges.push(improvement.title);
        break;

      case "Increase Parallelization":
        optimized = addParallelization(optimized, improvement);
        appliedChanges.push(improvement.title);
        break;

      case "Add Step-by-Step Structure":
        optimized = addStructure(optimized, improvement);
        appliedChanges.push(improvement.title);
        break;

      // ... implement other improvement types
    }
  }

  return {
    optimizedText: optimized,
    appliedChanges,
    annotations: generateAnnotations(appliedChanges),
  };
}

// Helper functions for specific improvements
function addObjective(prompt, improvement) {
  const objective = "## Objective\n\n[Clear statement of what this prompt accomplishes]\n\n";
  return objective + prompt;
}

function addSuccessCriteria(prompt, improvement) {
  const criteria = "\n\n## Success Criteria\n\n- [ ] [Criterion 1]\n- [ ] [Criterion 2]\n- [ ] [Criterion 3]\n";
  return prompt + criteria;
}

function reduceVerbosity(prompt, improvement) {
  // Remove redundant phrases and simplify language
  let optimized = prompt
    .replace(/please note that/gi, '')
    .replace(/it is important to mention that/gi, '')
    .replace(/as you can see,/gi, '')
    .replace(/basically,/gi, '')
    .replace(/in order to/gi, 'to');

  return optimized;
}

function addParallelization(prompt, improvement) {
  // Add explicit parallelization directives
  const parallelDirective = "\n\n**Execution Strategy**: Execute independent tasks in parallel for optimal performance.\n";
  return prompt + parallelDirective;
}

function addStructure(prompt, improvement) {
  // Convert unstructured text to numbered steps
  const lines = prompt.split('\n');
  let stepNumber = 1;

  const structured = lines.map(line => {
    if (line.match(/^[A-Z].*[.:]$/)) {
      return `${stepNumber++}. ${line}`;
    }
    return line;
  });

  return structured.join('\n');
}
```

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

## Quick Start Guide

### Single Prompt Analysis
```bash
# Analyze your prompt
/prompt-analyze my-prompt.md

# With detailed breakdown
/prompt-analyze my-prompt.md --detailed

# Custom output location
/prompt-analyze my-prompt.md --output reports/health-check.md
```

**What you get**:
- Letter grade (A+ to F) with detailed scoring
- Specific improvement recommendations ranked by impact
- Optimized prompt version with expected gains
- Actionable next steps

### A/B Comparison
```bash
# Compare two versions
/prompt-analyze version1.md version2.md

# Prioritize quality
/prompt-analyze v1.md v2.md --weights 15,15,50,20

# Get recommendations without suggestions
/prompt-analyze v1.md v2.md --no-suggestions
```

**What you get**:
- Winner identification with score breakdown
- Side-by-side metric comparison
- Hybrid recommendations
- Usage scenarios for each version

---

> **Last Updated**: 2025-01-18
> **Purpose**: Single prompt health check and A/B comparison analysis
> **Framework**: SuperClaude v2.0
> **New Feature**: Single prompt analysis mode with optimization recommendations
