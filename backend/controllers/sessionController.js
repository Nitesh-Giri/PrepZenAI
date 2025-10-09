const Session = require("../models/sessionModel");
const Question = require("../models/questionModel");

//Create Session
const createSession = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, description, questions } = req.body;
        const userId = req.user._id;
        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
        });

        const questionDocs = await Promise.all(
            questions.map(async (q) => {
                const question = await Question.create({
                    session: session._id,
                    question: q.question,
                    answer: q.answer,
                });
                return question._id;
            })
        );

        session.questions = questionDocs;
        await session.save();

        res.status(200).json({success: true, session});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

//Get My Sessions
const getMySessions = async (req, res) => {
    try {
        const sessions = await Session.find({user: req.user.id})
        .sort({createdAt: -1})
        .populate("questions")

        res.status(200).json({success: true, sessions});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

//Get Session By Id
const getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
        .populate({
            path: "questions",
            options: {sort: { isPinned: -1, createdAt: 1}}
        })
        .exec();

        if(!session){
            return res.status(404).json({success: false, message: "Session not found"});
        }

        res.status(200).json({success: true, session});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

//Delete Session
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if(!session){
            return res.status(404).json({success: false, message: "Session not found"});
        }

        //Check if logged in user own this session
        if (session.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to delete this session" });
        }

        // first delete all the questions linked to the session
        await Question.deleteMany({session: session._id});

        // Then , delete the session
        await session.deleteOne();

        res.status(200).json({success: true, message: "Session deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

module.exports = {
    createSession,
    getSessionById,
    getMySessions,
    deleteSession,
};