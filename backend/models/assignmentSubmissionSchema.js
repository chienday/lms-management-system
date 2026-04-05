const mongoose = require("mongoose");

/**
 * AssignmentSubmission Model
 * Represents student submissions for assignments
 */
const assignmentSubmissionSchema = new mongoose.Schema({
    // Reference to assignment
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignment',
        required: true,
    },
    // Reference to student who submitted
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    // Reference to teacher for grading
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
    // Reference to subject
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
    },
    // Reference to class
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    // Reference to school
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    // Submission file details
    submissionFile: {
        fileName: String,
        fileUrl: String,
        uploadedAt: Date,
        size: Number,
    },
    // Status of submission (submitted/late/pending/graded)
    status: {
        type: String,
        enum: ['pending', 'submitted', 'late', 'graded'],
        default: 'pending',
    },
    // Marks obtained
    marksObtained: {
        type: Number,
        default: 0,
    },
    // Feedback from teacher
    feedback: {
        type: String,
        trim: true,
    },
    // Submission timestamp
    submittedAt: {
        type: Date,
    },
    // Whether submission is late
    isLate: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Compound index to ensure one submission per student per assignment
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("assignmentSubmission", assignmentSubmissionSchema);
