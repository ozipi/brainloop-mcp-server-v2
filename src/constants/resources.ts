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
    uri: "guidelines://lesson-template",
    name: "Lesson Content Template",
    description: "Structured template for creating engaging, consistent lesson content with hooks, learning objectives, and key takeaways",
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
- **MDX Components**: Use custom interactive components when appropriate (see MDX Components section below)

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
- Maintains clean state even if process is interrupted

## MDX Components Available

The BRAINLOOP platform supports custom interactive MDX components that can be embedded directly in lesson content. These components provide rich, interactive learning experiences beyond standard markdown.

### Available Components:

#### 1. HebrewCircle (Fully Implemented)
Interactive Hebrew letters arranged in mystical circles for Kabbalah and Hebrew learning.

**Usage:**
\`\`\`mdx
<HebrewCircle
  mode="select-letter"
  targetLetter="א"
  instruction="Find the letter Aleph"
  size={400}
  showTooltips={true}
  showGematria={true}
/>
\`\`\`

**Properties:**
- \`mode\`: "select-letter" | "identify-ring" | "find-sequence"
- \`targetLetter\`: Hebrew letter to find (e.g., "א", "ב")
- \`instruction\`: Text instruction for the user
- \`size\`: Circle size in pixels (200-800, default 400)
- \`backgroundColor\`: Hex color for background
- \`showTooltips\`: Show letter names on hover
- \`showGematria\`: Show numerical values
- \`showSectionHighlight\`: Highlight sections
- \`mysticalMode\`: Enable mystical styling
- \`respectfulMode\`: Handle divine names respectfully

**Use cases:**
- Hebrew alphabet learning
- Kabbalah studies
- Letter recognition exercises
- Gematria calculations

#### 2. AlphabetComponent (Fully Implemented)
Interactive alphabet selection for different writing systems.

**Usage:**
\`\`\`mdx
<AlphabetComponent
  language="hebrew"
  letters={["א", "ב", "ג", "ד", "ה"]}
  layout="grid"
  showNames={true}
  gridColumns={5}
/>
\`\`\`

**Properties:**
- \`language\`: "hebrew" | "arabic" | "greek" | "cyrillic"
- \`letters\`: Array of letters to display
- \`layout\`: "grid" | "linear"
- \`showNames\`: Show letter names
- \`gridColumns\`: Number of columns (1-10) for grid layout

**Use cases:**
- Alphabet learning for any supported language
- Letter selection exercises
- Writing system comparisons

#### 3. WorldMap (Planned - Placeholder)
Interactive world map for geography questions.

**Future Usage:**
\`\`\`mdx
<WorldMap
  region="europe"
  countries={["France", "Germany", "Italy"]}
  showLabels={true}
  zoomLevel={5}
/>
\`\`\`

**Use cases:**
- Geography lessons
- Country identification
- Geopolitical studies

#### 4. PianoKeyboard (Planned - Placeholder)
Interactive piano keyboard for music theory.

**Future Usage:**
\`\`\`mdx
<PianoKeyboard
  startNote="C4"
  endNote="C5"
  showLabels={true}
  playSound={true}
/>
\`\`\`

**Use cases:**
- Music theory
- Note identification
- Chord learning

#### 5. DiagramSelector (Planned - Placeholder)
Interactive diagram with selectable elements.

**Future Usage:**
\`\`\`mdx
<DiagramSelector
  diagramType="cell-structure"
  elements={[
    { id: "nucleus", label: "Nucleus", x: 50, y: 50 },
    { id: "membrane", label: "Cell Membrane", x: 100, y: 100 }
  ]}
  showConnections={true}
/>
\`\`\`

**Use cases:**
- Biology diagrams
- System architecture
- Process flows

#### 6. Timeline (Planned - Placeholder)
Interactive timeline for historical events.

**Future Usage:**
\`\`\`mdx
<Timeline
  events={[
    { id: "1", date: "1776", title: "Independence", description: "..." },
    { id: "2", date: "1789", title: "Constitution", description: "..." }
  ]}
/>
\`\`\`

**Use cases:**
- History lessons
- Project timelines
- Event sequencing

#### 7. PeriodicTable (Planned - Placeholder)
Interactive periodic table for chemistry.

**Future Usage:**
\`\`\`mdx
<PeriodicTable
  elements={["H", "He", "Li", "Be"]}
  showDetails={true}
  highlightGroups={true}
/>
\`\`\`

**Use cases:**
- Chemistry education
- Element properties
- Periodic trends

### When to Use MDX Components:

- **Enhanced engagement**: When standard text/images aren't sufficient
- **Interactive learning**: For hands-on practice within lessons
- **Visual learning**: For topics that benefit from interactive visualization
- **Language learning**: Hebrew, Arabic, Greek, Cyrillic alphabets
- **Subject-specific needs**: Music, geography, chemistry, history

### Important Notes:

1. **Currently implemented**: HebrewCircle and AlphabetComponent
2. **Planned components**: Will be implemented in future phases
3. **MDX syntax**: Components use JSX-like syntax in markdown
4. **Performance**: Components are optimized for smooth interaction
5. **Accessibility**: All components support keyboard navigation

### MDX Component Best Practices:

- Use components to **enhance** learning, not replace clear explanations
- Place components **after** introducing the concept in text
- Provide **clear instructions** for how to interact
- Keep component configurations **simple** and focused
- Test components to ensure they **work as expected**`,

  LESSON_TEMPLATE: `# Lesson Content Template

## Overview
This template provides a proven structure for creating engaging, effective lessons that maximize learning retention and engagement. Use this as your guideline every time you create lesson content for brainloops.

---

# [Lesson Title]

## 🎯 Hook & Context
[2-3 sentences that grab attention and establish relevance. Use a surprising fact, relatable scenario, or provocative question. Answer "Why should I care?"]

## 📋 What You'll Learn
By the end of this lesson, you'll be able to:
- [Specific, measurable objective using action verb]
- [Specific, measurable objective using action verb]
- [Specific, measurable objective using action verb]
- [Optional: 4th objective]

---

## 📚 Core Content

### [Subsection 1: First Key Concept]
[Explain the first major concept. Structure: define → explain → provide evidence → give example]

[Include relevant data, research findings, or concrete details]

**Example:** [Real-world application or scenario]

### [Subsection 2: Second Key Concept]
[Continue with the next major idea, building on the previous section]

[Use clear transitions between ideas]

### [Subsection 3: Additional Concepts as Needed]
[Keep each subsection focused on ONE main idea]

[Use formatting like **bold** for key terms, but don't overdo it]

---

## 💡 Key Takeaways
Remember these essential points:
- **[Main Point 1]:** [Brief explanation]
- **[Main Point 2]:** [Brief explanation]
- **[Main Point 3]:** [Brief explanation]
- **[Optional Point 4]:** [Brief explanation]

---

## ✅ Check Your Understanding
[Your interaction questions will appear here automatically - these are created separately using create_interaction and create_prompt tools]

---

## Template Usage Guidelines

### Content Length Guidelines:
- **Hook & Context**: 50-100 words
- **Learning Objectives**: 15-40 words per objective
- **Core Content**: 300-800 words total (adjust based on complexity)
- **Each subsection**: 100-250 words
- **Key Takeaways**: 10-25 words per point
- **Total lesson**: 500-1200 words (aim for 7-12 minute read)

### Best Practices:
1. **Use concrete examples**, not just theory
2. **Include numbers/data** when possible (builds credibility)
3. **Keep paragraphs short** (3-4 sentences max)
4. **Use analogies** for complex concepts
5. **Maintain consistent voice** throughout
6. **Front-load important information**
7. **Link concepts** to prior lessons when relevant
8. **Add visual interest** with markdown formatting

### Markdown Tips:
- Use \`###\` for subsection headers (not \`##\`)
- **Bold sparingly** - only key terms on first use
- Use \`**Example:**\` to flag practical applications
- Avoid excessive formatting (no emojis in content body except section headers)
- Keep it scannable with whitespace
- Use code blocks for technical content: \`\`\`language\`\`\`
- Use blockquotes for important notes: \`> Important note\`
- Use lists for steps or key points

### Section-by-Section Guide:

#### 🎯 Hook & Context
**Purpose**: Grab attention and answer "Why should I care?"
**Techniques**:
- Start with a surprising statistic
- Pose a thought-provoking question
- Share a relatable problem scenario
- Present a counterintuitive fact
**Example**: "Did you know that 70% of developers spend more time debugging than writing new code? Understanding design patterns could cut that time in half."

#### 📋 What You'll Learn
**Purpose**: Set clear expectations and learning outcomes
**Format**: Action-oriented bullet points
**Verbs to use**: Create, Explain, Implement, Analyze, Apply, Compare, Design, Solve
**Example**:
- Implement the Factory pattern in real-world applications
- Recognize when to use different creational patterns
- Refactor existing code to use design patterns

#### 📚 Core Content
**Purpose**: Deliver the main teaching content
**Structure**: 2-4 subsections, each focused on ONE concept
**Flow**: Introduction → Detailed Explanation → Evidence/Data → Example → Transition
**Tips**:
- Start simple, build complexity gradually
- Use concrete before abstract
- Provide context before diving into details
- Include visual descriptions when helpful
- Break up text with formatting

#### 💡 Key Takeaways
**Purpose**: Reinforce the most important points
**Format**: 3-4 bullet points with bold key terms
**Content**: Should be able to stand alone as a summary
**Test**: Could someone understand the lesson basics from just this section?

### Common Mistakes to Avoid:
❌ Starting with dense theory without context
❌ Skipping the "why it matters" explanation
❌ Using jargon without definitions
❌ Writing walls of text without breaks
❌ Forgetting to include examples
❌ Making learning objectives vague ("Understand X" instead of "Implement X")
❌ Overusing emojis or excessive formatting
❌ Including quiz questions in lesson content (they go in interactions)

### Quality Checklist:
✅ Hook grabs attention immediately
✅ Learning objectives use action verbs
✅ Each subsection has a clear focus
✅ Examples are concrete and relatable
✅ Key takeaways summarize effectively
✅ Length is appropriate (500-1200 words)
✅ Markdown formatting enhances readability
✅ No quiz questions in content (saved for interactions)
✅ Consistent tone and voice
✅ Clear progression from simple to complex

---

## Remember:
- **Lesson content = TEACHING** (explanations, examples, concepts)
- **Interactions = ASSESSMENT** (questions, exercises, created separately)
- This template is for lesson content ONLY
- After creating lesson, add 5 interactions using create_interaction and create_prompt tools`,

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
