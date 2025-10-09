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
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
    generateInterviewQuestions,
    generateConceptExplanation,
}