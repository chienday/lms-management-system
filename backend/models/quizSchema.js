const mongoose = require("mongoose");

/**
 * Quiz Model
 * Stores quiz questions and metadata for student assessments
 * Linked to subjects and can be auto-generated or manually created
 */
const quizSchema = new mongoose.Schema({
    // Reference to subject this quiz belongs to
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
        index: true,
    },
    
    // Reference to class (optional, can be used by multiple classes)
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    },

    // Reference to teacher who created/assigned this quiz
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },

    // Reference to school for organization
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
        index: true,
    },

    // Quiz title
    title: {
        type: String,
        required: true,
        trim: true,
    },

    // Quiz description
    description: {
        type: String,
        default: "",
    },

    // Array of quiz questions
    questions: [{
        questionText: {
            type: String,
            required: true,
        },
        // Difficulty level: 'easy', 'medium', 'hard'
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        options: [{
            label: String, // A, B, C, D
            text: String,  // Option text
        }],
        correctOption: {
            type: String,  // A, B, C, D
            required: true,
        },
        // Explanation for the correct answer
        explanation: {
            type: String,
            default: "",
        },
    }],

    // Quiz difficulty level (computed from question difficulties)
    averageDifficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },

    // Time limit in minutes
    timeLimit: {
        type: Number,
        default: 30,
    },

    // Passing score percentage (0-100)
    passingScore: {
        type: Number,
        default: 60,
    },

    // Status: draft, published, archived
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },

    // Whether this is an AI-generated quiz
    isAIGenerated: {
        type: Boolean,
        default: false,
    },

    // Reference to lecture content if generated from lecture
    sourceReference: {
        lectureId: mongoose.Schema.Types.ObjectId,
        lectureName: String,
        lectureDate: Date,
    },

    // Keywords/topics covered in this quiz
    topics: [{
        type: String,
    }],

    // Statistics
    statistics: {
        // Number of students who attempted
        attemptCount: {
            type: Number,
            default: 0,
        },
        // Average score across all attempts
        averageScore: {
            type: Number,
            default: 0,
        },
        // Pass rate percentage
        passRate: {
            type: Number,
            default: 0,
        },
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    publishedAt: {
        type: Date,
    },
}, { timestamps: true });

// Indexes for efficient querying
quizSchema.index({ subject: 1, status: 1 });
quizSchema.index({ subject: 1, averageDifficulty: 1 });
quizSchema.index({ teacher: 1, createdAt: -1 });
quizSchema.index({ topics: 1 });

module.exports = mongoose.model("quiz", quizSchema);
