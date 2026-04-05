const Lecture = require('../models/lectureSchema');
const Subject = require('../models/subjectSchema');
const Sclass = require('../models/sclassSchema');

/**
 * Create a new lecture
 */
const createLecture = async (req, res) => {
    try {
        const { title, description, content, topics, duration, type, subjectId, sclassId } = req.body;
        const { _id: teacherId, school } = req.user; // Assuming user info from auth middleware

        // Validate required fields
        if (!title || !content || !subjectId) {
            return res.status(400).json({ message: 'Title, content, and subject are required' });
        }

        // Create new lecture
        const lecture = new Lecture({
            title,
            description,
            content,
            topics: topics || [],
            duration: duration || 0,
            type: type || 'document',
            subject: subjectId,
            sclass: sclassId,
            teacher: teacherId,
            school: school,
            analysisStatus: 'pending',
        });

        const savedLecture = await lecture.save();
        res.status(201).json({
            message: 'Lecture created successfully',
            lecture: savedLecture,
        });
    } catch (error) {
        console.error('Error creating lecture:', error);
        res.status(500).json({ message: 'Error creating lecture', error: error.message });
    }
};

/**
 * Upload lecture file
 */
const uploadLectureFile = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { title, description, duration, type } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Find or create lecture
        let lecture = await Lecture.findById(lectureId);
        
        if (!lecture) {
            const { subjectId, sclassId } = req.body;
            const { _id: teacherId, school } = req.user;

            lecture = new Lecture({
                title: title || 'Untitled Lecture',
                description: description || '',
                content: '', // Initially empty, will be populated after OCR/parsing
                subject: subjectId,
                sclass: sclassId,
                teacher: teacherId,
                school: school,
                type: type || 'document',
                duration: duration || 0,
                analysisStatus: 'pending',
            });
        }

        // Update file information
        lecture.file = {
            filename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date(),
        };

        lecture.title = title || lecture.title;
        lecture.description = description || lecture.description;
        if (type) lecture.type = type;
        if (duration) lecture.duration = duration;

        const savedLecture = await lecture.save();
        res.status(200).json({
            message: 'Lecture file uploaded successfully',
            lecture: savedLecture,
        });
    } catch (error) {
        console.error('Error uploading lecture file:', error);
        res.status(500).json({ message: 'Error uploading lecture', error: error.message });
    }
};

/**
 * Get all lectures for a teacher/subject/class
 */
const getLectures = async (req, res) => {
    try {
        const { subjectId, sclassId } = req.query;
        const { _id: teacherId, school } = req.user;

        let filter = { teacher: teacherId, school: school };

        if (subjectId) filter.subject = subjectId;
        if (sclassId) filter.sclass = sclassId;

        const lectures = await Lecture.find(filter)
            .populate('subject', 'subName')
            .populate('sclass', 'sclassName')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            message: 'Lectures retrieved successfully',
            lectures,
        });
    } catch (error) {
        console.error('Error getting lectures:', error);
        res.status(500).json({ message: 'Error retrieving lectures', error: error.message });
    }
};

/**
 * Get lecture detail
 */
const getLectureDetail = async (req, res) => {
    try {
        const { lectureId } = req.params;

        const lecture = await Lecture.findById(lectureId)
            .populate('subject', 'subName')
            .populate('sclass', 'sclassName')
            .populate('teacher', 'name');

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        res.status(200).json({
            message: 'Lecture retrieved successfully',
            lecture,
        });
    } catch (error) {
        console.error('Error getting lecture detail:', error);
        res.status(500).json({ message: 'Error retrieving lecture', error: error.message });
    }
};

/**
 * Update lecture
 */
const updateLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { title, description, content, topics, duration, type, aiSummary, keyPoints, difficultyLevel } = req.body;

        const lecture = await Lecture.findById(lectureId);

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        // Update fields
        if (title) lecture.title = title;
        if (description) lecture.description = description;
        if (content) lecture.content = content;
        if (topics) lecture.topics = topics;
        if (duration) lecture.duration = duration;
        if (type) lecture.type = type;
        if (aiSummary) lecture.aiSummary = aiSummary;
        if (keyPoints) lecture.keyPoints = keyPoints;
        if (difficultyLevel) lecture.difficultyLevel = difficultyLevel;
        lecture.updatedAt = new Date();

        const savedLecture = await lecture.save();

        res.status(200).json({
            message: 'Lecture updated successfully',
            lecture: savedLecture,
        });
    } catch (error) {
        console.error('Error updating lecture:', error);
        res.status(500).json({ message: 'Error updating lecture', error: error.message });
    }
};

/**
 * Delete lecture
 */
const deleteLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;

        const removedLecture = await Lecture.findByIdAndDelete(lectureId);

        if (!removedLecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        res.status(200).json({
            message: 'Lecture deleted successfully',
            lecture: removedLecture,
        });
    } catch (error) {
        console.error('Error deleting lecture:', error);
        res.status(500).json({ message: 'Error deleting lecture', error: error.message });
    }
};

/**
 * Update lecture analysis status
 */
const updateLectureAnalysisStatus = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { status, aiSummary, keyPoints, topics } = req.body;

        const lecture = await Lecture.findById(lectureId);

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        lecture.analysisStatus = status;
        if (aiSummary) lecture.aiSummary = aiSummary;
        if (keyPoints) lecture.keyPoints = keyPoints;
        if (topics) lecture.topics = topics;

        const savedLecture = await lecture.save();

        res.status(200).json({
            message: 'Lecture analysis updated',
            lecture: savedLecture,
        });
    } catch (error) {
        console.error('Error updating lecture analysis:', error);
        res.status(500).json({ message: 'Error updating analysis', error: error.message });
    }
};

module.exports = {
    createLecture,
    uploadLectureFile,
    getLectures,
    getLectureDetail,
    updateLecture,
    deleteLecture,
    updateLectureAnalysisStatus,
};
