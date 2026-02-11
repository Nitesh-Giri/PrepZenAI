const { GoogleGenAI } = require("@google/genai");
const { questionAnswerPrompt, conceptExplainPrompt } = require("../utils/prompts");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let ai = null;
if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    ai = null;
  }
}

// helper to extract text from various SDK shapes
const extractTextFromResponse = (response) => {
  if (!response) return null;
  if (typeof response === "string") return response;
  if (typeof response.text === "string") return response.text;
  if (response.output && Array.isArray(response.output)) {
    return response.output
      .map((o) => {
        if (!o) return "";
        if (typeof o === "string") return o;
        if (o.content && Array.isArray(o.content)) {
          return o.content.map((c) => c.text || "").join("\n");
        }
        return "";
      })
      .join("\n");
  }
  // fallback to stringifying the whole response
  try {
    return JSON.stringify(response);
  } catch (err) {
    return null;
  }
};

// Improved fallback generator when API quota is exhausted or AI fails
const generateFallbackQuestions = (role, experience, topicsToFocus, numberOfQuestions) => {
  const num = Math.max(1, Number(numberOfQuestions) || 5);

  // Normalize topics into an array of keywords to vary questions
  const topics = (topicsToFocus || "general").split(/[,;|]+/).map(t => t.trim()).filter(Boolean);
  if (topics.length === 0) topics.push("general");

  // Determine difficulty level from experience string
  const expNum = (typeof experience === 'string' && experience.match(/\d+/)) ? Number(experience.match(/\d+/)[0]) : NaN;
  const difficulty = !isNaN(expNum) && expNum >= 5 ? 'advanced' : (!isNaN(expNum) && expNum >= 2 ? 'intermediate' : 'basic');

  const templates = [
    (t) => `Explain the key concepts of ${t} and where it's commonly used.`,
    (t) => `Design a small ${t} module and describe important considerations for ${difficulty} engineers.`,
    (t) => `Write a coding problem related to ${t} and outline an approach to solve it.`,
    (t) => `What are common pitfalls when working with ${t} and how do you avoid them?`,
    (t) => `Compare two approaches for solving a ${t} problem and discuss trade-offs.`,
  ];

  // helper to build an answer string that explains the concept and gives an example
  const buildAnswer = (t, templateIdx) => {
    const base = [];
    base.push(`Brief Explanation:\nDescribe what ${t} is and why it matters.`);
    base.push(`Approach:\nGive a concise step-by-step approach or checklist to handle ${t}.`);
    base.push(`When to use / Trade-offs:\nMention scenarios where ${t} is appropriate and potential drawbacks.`);

    // Add a small language-specific example when topic hints at a language
    const lower = t.toLowerCase();
    if (/c\+\+|cplusplus|cpp/.test(lower)) {
      base.push(`Example (C++):\nclass Example {\n  private:\n    int x;\n  public:\n    void setX(int v){ x = v; }\n};`);
    } else if (/javascript|js|react|node/.test(lower)) {
      base.push('Example (JavaScript):\nclass Example { constructor(x){ this.x = x } }');
    } else if (/python/.test(lower)) {
      base.push('Example (Python):\nclass Example:\n    def __init__(self,x):\n        self.x = x');
    } else if (/java/.test(lower)) {
      base.push('Example (Java):\npublic class Example { private int x; }');
    } else {
      base.push('Example:\nProvide a short pseudo-code or high-level example.');
    }

    // small variation depending on template used
    if (templateIdx === 2) base.push('Solution Outline:\nProvide time/space complexity expectations and edge cases.');

    return base.join('\n\n');
  };

  const results = [];
  const used = new Set();
  let tIndex = 0;
  let tmplIndex = 0;

  while (results.length < num) {
    const topic = topics[tIndex % topics.length];
    tmplIndex = (tmplIndex + 1) % templates.length;
    const questionText = templates[tmplIndex](topic);

    // Ensure uniqueness (avoid exact duplicates)
    if (used.has(questionText)) {
      // if duplicate, shift template or topic
      tIndex++;
      continue;
    }

    used.add(questionText);

    const answerText = buildAnswer(topic, tmplIndex);

    results.push({ question: questionText, answer: answerText });

    // advance indices to produce variety
    tIndex++;
  }

  return results;
};

// Fallback explanation when API quota is exhausted or AI fails
const generateFallbackExplanation = (question) => {
  const title = question.length > 80 ? question.slice(0, 77) + '...' : question;

  // Heuristic language detection for code examples
  const q = question.toLowerCase();
  let lang = null;
  if (/c\+\+|cplusplus|cpp/.test(q)) lang = 'cpp';
  else if (/javascript|js|react|node/.test(q)) lang = 'javascript';
  else if (/python/.test(q)) lang = 'python';
  else if (/java/.test(q)) lang = 'java';

  // Build a multi-paragraph detailed explanation
  let explanation = `This is a fallback explanation for the question: "${question}".\n\n`;
  explanation += 'Definition:\n';
  explanation += 'Provide a concise definition or summary of the concept, focusing on core ideas and why it matters.\n\n';

  explanation += 'Key Points to Understand:\n';
  explanation += '- Break the topic into smaller concepts and explain each part clearly.\n';
  explanation += '- Describe when and why you would use this concept.\n';
  explanation += '- Mention common pitfalls, trade-offs, and variations.\n\n';

  explanation += 'Approach / How it Works:\n';
  explanation += 'Explain the step-by-step approach or mechanism behind the concept, using simple language and examples where helpful.\n\n';

  // Add a simple code example when a language is detected
  if (lang === 'cpp') {
    explanation += 'Example (C++):\n';
    explanation += '```cpp\nclass Rectangle {\nprivate:\n  int width;\n  int height;\npublic:\n  void setWidth(int w) { width = w; }\n  void setHeight(int h) { height = h; }\n  int getArea() { return width * height; }\n};\n```\n\n';
    explanation += 'In this example, data members are private and accessed through public setter/getter methods, demonstrating encapsulation.\n';
  } else if (lang === 'javascript') {
    explanation += 'Example (JavaScript):\n';
    explanation += '```javascript\nclass Rectangle {\n  #width;\n  #height;\n  constructor(w,h){ this.#width = w; this.#height = h; }\n  setWidth(w){ this.#width = w }\n  getArea(){ return this.#width * this.#height }\n}\n```\n\n';
    explanation += 'This shows private fields (using `#`) and methods to interact with them.\n';
  } else if (lang === 'python') {
    explanation += 'Example (Python):\n';
    explanation += '```python\nclass Rectangle:\n    def __init__(self, w, h):\n        self._width = w\n        self._height = h\n    def set_width(self, w):\n        self._width = w\n    def get_area(self):\n        return self._width * self._height\n```\n\n';
    explanation += 'Python uses conventions like `_width` to indicate protected/private attributes; use getters/setters to control access.\n';
  } else if (lang === 'java') {
    explanation += 'Example (Java):\n';
    explanation += '```java\npublic class Rectangle {\n  private int width;\n  private int height;\n  public void setWidth(int w) { this.width = w; }\n  public int getArea() { return width * height; }\n}\n```\n\n';
    explanation += 'Java enforces access control via access modifiers like `private` and `public`.\n';
  } else {
    explanation += 'Example:\nProvide a short pseudo-code or high-level example relevant to the concept.\n\n';
  }

  explanation += '\nTips to remember:\n';
  explanation += '- Describe edge cases and when to avoid the pattern.\n';
  explanation += '- Suggest further reading or keywords to search for deeper understanding.\n';

  return { title, explanation, isFallback: true };
};

//Generate Interview Questions
const generateInterviewQuestions = async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured on the server" });
    }

    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);

    let response;
    try {
      response = await ai.models.generateContent({ model: "gemini-2.0-flash-lite", contents: prompt });
    } catch (err) {
      // Handle quota / rate limit errors by returning fallback questions so session creation can proceed
      const isQuotaError = err && (err.status === 429 || (err.error && err.error.code === 429) || (err.statusCode === 429));
      if (isQuotaError) {
        const fallback = generateFallbackQuestions(role, experience, topicsToFocus, numberOfQuestions);
        return res.status(200).json(fallback);
      }
      throw err;
    }

    const rawText = extractTextFromResponse(response);

    if (!rawText) {
      return res.status(500).json({ message: "AI did not return textual output", rawResponse: response });
    }

    const cleanedText = rawText.replace(/^```json\\s*/i, "").replace(/```$/, "").trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      return res.status(500).json({ message: "Failed to parse AI response as JSON", parseError: err.message, rawText: cleanedText });
    }

    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate question", error: error.message });
  }
};

//Generate Concept Explanation
const generateConceptExplanation = async (req, res) => {
  const MAX_RETRIES = 3; // retry up to 3 times
  const RETRY_DELAY = 1500; // ms

  try {
    if (!ai) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured on the server" });
    }

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const prompt = conceptExplainPrompt(question);

    // Retry wrapper
    const callAI = async (retriesLeft = MAX_RETRIES) => {
      try {
        const response = await ai.models.generateContent({ model: "gemini-2.0-flash-lite", contents: prompt });

        const rawText = extractTextFromResponse(response);

        if (!rawText) throw new Error("AI did not return textual output");

        const cleanedText = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

        try {
          return JSON.parse(cleanedText);
        } catch (err) {
          throw err;
        }
      } catch (error) {
        // Handle overloaded model (503)
        if (error.status === 503 && retriesLeft > 0) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          return callAI(retriesLeft - 1);
        }
        throw error; // Other errors or retries exhausted
      }
    };

    let data;
    try {
      data = await callAI();
    } catch (err) {
      // If quota/rate-limit (429) was returned, provide a fallback explanation
      const isQuotaError = err && (err.status === 429 || (err.error && err.error.code === 429) || (err.statusCode === 429));
      if (isQuotaError) {
        const fallback = generateFallbackExplanation(question);
        return res.status(200).json(fallback);
      }
      throw err;
    }

    res.status(200).json(data);
  } catch (error) {
    const message = error.status === 503 ? "AI model is currently overloaded. Please try again later." : "Failed to generate explanation. Please try again.";
    res.status(500).json({ message, error: error.message });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
};
