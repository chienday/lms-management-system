/**
 * Quiz Suggestion Helper
 * Generates smart quiz recommendations based on student performance and subject
 */

const Quiz = require("../models/quizSchema.js");
const QuizAttempt = require("../models/quizAttemptSchema.js");

/**
 * Get student's quiz performance metrics
 * Returns: {
 *   attemptedQuizzes: count,
 *   averageScore: number,
 *   passRate: number,
 *   weakTopics: [array],
 *   suggestedDifficulty: 'easy' | 'medium' | 'hard'
 * }
 */
const getStudentQuizPerformance = async (studentId, subjectId) => {
    try {
        const attempts = await QuizAttempt.find({
            student: studentId,
            subject: subjectId,
            status: 'completed'
        })
            .sort({ completedAt: -1 })
            .limit(20);  // Last 20 attempts

        if (attempts.length === 0) {
            return {
                attemptedQuizzes: 0,
                averageScore: 0,
                passRate: 0,
                weakTopics: [],
                suggestedDifficulty: 'easy',  // Start with easy for beginners
                allAttempts: [],
            };
        }

        // Calculate metrics
        const totalScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
        const averageScore = totalScore / attempts.length;
        const passCount = attempts.filter(a => a.isPassed).length;
        const passRate = (passCount / attempts.length) * 100;

        // Determine suggested difficulty based on average score
        let suggestedDifficulty = 'medium';
        if (averageScore < 50) {
            suggestedDifficulty = 'easy';  // Struggling - recommend easier quizzes
        } else if (averageScore >= 80) {
            suggestedDifficulty = 'hard';  // Excelling - recommend harder quizzes
        }

        return {
            attemptedQuizzes: attempts.length,
            averageScore: Math.round(averageScore),
            passRate: Math.round(passRate),
            suggestedDifficulty,
            allAttempts: attempts.slice(0, 5),  // Last 5 for UI display
        };
    } catch (error) {
        console.error("Error getting student quiz performance:", error);
        return {
            attemptedQuizzes: 0,
            averageScore: 0,
            passRate: 0,
            suggestedDifficulty: 'medium',
            allAttempts: [],
        };
    }
};

/**
 * Extract keywords from a chat message/question
 * Used to find topically similar quizzes
 */
const extractTopics = (text) => {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase()
        .split(/[^\w]+/)
        .filter(w => w.length > 3)
        .slice(0, 5);  // Top 5 keywords

    return words;
};

/**
 * Find quiz suggestions based on subject, topics, and difficulty
 * Returns array of recommended quizzes with scoring
 */
const suggestQuizzes = async (studentId, subjectId, chatMessage) => {
    try {
        // Get student's performance in this subject
        const performance = await getStudentQuizPerformance(studentId, subjectId);

        // Extract topics from the chat message
        const topics = extractTopics(chatMessage);

        // Query: Find quizzes that match criteria
        let query = {
            subject: subjectId,
            status: 'published',
        };

        // If student is struggling, suggest easier quizzes
        // If excelling, suggest harder quizzes
        if (performance.suggestedDifficulty === 'easy') {
            query.averageDifficulty = { $in: ['easy'] };
        } else if (performance.suggestedDifficulty === 'hard') {
            query.averageDifficulty = { $in: ['hard'] };
        } else {
            query.averageDifficulty = { $in: ['medium', 'hard'] };
        }

        // Find quizzes
        let quizzes = await Quiz.find(query)
            .select('_id title description averageDifficulty statistics topics')
            .limit(10);

        // Score quizzes based on topic relevance
        const scoredQuizzes = quizzes.map(quiz => {
            let score = 5;  // Base score

            // Bonus for topic match
            if (quiz.topics && Array.isArray(quiz.topics)) {
                const matches = topics.filter(t => 
                    quiz.topics.some(qt => qt.toLowerCase().includes(t))
                );
                score += matches.length * 2;
            }

            // Bonus for popularity/high average score
            if (quiz.statistics && quiz.statistics.averageScore > 75) {
                score += 1;
            }

            return {
                ...quiz.toObject(),
                relevanceScore: score,
            };
        });

        // Sort by relevance and return top 3
        const recommendations = scoredQuizzes
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 3)
            .map(quiz => ({
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                difficulty: quiz.averageDifficulty,
                averageScore: quiz.statistics?.averageScore || 0,
                attemptCount: quiz.statistics?.attemptCount || 0,
            }));

        return {
            suggestions: recommendations,
            performance,
        };
    } catch (error) {
        console.error("Error suggesting quizzes:", error);
        return {
            suggestions: [],
            performance: {
                attemptedQuizzes: 0,
                averageScore: 0,
                passRate: 0,
                suggestedDifficulty: 'medium',
            },
        };
    }
};

/**
 * Get student's recent quiz attempts
 * For displaying in UI
 */
const getRecentQuizAttempts = async (studentId, subjectId, limit = 5) => {
    try {
        const attempts = await QuizAttempt.find({
            student: studentId,
            subject: subjectId,
            status: 'completed',
        })
            .populate('quiz', 'title averageDifficulty')
            .sort({ completedAt: -1 })
            .limit(limit);

        return attempts.map(attempt => ({
            quizTitle: attempt.quiz?.title,
            score: attempt.percentage,
            passed: attempt.isPassed,
            completedAt: attempt.completedAt,
            difficulty: attempt.quiz?.averageDifficulty,
        }));
    } catch (error) {
        console.error("Error getting recent quiz attempts:", error);
        return [];
    }
};

/**
 * Get quiz by ID with statistics
 */
const getQuizWithStats = async (quizId) => {
    try {
        const quiz = await Quiz.findById(quizId)
            .select('title description questions averageDifficulty timeLimit statistics')
            .populate('subject', 'subName');

        if (!quiz) return null;

        return {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            questionCount: quiz.questions.length,
            difficulty: quiz.averageDifficulty,
            timeLimit: quiz.timeLimit,
            subject: quiz.subject?.subName,
            statistics: quiz.statistics,
        };
    } catch (error) {
        console.error("Error getting quiz with stats:", error);
        return null;
    }
};

module.exports = {
    getStudentQuizPerformance,
    extractTopics,
    suggestQuizzes,
    getRecentQuizAttempts,
    getQuizWithStats,
};
