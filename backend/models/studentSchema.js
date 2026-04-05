const mongoose = require('mongoose');

// Define the schema for the student model
const studentSchema = new mongoose.Schema({
    // Name of the student, required field
    name: {
        type: String,
        required: true
    },
    // Roll number of the student, required field
    rollNum: {
        type: Number,
        required: true
    },
    // Email of the student
    email: {
        type: String,
        default: ''
    },
    // Password of the student, required field
    password: {
        type: String,
        required: true
    },
    // Reference to the class the student belongs to, required field
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    // Reference to the school the student belongs to, required field
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    // Role of the student, defaults to "Student"
    role: {
        type: String,
        default: "Student"
    },
    // Account status: 'Active' or 'Locked'
    accountStatus: {
        type: String,
        enum: ['Active', 'Locked'],
        default: 'Active'
    },
    // Array of exam results for the student
    examResult: [
        {
            // Reference to the subject for which the result is recorded
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            // Marks obtained by the student in the subject, defaults to 0
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],

    // Last AI learning analysis result for this student
    learningAnalysis: {
        riskLevel: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
        },
        learningBehavior: [{
            type: String,
        }],
        analysis: {
            type: String,
        },
        recommendations: [{
            type: String,
        }],
        avgScore: {
            type: Number,
        },
        // date/time when this analysis was generated
        analyzedAt: {
            type: Date,
        },
    }
});

module.exports = mongoose.model("student", studentSchema);
