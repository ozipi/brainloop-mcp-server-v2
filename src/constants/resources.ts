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
- **Prevent duplicate work**: This lesson-by-lesson verification prevents creating duplicate content if a failure occurs mid-process
- **Progressive complexity**: Each unit builds on previous ones
- **Interactive learning**: ALWAYS include questions and exercises in lessons
- **Clear learning paths**: Show progression clearly
- **Quality over speed**: Take time to verify each lesson addition rather than batch-creating multiple lessons

### 4. **Essential Components for Every Lesson**
Every lesson MUST include:
- **Core Teaching**: Explanation with examples
- **Interactive Questions**: 2-5 questions that test understanding
- **Practice Exercise**: Hands-on application of the concept
- **Self-Assessment**: Reflection prompts or checkpoints

## Using Brainloop Tools

### Create a Brainloop
\`\`\`
"Hey Claude, create a brainloop about Python Programming with topics:
Introduction, Data Types, Control Flow, Functions, and OOP"
\`\`\`

### Expand Existing Brainloop (ONE LESSON AT A TIME)
\`\`\`
"Add one lesson about decorators to the Functions unit in my Python brainloop"
"Add another lesson about generators to the same unit"
[Wait for confirmation after each lesson before adding the next]
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
  3. **Interactive Questions** (2-5 questions to test understanding)
  4. **Practice Exercise** (Hands-on application)
  5. **Summary** and key takeaways
- **Length**: 5-15 minutes of content
- **Interactivity**: Every lesson MUST include questions and exercises

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
\`\`\`markdown
# Lesson Title

## Introduction
Brief overview of what learner will gain

## Core Concept
Main teaching content with examples

## Check Your Understanding
**Question 1:** [Question text]
- A) [Option]
- B) [Option]
- C) [Option]
- D) [Option]

**Answer:** [Correct answer with brief explanation]

**Question 2:** [Question text]
**Answer:** [Answer with explanation]

[Include 2-5 questions per lesson]

## Practice Exercise
Hands-on exercise or real-world application task

## Summary
Key takeaways and next steps
\`\`\`

### Content Tips
- **Use headers** to organize sections
- **Bold** key terms and concepts
- \`Code blocks\` for technical content
- > Blockquotes for important notes
- Lists for steps or key points
- **Always include interactive questions** - This is NON-NEGOTIABLE
- Mix multiple-choice and open-ended questions
- Provide answers/explanations for all questions

## Expanding Brainloops

**CRITICAL: Add ONE LESSON at a time, verify success, then continue**

Incremental expansion workflow:
1. Create initial brainloop structure with \`create_brainloop\` (topics only)
2. Use \`expand_brainloop\` to add ONE lesson
3. Check response to verify the lesson was created successfully
4. If successful, add the next lesson
5. If failed, troubleshoot before proceeding
6. Repeat until unit is complete
7. Move to next unit

**Why lesson-by-lesson?**
- Prevents duplicate work if errors occur
- Allows quality verification at each step
- Enables adjustments based on feedback
- Catches issues early before compounding`,

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
