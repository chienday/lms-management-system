const mongoose = require("mongoose");

/**
 * AI Insights Schema
 * Stores AI-generated analysis of student learning patterns,
 * class performance, and weak areas
 */
const aiInsightsSchema = new mongoose.Schema({
    // Reference to class
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
        index: true,
    },

    // Reference to subject
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
        index: true,
    },

    // Reference to teacher
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

    // Insight type
    insightType: {
        type: String,
        enum: ['performance', 'attendance', 'weak_areas', 'student_risk', 'topic_difficulty', 'overall'],
        required: true,
    },

    // Detailed insights
    insights: {
        // Overall class statistics
        classStats: {
            totalStudents: Number,
            averageGrade: Number,
            passRate: Number,
            attendanceRate: Number,
        },

        // Students at risk
        atRiskStudents: [{
            studentId: mongoose.Schema.Types.ObjectId,
            studentName: String,
            riskLevel: {
                type: String,
                enum: ['low', 'medium', 'high'],
            },
            reason: String,
            currentGrade: Number,
            recentPerformance: [Number],
            attendanceRate: Number,
        }],

        // Grade distribution
        gradeDistribution: {
            excellent: Number,  // 9-10
            good: Number,       // 7-8.99
            average: Number,    // 5-6.99
            poor: Number,       // <5
        },

        // Weak topics/areas
        weakTopics: [{
            topic: String,
            difficulty: Number, // 1-10 scale
            studentCount: Number,
            suggestedRevision: String,
        }],

        // Strong topics
        strongTopics: [{
            topic: String,
            masteryLevel: Number, // 1-10 scale
            studentCount: Number,
        }],

        // Attendance patterns
        attendanceInsights: {
            overallRate: Number,
            chronicallyAbsent: [mongoose.Schema.Types.ObjectId],
            pattern: String, // e.g., "morning classes have 15% lower attendance"
        },

        // Learning recommendations
        recommendations: [{
            type: String,
        }],
    },

    // Source data used for analysis
    dataSource: {
        lecturesAnalyzed: Number,
        quizzesTaken: Number,
        assignmentsSubmitted: Number,
        attendanceRecords: Number,
    },

    // Confidence score of AI analysis (0-100)
    confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },

    // Raw AI response (for debugging)
    rawAnalysis: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },

    // Status
    status: {
        type: String,
        enum: ['completed', 'failed'],
        default: 'completed',
    },

    // Analysis period
    analysisPeriod: {
        startDate: Date,
        endDate: Date,
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
aiInsightsSchema.index({ school: 1, sclass: 1, subject: 1, createdAt: -1 });
aiInsightsSchema.index({ teacher: 1, createdAt: -1 });

const AIInsights = mongoose.model('aiInsights', aiInsightsSchema);

module.exports = AIInsights;
