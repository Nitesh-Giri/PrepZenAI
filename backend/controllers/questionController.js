const Question = require("../models/questionModel");
const Session = require("../models/sessionModel");

//Add Question to Session
const addQuestionToSession = async (req, res) => {
    try {
        const {sessionId, question} = req.body;

        if(!sessionId || !question || !Array.isArray(question)){
            return res.status(400).json({message: "Session ID and question are required"});
        }

        const session = await Session.findById(sessionId);
        
        if(!session){
            return res.status(404).json({message: "Session not found"});
        }

        //Create new questions
        const createdQuestions = await Question.insertMany(
            question.map( (q) => ({
                session: sessionId,
                question: q.question,
                answer: q.answer,
            }))
        );

        //Update session with new questions
        session.questions.push(...createdQuestions.map((q) => q._id));
        await session.save();

        res.status(201).json(createdQuestions);
        
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

//Toggle Pin Question
const togglePinQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if(!question){
            return res.status(404).json({success: false, message: "Question not found"});
        }

        question.isPinned = !question.isPinned;
        await question.save();
        
        res.status(200).json({success: true, question});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

//Update Question Note  
const updateQuestionNote = async (req, res) => {
    try {
        const {note} = req.body;
        const question = await Question.findById(req.params.id);

        if(!question){
            return res.status(404).json({success: false, message: "Question not found"});
        }

        question.note = note || "";
        await question.save();
        
        res.status(200).json({success: true, question});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

module.exports = {
    addQuestionToSession,
    togglePinQuestion,
    updateQuestionNote,
}