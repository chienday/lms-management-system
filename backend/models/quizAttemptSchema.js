const mongoose = require("mongoose");

/**
 * Quiz Attempt Model
 * Tracks individual student quiz attempts and scores
 */
const quizAttemptSchema = new mongoose.Schema({
    // Reference to the quiz
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quiz',
        required: true,
        index: true,
    },

    // Reference to the student
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
        index: true,
    },

    // Reference to subject for quick access
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
        index: true,
    },

    // Reference to school
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },

    // Student's answers
    answers: [{
        questionIndex: Number,
        selectedOption: String,  // A, B, C, D
        isCorrect: Boolean,
        timeSpent: Number,  // Time spent on this question in seconds
    }],

    // Score obtained
    score: {
        type: Number,
        required: true,
    },

    // Total possible score
    totalScore: {
        type: Number,
        required: true,
    },

    // Percentage score
    percentage: {
        type: Number,
        required: true,
    },

    // Whether quiz was passed
    isPassed: {
        type: Boolean,
        required: true,
    },

    // Time taken (in seconds)
    timeTaken: {
        type: Number,
        required: true,
    },

    // Attempt number (1st attempt, 2nd attempt, etc.)
    attemptNumber: {
        type: Number,
        default: 1,
    },

    // Status: in_progress, completed, abandoned
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'completed',
    },

    // When attempt started
    startedAt: {
        type: Date,
        required: true,
    },

    // When attempt was completed
    completedAt: {
        type: Date,
        required: true,
    },

    // Feedback/review comments from teacher
    teacherFeedback: {
        type: String,
        default: "",
    },

    // Timestamps
}, { timestamps: true });

// Indexes for efficient querying
quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ student: 1, subject: 1 });
quizAttemptSchema.index({ quiz: 1, completedAt: -1 });
quizAttemptSchema.index({ student: 1, completedAt: -1 });

module.exports = mongoose.model("quizAttempt", quizAttemptSchema);
