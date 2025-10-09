const { GoogleGenAI } = require("@google/genai");
const {questionAnswerPrompt, conceptExplainPrompt} = require("../utils/prompts");
const { response } = require("express");

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

//Generate Interview Questions
const generateInterviewQuestions = async (req, res) => {
    try {
        const {role, experience, topicsToFocus, numberOfQuestions} = req.body;

        if(!role || !experience || !topicsToFocus || !numberOfQuestions){
            return res.status(400).json({message: "All fields are required"});
        }

        const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        let rawText = response.text;
        // Clean it: Remove ```json and ``` from begining and end

        const cleanedText= rawText
            .replace(/^```json\s*/, "")
            .replace(/```$/, "")
            .trim();

        // now safe to parse
        const data = JSON.parse(cleanedText);
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({message: "Failed to generate question", error: error.message});
    }
}

//Generate Concept Explanation
const generateConceptExplanation = async (req, res) => {
  const MAX_RETRIES = 3;   // retry up to 3 times
  const RETRY_DELAY = 1500; // ms

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const prompt = conceptExplainPrompt(question);

    // Retry wrapper
    const callAI = async (retriesLeft = MAX_RETRIES) => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: prompt,
        });

        let rawText = response.text;

        const cleanedText = rawText
          .replace(/^```json\s*/, "")
          .replace(/```$/, "")
          .trim();

        return JSON.parse(cleanedText);
      } catch (error) {
        // Handle overloaded model (503)
        if (error.status === 503 && retriesLeft > 0) {
          console.warn(`Model overloaded, retrying in ${RETRY_DELAY}ms...`);
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          return callAI(retriesLeft - 1);
        }
        throw error; // Other errors or retries exhausted
      }
    };

    const data = await callAI();
    res.status(200).json(data);

  } catch (error) {
    console.error("AI Error:", error);
    // Provide a friendly message for overload or parsing errors
    const message =
      error.status === 503
        ? "AI model is currently overloaded. Please try again later."
        : "Failed to generate explanation. Please try again.";
    res.status(500).json({ message, error: error.message });
  }
};


module.exports = {
    generateInterviewQuestions,
    generateConceptExplanation,
}