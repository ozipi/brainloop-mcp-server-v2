/**
 * @file Resource constants for the BRAINLOOP MCP server
 * @module constants/resources
 */

/**
 * Resource definitions for the BRAINLOOP MCP server
 */
export const RESOURCES = [
  {
    uri: "brainloop://config",
    name: "BRAINLOOP Configuration",
    description: "Current BRAINLOOP authentication and server configuration",
    mimeType: "application/json",
  },
  {
    uri: "guidelines://brainloop-creation",
    name: "Brainloop Creation Guide",
    description: "Best practices for creating effective brainloops",
    mimeType: "text/markdown",
  },
  {
    uri: "guidelines://learning-design",
    name: "Learning Design Principles",
    description: "Principles for designing engaging learning experiences",
    mimeType: "text/markdown",
  },
  {
    uri: "guidelines://content-structure",
    name: "Content Structure Guidelines",
    description: "How to structure units and lessons in your brainloops",
    mimeType: "text/markdown",
  },
  {
    uri: "template://brainloop",
    name: "Brainloop Template",
    description: "Template for creating a well-structured brainloop",
    mimeType: "application/json",
  },
  {
    uri: "stats://server",
    name: "Server Statistics",
    description: "Real-time BRAINLOOP server statistics and metrics",
    mimeType: "application/json",
  },
] as const;

/**
 * Resource content templates
 */
export const RESOURCE_CONTENT = {
  BRAINLOOP_CREATION_GUIDE: `# Brainloop Creation Guide

## What is a Brainloop?

A **brainloop** is a complete, structured learning experience designed to help learners master a topic through organized units and lessons. Think of it as a learning journey that loops back and reinforces concepts.

## Creating Your First Brainloop

### 1. **Choose Your Topic**
- Pick a clear, focused subject area
- Consider your audience's skill level
- Define learning objectives

### 2. **Structure Your Content**
Break your topic into **units** (major concepts) and **lessons** (specific skills):

\`\`\`
Brainloop: "Machine Learning Fundamentals"
├── Unit 1: Introduction to ML
│   ├── Lesson 1: What is Machine Learning?
│   ├── Lesson 2: Types of ML (Supervised, Unsupervised)
│   └── Lesson 3: ML Workflow Overview
├── Unit 2: Data Preparation
│   ├── Lesson 1: Data Collection
│   ├── Lesson 2: Data Cleaning
│   └── Lesson 3: Feature Engineering
└── Unit 3: Model Training
    ├── Lesson 1: Choosing Algorithms
    ├── Lesson 2: Training Models
    └── Lesson 3: Evaluating Results
\`\`\`

### 3. **Best Practices**
- **Start simple**: Begin with 3-5 units (structure only, no lessons yet)
- **ONE LESSON AT A TIME**: Use \`create_brainloop\` to create structure, then \`expand_brainloop\` to add ONE lesson at a time
- **VERIFY EACH LESSON**: After adding each lesson, check the response to confirm it was created successfully before adding the next one
- **ADD 5 INTERACTIONS AFTER LESSON**: Once a lesson is verified, immediately add 5 interactions (questions/exercises) before proceeding to the next lesson (unless user specifies a different number)
- **VERIFY INTERACTION**: Confirm the interaction was created successfully before moving to the next lesson
- **Prevent duplicate work**: This lesson-by-lesson + interaction verification prevents creating duplicate content if a failure occurs mid-process
- **Progressive complexity**: Each unit builds on previous ones
- **Interactive learning**: ALWAYS include questions and exercises via interactions
- **Clear learning paths**: Show progression clearly
- **Quality over speed**: Take time to verify each lesson AND its interaction before proceeding

### 4. **Essential Components for Every Lesson**
Every lesson MUST include:
- **Core Teaching**: Explanation with examples (in lesson content)
- **5 Interactions**: Created separately AFTER lesson is verified (default: 5, unless user specifies different)
  - **Type**: Questions, exercises, or assessments
  - **Prompts**: Each interaction should test a specific aspect of understanding
  - **Mix of types**: Multiple-choice, short answer, practice exercises, self-assessment
  - **Progressive difficulty**: Start easy, increase complexity

## Using Brainloop Tools

### Create a Brainloop
\`\`\`
"Hey Claude, create a brainloop about Python Programming with topics:
Introduction, Data Types, Control Flow, Functions, and OOP"
\`\`\`

### Expand Existing Brainloop (ONE LESSON AT A TIME + 5 INTERACTIONS)
\`\`\`
"Add one lesson about decorators to the Functions unit in my Python brainloop"
[Wait for confirmation that lesson was created]
"Add 5 interactions to test understanding of decorators"
[Wait for confirmation that interactions were created]
"Now add a lesson about generators to the same unit"
[Repeat: lesson → verify → 5 interactions → verify → next lesson]

Note: User can specify different number: "Add 3 interactions instead"
\`\`\`

### Track Progress
\`\`\`
"Show my brainloop progress"
\`\`\``,

  LEARNING_DESIGN_PRINCIPLES: `# Learning Design Principles

## Core Principles for Effective Brainloops

### 1. **Chunking**
Break complex topics into digestible pieces:
- Each lesson = one focused concept
- Units group related concepts
- Avoid cognitive overload

### 2. **Scaffolding**
Build knowledge progressively:
- Start with fundamentals
- Gradually increase complexity
- Connect new concepts to previous learning

### 3. **Active Learning**
Engage learners actively:
- Include examples and exercises
- Encourage practice and application
- Provide opportunities for reflection

### 4. **Spaced Repetition**
Reinforce learning over time:
- Revisit key concepts in later lessons
- Build on previous knowledge
- Use the "loop" concept - circle back to reinforce

### 5. **Clear Learning Objectives**
Each lesson should answer:
- What will learners be able to do?
- Why is this important?
- How does this connect to other concepts?

## Brainloop Structure Best Practices

### Unit Design
- **3-7 lessons per unit** - Optimal for retention
- **Clear theme** - Each unit focuses on one major concept
- **Dependencies** - Mark prerequisites clearly
- **Progressive difficulty** - Easy → Medium → Advanced

### Lesson Design
- **Title**: Clear and descriptive
- **Content Structure** (REQUIRED):
  1. **Introduction** (Why learn this?)
  2. **Core Concept** explanation with examples
  3. **Summary** and key takeaways
- **Length**: 5-15 minutes of content
- **5 Interactions** (Created separately AFTER lesson):
  - **Default**: 5 interactions per lesson (user can specify different number)
  - **Mix of types**: Multiple-choice, short answer, code challenges, practice exercises
  - **Progressive difficulty**: Easy → Medium → Hard
  - **Each interaction tests different aspect**: Comprehension, application, analysis, synthesis
  - Every lesson MUST have 5 interactions (unless user specifies otherwise)

### Content Guidelines
- Use **markdown** for formatting
- Include **code examples** where relevant
- Add **visual descriptions** (diagrams, charts)
- Provide **real-world applications**
- End with **key takeaways**`,

  CONTENT_STRUCTURE_GUIDELINES: `# Content Structure Guidelines

## Structuring Your Brainloop

### Three-Level Hierarchy

1. **Brainloop** (Course Level)
   - The complete learning journey
   - Clear title and description
   - 3-10 units typically

2. **Units** (Topic Level)
   - Major concepts or themes
   - 3-7 lessons each
   - Can have dependencies on other units

3. **Lessons** (Skill Level)
   - Specific skills or concepts
   - Self-contained learning modules
   - 5-15 minutes of content

## Creating Effective Structure

### For Technical Topics
\`\`\`
Brainloop: "Web Development"
├── Unit: HTML Fundamentals
├── Unit: CSS Styling
├── Unit: JavaScript Basics
├── Unit: DOM Manipulation
└── Unit: Building Projects
\`\`\`

### For Conceptual Topics
\`\`\`
Brainloop: "Product Management"
├── Unit: Product Strategy
├── Unit: User Research
├── Unit: Roadmap Planning
├── Unit: Stakeholder Management
└── Unit: Metrics and Analytics
\`\`\`

### For Skills-Based Topics
\`\`\`
Brainloop: "Public Speaking"
├── Unit: Preparation
├── Unit: Delivery Techniques
├── Unit: Managing Anxiety
├── Unit: Visual Aids
└── Unit: Q&A Handling
\`\`\`

## Lesson Content Format

### Recommended Structure (ALWAYS USE THIS)

**Lesson Content:**
\`\`\`markdown
# Lesson Title

## Introduction
Brief overview of what learner will gain

## Core Concept
Main teaching content with examples

## Summary
Key takeaways and next steps
\`\`\`

**5 Interactions (Created separately AFTER lesson is verified):**
\`\`\`json
// Interaction 1 - Easy Multiple Choice
{
  "type": "assessment",
  "prompts": [{
    "question": "What is the basic concept of [topic]?",
    "type": "multiple_choice",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": "C",
    "explanation": "Explanation of correct answer"
  }]
}

// Interaction 2 - Medium Multiple Choice
{
  "type": "assessment",
  "prompts": [{
    "question": "How would you apply [concept] in this scenario?",
    "type": "multiple_choice",
    "options": ["A) Approach 1", "B) Approach 2", "C) Approach 3", "D) Approach 4"],
    "answer": "B",
    "explanation": "Detailed explanation"
  }]
}

// Interaction 3 - Short Answer
{
  "type": "exercise",
  "prompts": [{
    "question": "Explain why [concept] is important",
    "type": "short_answer",
    "answer": "Expected key points: point 1, point 2, point 3"
  }]
}

// Interaction 4 - Code/Practice Challenge
{
  "type": "exercise",
  "prompts": [{
    "question": "Complete this hands-on task: [specific task]",
    "type": "code_challenge",
    "answer": "Sample solution or approach"
  }]
}

// Interaction 5 - Self-Assessment
{
  "type": "reflection",
  "prompts": [{
    "question": "How confident are you in applying this concept?",
    "type": "self_assessment",
    "answer": "Reflection prompt - no single correct answer"
  }]
}
\`\`\`
[Default: 5 interactions per lesson. User can specify different number.]

### Content Tips
**For Lesson Content:**
- **Use headers** to organize sections
- **Bold** key terms and concepts
- \`Code blocks\` for technical content
- > Blockquotes for important notes
- Lists for steps or key points
- Focus on teaching content, NOT questions (questions go in interactions)

**For Interactions:**
- **Always create 5 interactions after lesson is verified** - This is NON-NEGOTIABLE (unless user specifies different)
- **Mix of types**: Multiple-choice, short answer, code challenges, self-assessment
- **Progressive difficulty**: Interaction 1-2 (easy), 3-4 (medium), 5 (reflection)
- Provide answers/explanations for all prompts
- Each interaction typically has 1 prompt (focused on one aspect)
- Match interaction type to learning goal (assessment, exercise, reflection)

## Expanding Brainloops

**CRITICAL: Add ONE LESSON at a time, then its 5 INTERACTIONS, verify each step**

Incremental expansion workflow:
1. Create initial brainloop structure with \`create_brainloop\` (topics only)
2. Use \`expand_brainloop\` to add ONE lesson (teaching content only)
3. **VERIFY**: Check response to confirm lesson was created successfully
4. Add 5 interactions (questions/exercises) for that lesson - one at a time or in batch
5. **VERIFY**: Check response to confirm all 5 interactions were created successfully
6. If all successful, proceed to next lesson
7. If any step fails, troubleshoot before proceeding
8. Repeat: lesson → verify → 5 interactions → verify → next lesson
9. Continue until unit is complete, then move to next unit

**Default: 5 interactions per lesson**
- User can override: "Add 3 interactions instead" or "Add 10 interactions"
- Mix of difficulty levels (easy, medium, reflection)
- Mix of types (multiple-choice, short answer, code, self-assessment)

**Why lesson-by-lesson + 5-interactions-per-lesson?**
- Prevents duplicate work if errors occur mid-creation
- Allows quality verification at each granular step
- Ensures each lesson has rich interactive components (5) before moving on
- Provides comprehensive assessment of understanding
- Enables adjustments based on feedback
- Catches issues early before compounding
- Maintains clean state even if process is interrupted`,

  BRAINLOOP_TEMPLATE: `{
  "title": "Your Brainloop Title",
  "description": "What learners will gain from this brainloop",
  "topics": [
    "Introduction and Fundamentals",
    "Core Concepts",
    "Advanced Topics",
    "Practical Applications",
    "Projects and Practice"
  ],
  "lesson_content_example": "# Lesson Title\\n\\n## Introduction\\nBrief overview of what learner will gain\\n\\n## Core Concept\\nMain teaching content with examples\\n\\n## Check Your Understanding\\n**Question 1:** What is the main purpose of this concept?\\n- A) Option 1\\n- B) Option 2\\n- C) Option 3\\n- D) Option 4\\n\\n**Answer:** C - Option 3. [Brief explanation why]\\n\\n**Question 2:** How would you apply this in a real-world scenario?\\n**Answer:** [Open-ended answer with guidance]\\n\\n## Practice Exercise\\nHands-on task to apply what you learned\\n\\n## Summary\\nKey takeaways and next steps",
  "units": [
    {
      "title": "Introduction and Fundamentals",
      "description": "Foundation concepts for this topic",
      "lessons": [
        {
          "title": "What is [Topic]?",
          "content": "MUST include: Introduction + Core Concept + 2-5 Questions + Practice Exercise + Summary"
        },
        {
          "title": "Why Learn [Topic]?",
          "content": "MUST include: Introduction + Core Concept + 2-5 Questions + Practice Exercise + Summary"
        },
        {
          "title": "Getting Started",
          "content": "MUST include: Introduction + Core Concept + 2-5 Questions + Practice Exercise + Summary"
        }
      ]
    },
    {
      "title": "Core Concepts",
      "description": "Essential knowledge and skills",
      "lessons": [
        {
          "title": "Concept 1",
          "content": "MUST include: Introduction + Core Concept + 2-5 Questions + Practice Exercise + Summary"
        },
        {
          "title": "Concept 2",
          "content": "MUST include: Introduction + Core Concept + 2-5 Questions + Practice Exercise + Summary"
        }
      ]
    }
  ]
}`,
} as const;

/**
 * Server information constants
 */
export const SERVER_INFO = {
  name: "brainloop-mcp-server",
  version: "3.0.1",
} as const;

/**
 * Error messages for resource operations
 */
export const RESOURCE_ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED: "Authentication required: BRAINLOOP access token not found",
  INVALID_URI: (uri: string) => `Invalid resource URI: ${uri}. Available resources: brainloop://config, guidelines://*, template://brainloop, stats://server`,
  FETCH_FAILED: (error: unknown) => `Failed to fetch resource: ${error instanceof Error ? error.message : "Unknown error"}`,
  LIST_FAILED: (error: unknown) => `Failed to list resources: ${error instanceof Error ? error.message : "Unknown error"}`,
} as const;
