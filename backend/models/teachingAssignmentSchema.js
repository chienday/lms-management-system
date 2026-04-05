const mongoose = require("mongoose");

/**
 * TeachingAssignment Model
 * Represents the relationship: Teacher → Subject → Multiple Classes
 * Replaces the 1:1:1 relationship with many-to-many flexibility
 */
const teachingAssignmentSchema = new mongoose.Schema({
    // Reference to teacher
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
    // Array of classes taught for this subject
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    }],
    // Reference to school for organization
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    // Status of the assignment (active/inactive)
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    // Start and end dates for the assignment
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
}, { timestamps: true });

// Compound index to prevent duplicate assignments
teachingAssignmentSchema.index({ teacher: 1, subject: 1, school: 1 }, { unique: true });

module.exports = mongoose.model("teachingAssignment", teachingAssignmentSchema);
