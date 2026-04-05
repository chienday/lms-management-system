const mongoose = require("mongoose");

/**
 * AI Questions Schema
 * Stores AI-generated questions for quizzes
 * Questions can be generated from lectures, learning materials, or past performance
 */
const aiQuestionsSchema = new mongoose.Schema({
    // Reference to subject
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
        index: true,
    },

    // Reference to class (optional)
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    },

    // Reference to teacher who approved/downloaded
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
        index: true,
    },

    // Reference to school
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
        index: true,
    },

    // Reference to quiz (if used in a quiz)
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quiz',
    },

    // Reference to lecture this question is based on
    sourceLeture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lecture',
    },

    // Question text
    question: {
        type: String,
        required: true,
    },

    // Question type
    type: {
        type: String,
        enum: ['multiple_choice', 'short_answer', 'essay', 'true_false', 'matching'],
        required: true,
    },

    // Answer options for multiple choice
    options: [{
        text: String,
        isCorrect: Boolean,
    }],

    // Correct answer(s)
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },

    // Explanation for the answer
    explanation: {
        type: String,
        default: "",
    },

    // Topics/keywords covered
    topics: [{
        type: String,
    }],

    // Difficulty level
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },

    // Bloom's taxonomy level
    bloomsLevel: {
        type: String,
        enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
        default: 'understand',
    },

    // AI generation metadata
    generatedBy: {
        type: String,
        enum: ['gpt', 'claude', 'custom'],
        default: 'gpt',
    },

    // Generation method
    generationMethod: {
        type: String,
        enum: ['from_lecture', 'from_performance', 'from_topic', 'custom'],
        required: true,
    },

    // Teacher feedback/rating
    teacherFeedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        comment: String,
        approved: Boolean,
        lastReviewedAt: Date,
    },

    // Usage statistics
    usageStats: {
        timesUsed: {
            type: Number,
            default: 0,
        },
        correctAnswerRate: {
            type: Number,
            min: 0,
            max: 100,
        },
        averageTime: Number, // seconds
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'approved', 'rejected', 'archived'],
        default: 'draft',
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
aiQuestionsSchema.index({ school: 1, subject: 1, status: 1 });
aiQuestionsSchema.index({ teacher: 1, createdAt: -1 });
aiQuestionsSchema.index({ quiz: 1 });

const AIQuestions = mongoose.model('aiQuestions', aiQuestionsSchema);

module.exports = AIQuestions;
