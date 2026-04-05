const mongoose = require("mongoose");

// Define the schema for the subject model
const subjectSchema = new mongoose.Schema({
    // Name of the subject, required field
    subName: {
        type: String,
        required: true,
        trim: true,
    },
    // Code of the subject, required field
    subCode: {
        type: String,
        required: true,
        unique: true,
    },
    // Number of sessions for the subject
    sessions: {
        type: String,
    },
    // Reference to the school the subject belongs to
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    
    // Classes taught and their responsible teachers
    // Structure: [{ classId, teacherId }]
    classes: [{
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass',
            required: true,
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'teacher',
            required: true,
        },
    }],

    // List of all teachers teaching this subject (across all classes)
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    }],
}, { timestamps: true });

// Compound unique index: subject code per school
subjectSchema.index({ subCode: 1, school: 1 }, { unique: true });

module.exports = mongoose.model("subject", subjectSchema);
