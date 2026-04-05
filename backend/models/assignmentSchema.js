const mongoose = require("mongoose");

/**
 * Assignment Model
 * Represents assignments created by teachers for one or more classes
 */
const assignmentSchema = new mongoose.Schema({
    // Reference to teacher who created the assignment
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },
    // Reference to subject
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
    },
    // Array of classes this assignment is assigned to
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    }],
    // Reference to school
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    // Title of the assignment
    title: {
        type: String,
        required: true,
        trim: true,
    },
    // Description/instructions
    description: {
        type: String,
        trim: true,
    },
    // File details (stored file path/URL from storage)
    assignmentFile: {
        fileName: String,
        fileUrl: String,
        uploadedAt: Date,
        size: Number, // in bytes
    },
    // Start date
    startDate: {
        type: Date,
    },
    // Due date for submission
    dueDate: {
        type: Date,
        required: true,
    },
    // Total marks for the assignment
    totalMarks: {
        type: Number,
        default: 100,
    },
    // Assignment type (essay, multiple-choice, file-upload, project)
    assignmentType: {
        type: String,
        enum: ['essay', 'multiple-choice', 'file-upload', 'project', 'coding'],
        default: 'file-upload',
    },
    // Publish status
    published: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Index for querying assignments by teacher
assignmentSchema.index({ teacher: 1, school: 1 });

// Index for querying assignments by subject
assignmentSchema.index({ subject: 1, school: 1 });

module.exports = mongoose.model("assignment", assignmentSchema);
