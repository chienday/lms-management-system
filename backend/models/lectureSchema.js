const mongoose = require("mongoose");

/**
 * Lecture Schema
 * Stores course materials, lecture transcripts, and related documents
 * Used for AI analysis to generate insights and quiz questions
 */
const lectureSchema = new mongoose.Schema({
    // Reference to subject
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
        index: true,
    },

    // Reference to class
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
        index: true,
    },

    // Reference to teacher who uploaded
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

    // Lecture title
    title: {
        type: String,
        required: true,
        trim: true,
    },

    // Lecture description
    description: {
        type: String,
        default: "",
    },

    // Lecture content/transcript
    content: {
        type: String,
        required: true,
    },

    // File information
    file: {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },

    // Key topics extracted from lecture
    topics: [{
        type: String,
    }],

    // Duration of lecture in minutes
    duration: {
        type: Number,
        default: 0,
    },

    // Lecture type (video, document, presentation, etc.)
    type: {
        type: String,
        enum: ['video', 'document', 'presentation', 'text', 'other'],
        default: 'document',
    },

    // AI-generated summary
    aiSummary: {
        type: String,
        default: "",
    },

    // Key learning points from AI analysis
    keyPoints: [{
        type: String,
    }],

    // Difficulty level (easy, medium, hard)
    difficultyLevel: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },

    // Status of AI analysis
    analysisStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },

    // Timestamp
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
lectureSchema.index({ school: 1, subject: 1, createdAt: -1 });
lectureSchema.index({ teacher: 1, createdAt: -1 });

const Lecture = mongoose.model('lecture', lectureSchema);

module.exports = Lecture;
