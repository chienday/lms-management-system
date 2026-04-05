const AIQuestions = require('../models/aiQuestionsSchema');
const Quiz = require('../models/quizSchema');
const Lecture = require('../models/lectureSchema');

/**
 * Generate AI questions from lecture/topic
 */
const generateAIQuestions = async (req, res) => {
    try {
        const { lectureId, topic, quantity = 5, difficulty = 'medium', questionTypes, subjectId, sclassId } = req.body;
        const { _id: teacherId, school } = req.user;

        // Validate inputs
        if (!lectureId && !topic) {
            return res.status(400).json({ message: 'Either lectureId or topic is required' });
        }

        // Get source content if lecture is provided
        let sourceContent = topic || '';
        if (lectureId) {
            const lecture = await Lecture.findById(lectureId);
            if (!lecture) {
                return res.status(404).json({ message: 'Lecture not found' });
            }
            sourceContent = lecture.content || lecture.aiSummary || topic;
        }

        // Call AI service to generate questions
        // This is a mock implementation - integrate with actual AI service
        const generatedQuestions = await generateQuestionsFromAI(
            sourceContent,
            quantity,
            difficulty,
            questionTypes
        );

        // Save questions to database
        const savedQuestions = [];
        for (const question of generatedQuestions) {
            const aiQuestion = new AIQuestions({
                question: question.question,
                type: question.type || 'multiple_choice',
                options: question.options || [],
                correctAnswer: question.correctAnswer,
                explanation: question.explanation || '',
                topics: question.topics || [],
                difficulty: difficulty,
                bloomsLevel: question.bloomsLevel || 'understand',
                generatedBy: 'gpt',
                generationMethod: lectureId ? 'from_lecture' : 'from_topic',
                sourceLeture: lectureId,
                subject: subjectId,
                sclass: sclassId,
                teacher: teacherId,
                school: school,
                status: 'draft',
            });

            const saved = await aiQuestion.save();
            savedQuestions.push(saved);
        }

        res.status(201).json({
            message: `${savedQuestions.length} AI questions generated successfully`,
            questions: savedQuestions,
        });
    } catch (error) {
        console.error('Error generating AI questions:', error);
        res.status(500).json({ message: 'Error generating questions', error: error.message });
    }
};

/**
 * Get AI generated questions
 */
const getAIQuestions = async (req, res) => {
    try {
        const { subjectId, sclassId, status = 'draft', difficulty } = req.query;
        const { _id: teacherId, school } = req.user;

        let filter = { teacher: teacherId, school: school };

        if (subjectId) filter.subject = subjectId;
        if (sclassId) filter.sclass = sclassId;
        if (status) filter.status = status;
        if (difficulty) filter.difficulty = difficulty;

        const questions = await AIQuestions.find(filter)
            .populate('subject', 'subName')
            .populate('sourceLeture', 'title')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            message: 'AI questions retrieved successfully',
            questions,
            total: questions.length,
        });
    } catch (error) {
        console.error('Error getting AI questions:', error);
        res.status(500).json({ message: 'Error retrieving questions', error: error.message });
    }
};

/**
 * Approve/reject AI question
 */
const reviewAIQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { approved, rating, comment } = req.body;

        const question = await AIQuestions.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.status = approved ? 'approved' : 'rejected';
        question.teacherFeedback = {
            approved,
            rating,
            comment,
            lastReviewedAt: new Date(),
        };

        const savedQuestion = await question.save();

        res.status(200).json({
            message: approved ? 'Question approved' : 'Question rejected',
            question: savedQuestion,
        });
    } catch (error) {
        console.error('Error reviewing question:', error);
        res.status(500).json({ message: 'Error reviewing question', error: error.message });
    }
};

/**
 * Edit AI question
 */
const editAIQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { question, options, correctAnswer, explanation, topics, difficulty, bloomsLevel } = req.body;

        const aiQuestion = await AIQuestions.findById(questionId);

        if (!aiQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Update fields
        if (question) aiQuestion.question = question;
        if (options) aiQuestion.options = options;
        if (correctAnswer) aiQuestion.correctAnswer = correctAnswer;
        if (explanation) aiQuestion.explanation = explanation;
        if (topics) aiQuestion.topics = topics;
        if (difficulty) aiQuestion.difficulty = difficulty;
        if (bloomsLevel) aiQuestion.bloomsLevel = bloomsLevel;
        aiQuestion.updatedAt = new Date();

        const savedQuestion = await aiQuestion.save();

        res.status(200).json({
            message: 'Question updated successfully',
            question: savedQuestion,
        });
    } catch (error) {
        console.error('Error editing question:', error);
        res.status(500).json({ message: 'Error editing question', error: error.message });
    }
};

/**
 * Create quiz from AI questions
 */
const createQuizFromAI = async (req, res) => {
    try {
        const { title, description, questionIds, subjectId, sclassId, dueDate, time_limit } = req.body;
        const { _id: teacherId, school } = req.user;

        // Validate inputs
        if (!title || !questionIds || questionIds.length === 0) {
            return res.status(400).json({ message: 'Title and question IDs are required' });
        }

        // Verify all questions exist and belong to this teacher
        const questions = await AIQuestions.find({
            _id: { $in: questionIds },
            teacher: teacherId,
            status: { $in: ['approved', 'draft'] },
        });

        if (questions.length !== questionIds.length) {
            return res.status(400).json({ message: 'Some questions not found or not authorized' });
        }

        // Create quiz
        const quiz = new Quiz({
            title,
            description,
            subject: subjectId,
            sclass: sclassId,
            teacher: teacherId,
            school: school,
            questions: questionIds,
            dueDate,
            time_limit,
            createdAt: new Date(),
        });

        const savedQuiz = await quiz.save();

        // Update questions status to used
        await AIQuestions.updateMany(
            { _id: { $in: questionIds } },
            { $set: { quiz: savedQuiz._id, status: 'approved' } }
        );

        res.status(201).json({
            message: 'Quiz created from AI questions successfully',
            quiz: savedQuiz,
        });
    } catch (error) {
        console.error('Error creating quiz from AI:', error);
        res.status(500).json({ message: 'Error creating quiz', error: error.message });
    }
};

/**
 * Delete AI question
 */
const deleteAIQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        const removedQuestion = await AIQuestions.findByIdAndDelete(questionId);

        if (!removedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({
            message: 'Question deleted successfully',
            question: removedQuestion,
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
};

/**
 * Mock AI question generation - replace with actual AI service
 */
const generateQuestionsFromAI = async (content, quantity, difficulty, questionTypes = ['multiple_choice']) => {
    // This is a mock implementation
    // In production, this would call OpenAI API or your AI service
    const mockQuestions = [];

    for (let i = 1; i <= quantity; i++) {
        mockQuestions.push({
            question: `Sample question ${i}: What is the main concept discussed in the lecture?`,
            type: questionTypes[0] || 'multiple_choice',
            options: [
                { text: 'Option A', isCorrect: true },
                { text: 'Option B', isCorrect: false },
                { text: 'Option C', isCorrect: false },
                { text: 'Option D', isCorrect: false },
            ],
            correctAnswer: 'Option A',
            explanation: 'This is the correct answer because...',
            topics: ['main_concept'],
            bloomsLevel: 'understand',
        });
    }

    return mockQuestions;
};

module.exports = {
    generateAIQuestions,
    getAIQuestions,
    reviewAIQuestion,
    editAIQuestion,
    createQuizFromAI,
    deleteAIQuestion,
};
