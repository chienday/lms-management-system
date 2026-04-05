const AIInsights = require('../models/aiInsightsSchema');
const Student = require('../models/studentSchema');
const Assignment = require('../models/assignmentSchema');
const Quiz = require('../models/quizSchema');
const QuizAttempt = require('../models/quizAttemptSchema');
const Sclass = require('../models/sclassSchema');

/**
 * Generate AI insights for a class/subject
 */
const generateAIInsights = async (req, res) => {
    try {
        const { subjectId, sclassId } = req.body;
        const { _id: teacherId, school } = req.user;

        // Validate inputs
        if (!subjectId || !sclassId) {
            return res.status(400).json({ message: 'Subject and class are required' });
        }

        // Fetch class data
        const sclass = await Sclass.findById(sclassId);
        if (!sclass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Fetch students in class
        const students = await Student.find({ sclass: sclassId });
        const studentIds = students.map(s => s._id);

        // Fetch student performance data
        const assignments = await Assignment.find({ 
            sclass: sclassId, 
            subject: subjectId 
        }).select('submissions');

        const quizAttempts = await QuizAttempt.find({
            student: { $in: studentIds }
        }).select('score totalQuestions student');

        // Calculate insights
        const insights = await calculateInsights(students, assignments, quizAttempts);

        // Save insights
        const aiInsight = new AIInsights({
            sclass: sclassId,
            subject: subjectId,
            teacher: teacherId,
            school: school,
            insightType: 'overall',
            insights: insights,
            dataSource: {
                lecturesAnalyzed: 0,
                quizzesTaken: quizAttempts.length,
                assignmentsSubmitted: assignments.length,
                attendanceRecords: 0,
            },
            confidenceScore: 85,
            status: 'completed',
            analysisPeriod: {
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                endDate: new Date(),
            },
        });

        const savedInsight = await aiInsight.save();

        res.status(201).json({
            message: 'AI insights generated successfully',
            insights: savedInsight,
        });
    } catch (error) {
        console.error('Error generating AI insights:', error);
        res.status(500).json({ message: 'Error generating insights', error: error.message });
    }
};

/**
 * Get AI insights for class/subject
 */
const getAIInsights = async (req, res) => {
    try {
        const { subjectId, sclassId, insightType } = req.query;
        const { _id: teacherId, school } = req.user;

        let filter = { teacher: teacherId, school: school };

        if (subjectId) filter.subject = subjectId;
        if (sclassId) filter.sclass = sclassId;
        if (insightType) filter.insightType = insightType;

        const insights = await AIInsights.find(filter)
            .populate('subject', 'subName')
            .populate('sclass', 'sclassName')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            message: 'AI insights retrieved successfully',
            insights,
        });
    } catch (error) {
        console.error('Error getting insights:', error);
        res.status(500).json({ message: 'Error retrieving insights', error: error.message });
    }
};

/**
 * Get detailed analytics for at-risk students
 */
const getAtRiskStudents = async (req, res) => {
    try {
        const { sclassId, subjectId } = req.query;
        const { _id: teacherId, school } = req.user;

        // Find latest insights
        const insight = await AIInsights.findOne({
            teacher: teacherId,
            school: school,
            sclass: sclassId,
            subject: subjectId,
        }).sort({ createdAt: -1 });

        if (!insight) {
            return res.status(404).json({ message: 'No insights found' });
        }

        const atRiskStudents = insight.insights.atRiskStudents || [];

        res.status(200).json({
            message: 'At-risk students retrieved',
            students: atRiskStudents,
            total: atRiskStudents.length,
        });
    } catch (error) {
        console.error('Error getting at-risk students:', error);
        res.status(500).json({ message: 'Error retrieving at-risk students', error: error.message });
    }
};

/**
 * Get weak topics for class
 */
const getWeakTopics = async (req, res) => {
    try {
        const { sclassId, subjectId } = req.query;
        const { _id: teacherId, school } = req.user;

        // Find latest insights
        const insight = await AIInsights.findOne({
            teacher: teacherId,
            school: school,
            sclass: sclassId,
            subject: subjectId,
        }).sort({ createdAt: -1 });

        if (!insight) {
            return res.status(404).json({ message: 'No insights found' });
        }

        const weakTopics = insight.insights.weakTopics || [];
        const strongTopics = insight.insights.strongTopics || [];

        res.status(200).json({
            message: 'Topics analytics retrieved',
            weakTopics,
            strongTopics,
        });
    } catch (error) {
        console.error('Error getting topics:', error);
        res.status(500).json({ message: 'Error retrieving topics', error: error.message });
    }
};

/**
 * Get class performance statistics
 */
const getClassStats = async (req, res) => {
    try {
        const { sclassId, subjectId } = req.query;
        const { _id: teacherId, school } = req.user;

        // Find latest insights
        const insight = await AIInsights.findOne({
            teacher: teacherId,
            school: school,
            sclass: sclassId,
            subject: subjectId,
        }).sort({ createdAt: -1 });

        if (!insight) {
            return res.status(404).json({ message: 'No insights found' });
        }

        const stats = {
            classStats: insight.insights.classStats || {},
            gradeDistribution: insight.insights.gradeDistribution || {},
            attendanceInsights: insight.insights.attendanceInsights || {},
            recommendations: insight.insights.recommendations || [],
        };

        res.status(200).json({
            message: 'Class statistics retrieved',
            stats,
        });
    } catch (error) {
        console.error('Error getting class stats:', error);
        res.status(500).json({ message: 'Error retrieving statistics', error: error.message });
    }
};

/**
 * Get learning recommendations
 */
const getLearningRecommendations = async (req, res) => {
    try {
        const { sclassId, subjectId } = req.query;
        const { _id: teacherId, school } = req.user;

        // Find latest insights
        const insight = await AIInsights.findOne({
            teacher: teacherId,
            school: school,
            sclass: sclassId,
            subject: subjectId,
        }).sort({ createdAt: -1 });

        if (!insight) {
            return res.status(404).json({ message: 'No insights found' });
        }

        const recommendations = insight.insights.recommendations || [];

        res.status(200).json({
            message: 'Recommendations retrieved',
            recommendations,
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ message: 'Error retrieving recommendations', error: error.message });
    }
};

/**
 * Helper function to calculate insights
 */
const calculateInsights = async (students, assignments, quizAttempts) => {
    const totalStudents = students.length;
    
    // Calculate average grades
    const grades = students
        .map(s => s.examinationResult && s.examinationResult[0]?.marks)
        .filter(g => g !== undefined);
    
    const averageGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
    const passRate = grades.filter(g => g >= 5).length / grades.length * 100 || 0;

    // Identify at-risk students
    const atRiskStudents = students
        .filter(s => s.examinationResult && s.examinationResult[0]?.marks < 5)
        .map(s => ({
            studentId: s._id,
            studentName: s.name,
            riskLevel: s.examinationResult[0]?.marks < 3 ? 'high' : 'medium',
            reason: 'Low academic performance',
            currentGrade: s.examinationResult[0]?.marks || 0,
            recentPerformance: [],
            attendanceRate: 80,
        }));

    // Grade distribution
    const gradeDistribution = {
        excellent: grades.filter(g => g >= 9).length,
        good: grades.filter(g => g >= 7 && g < 9).length,
        average: grades.filter(g => g >= 5 && g < 7).length,
        poor: grades.filter(g => g < 5).length,
    };

    // Class statistics
    const classStats = {
        totalStudents,
        averageGrade: Math.round(averageGrade * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        attendanceRate: 85,
    };

    return {
        classStats,
        atRiskStudents,
        gradeDistribution,
        weakTopics: [
            { topic: 'Sample Topic 1', difficulty: 7, studentCount: 12, suggestedRevision: 'Review key concepts' },
        ],
        strongTopics: [
            { topic: 'Sample Strong Topic', masteryLevel: 8, studentCount: 20 },
        ],
        attendanceInsights: {
            overallRate: 85,
            chronicallyAbsent: [],
            pattern: 'Consistent attendance pattern',
        },
        recommendations: [
            'Focus on weak areas identified in analysis',
            'Provide additional support to at-risk students',
            'Review assessment methods',
        ],
    };
};

module.exports = {
    generateAIInsights,
    getAIInsights,
    getAtRiskStudents,
    getWeakTopics,
    getClassStats,
    getLearningRecommendations,
};
