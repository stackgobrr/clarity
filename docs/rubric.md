# Critical Thinking Evaluation Rubric

## Overview

This rubric evaluates critical thinking across 8 dimensions. Each dimension is scored 0-4, and the overall score is calculated as a weighted average scaled to 0-100.

## Dimensions

### 1. Clarity

**Definition**: Clear claims, well-defined terms, precise language

| Score | Description                            | Example Indicators                                           |
| ----- | -------------------------------------- | ------------------------------------------------------------ |
| 0     | Vague, ambiguous, or incomprehensible  | No clear thesis; undefined terms; contradictory statements   |
| 1     | Some clarity but major ambiguities     | Main point unclear; key terms undefined; frequent ambiguity  |
| 2     | Moderately clear with some imprecision | Main point evident but lacks precision; some terms undefined |
| 3     | Clear with minor imprecision           | Clear thesis; most terms defined; occasional ambiguity       |
| 4     | Exceptionally clear and precise        | Crystal-clear thesis; all key terms defined; no ambiguity    |

### 2. Relevance

**Definition**: Directly addresses the question asked; stays on topic

| Score | Description                             | Example Indicators                                             |
| ----- | --------------------------------------- | -------------------------------------------------------------- |
| 0     | Does not address the question           | Answer is about a different topic entirely                     |
| 1     | Marginally relevant with major tangents | Touches on topic but mostly off-track; misunderstands question |
| 2     | Relevant but includes tangents          | Addresses question but with digressions; partial understanding |
| 3     | Mostly relevant with minor tangents     | Directly addresses question with brief digressions             |
| 4     | Completely relevant throughout          | Every point directly supports answering the question           |

### 3. Logic

**Definition**: Valid reasoning, no contradictions, sound inference

| Score | Description                      | Example Indicators                                                  |
| ----- | -------------------------------- | ------------------------------------------------------------------- |
| 0     | Illogical or contradictory       | Internal contradictions; non-sequiturs; circular reasoning          |
| 1     | Major logical flaws              | Significant gaps in reasoning; unwarranted conclusions              |
| 2     | Some logical reasoning with gaps | Generally logical but with weak inferences or minor contradictions  |
| 3     | Logical with minor gaps          | Sound reasoning with occasional weak links                          |
| 4     | Rigorous logical structure       | Valid inferences throughout; no contradictions; clear causal chains |

### 4. Evidence

**Definition**: Uses facts, cites sources, avoids unsupported claims

| Score | Description                   | Example Indicators                                          |
| ----- | ----------------------------- | ----------------------------------------------------------- |
| 0     | No evidence provided          | Pure assertion; no facts or examples                        |
| 1     | Minimal or anecdotal evidence | Relies on personal opinion or single anecdote               |
| 2     | Some evidence but incomplete  | Provides examples but lacks depth or verification           |
| 3     | Good evidence with minor gaps | Multiple sources/examples; mostly verifiable                |
| 4     | Strong, diverse evidence      | Multiple credible sources; specific data; verifiable claims |

### 5. Assumptions

**Definition**: Identifies, tests, and bounds key assumptions

| Score | Description                      | Example Indicators                                       |
| ----- | -------------------------------- | -------------------------------------------------------- |
| 0     | Ignores assumptions entirely     | Makes hidden assumptions without acknowledgment          |
| 1     | Acknowledges assumptions exist   | Mentions assumptions but doesn't identify them           |
| 2     | Identifies some assumptions      | Names key assumptions but doesn't test them              |
| 3     | Identifies and tests assumptions | States assumptions and considers their validity          |
| 4     | Rigorously examines assumptions  | Explicitly states, tests, and bounds all key assumptions |

### 6. Alternatives

**Definition**: Considers other explanations, counterarguments, perspectives

| Score | Description                        | Example Indicators                                                           |
| ----- | ---------------------------------- | ---------------------------------------------------------------------------- |
| 0     | Ignores alternatives               | Single-perspective answer; no consideration of other views                   |
| 1     | Acknowledges alternatives exist    | Mentions other views but doesn't explore them                                |
| 2     | Considers some alternatives        | Presents 1-2 alternatives but weakly analyzed                                |
| 3     | Analyzes multiple alternatives     | Seriously considers 2-3 alternatives with reasoning                          |
| 4     | Comprehensive alternative analysis | Explores multiple alternatives; weighs tradeoffs; addresses counterarguments |

### 7. Quantitative Reasoning

**Definition**: Uses numbers, thresholds, base rates, distributions appropriately

| Score | Description                          | Example Indicators                                                         |
| ----- | ------------------------------------ | -------------------------------------------------------------------------- |
| 0     | No quantitative reasoning            | Purely qualitative; ignores numerical aspects                              |
| 1     | Mentions numbers without context     | Uses numbers but lacks interpretation or comparison                        |
| 2     | Basic quantitative reasoning         | Provides some numerical context but incomplete                             |
| 3     | Good quantitative analysis           | Uses numbers, thresholds, or probabilities appropriately                   |
| 4     | Sophisticated quantitative reasoning | Uses base rates, distributions, confidence intervals; correct calculations |

**Note**: If question doesn't require quantitative reasoning, score based on appropriate judgment to avoid it (score 3-4 if correctly recognizes it's not needed).

### 8. Humility/Uncertainty

**Definition**: Appropriate confidence calibration; acknowledges limits of knowledge

| Score | Description                              | Example Indicators                                                         |
| ----- | ---------------------------------------- | -------------------------------------------------------------------------- |
| 0     | Absolute certainty or complete confusion | "Obviously X" without hedging; or total lack of confidence                 |
| 1     | Poor calibration                         | Overconfident on weak evidence or underconfident on strong evidence        |
| 2     | Some awareness of uncertainty            | Occasional hedging but not well-calibrated                                 |
| 3     | Good calibration                         | Expresses appropriate confidence levels; acknowledges gaps                 |
| 4     | Excellent calibration                    | Specifies what would change view; quantifies confidence; aware of unknowns |

## Overall Score Calculation

### Weighted Average Method

```
Overall Score = (
  Clarity * 1.2 +
  Relevance * 1.0 +
  Logic * 1.5 +
  Evidence * 1.3 +
  Assumptions * 1.2 +
  Alternatives * 1.2 +
  Quantitative * 0.8 +
  Humility * 1.0
) / 9.2 * 25
```

**Rationale for weights:**

- Logic (1.5) - Most critical foundation
- Evidence (1.3) - Strong emphasis on factual basis
- Clarity (1.2) - Essential for communication
- Assumptions (1.2) - Key to rigorous thinking
- Alternatives (1.2) - Shows breadth of analysis
- Relevance (1.0) - Baseline requirement
- Humility (1.0) - Important but subjective
- Quantitative (0.8) - Not always applicable

The result is scaled to 0-100 range.

### Alternative: Simple Average

For simplicity in MVP, can use:

```
Overall Score = (sum of all dimension scores / 32) * 100
```

Where 32 = 8 dimensions × 4 max score

## Usage Guidelines

### For Bedrock Prompts

When evaluating an attempt, Bedrock should:

1. Score each dimension 0-4 using the rubric above
2. Provide 2-4 rationale bullets per dimension explaining the score
3. Reference specific text from the answer
4. Calculate overall score using the weighted formula

### For Profile Updates

Track moving averages per dimension over last N attempts (e.g., N=10):

- Moving average = recent performance indicator
- Standard deviation = consistency measure
- Slope = improvement trend

### Identifying Weaknesses

Weaknesses are dimensions where:

- Moving average < 2.0 (below "moderate" level)
- Or bottom 2-3 dimensions relative to user's own averages

### Generating Recommendations

Based on weakest dimensions, recommend:

- Clarity → Practice exercises on precise definitions
- Logic → Argument mapping exercises
- Evidence → Research and citation practice
- Assumptions → Hidden assumption identification drills
- Alternatives → Devil's advocate exercises
- Quantitative → Fermi estimation practice
- Humility → Calibration training
