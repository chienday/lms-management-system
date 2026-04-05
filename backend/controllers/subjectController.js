const Subject = require("../models/subjectSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Sclass = require("../models/sclassSchema.js");

/**
 * CREATE: Admin creates a new subject
 * POST /Subject/Create
 * Body: { subName, subCode, sessions, classes: [{classId, teacherId}], schoolId }
 */
const createSubject = async (req, res) => {
    try {
        const { subName, subCode, sessions, classes, schoolId } = req.body;

        if (!subName || !subCode || !schoolId) {
            return res.status(400).json({
                message: "subName, subCode, and schoolId are required"
            });
        }

        // Check if subject code already exists for this school
        const existingSubject = await Subject.findOne({
            subCode,
            school: schoolId,
        });

        if (existingSubject) {
            return res.status(400).json({
                message: "Subject with this code already exists for this school"
            });
        }

        // Validate classes and teachers
        let teachers = [];
        const classesData = [];

        if (classes && Array.isArray(classes) && classes.length > 0) {
            for (const classPair of classes) {
                const { classId, teacherId } = classPair;

                // Verify class exists
                const sclass = await Sclass.findById(classId);
                if (!sclass) {
                    return res.status(404).json({
                        message: `Class ${classId} not found`
                    });
                }

                // Verify teacher exists
                const teacher = await Teacher.findById(teacherId);
                if (!teacher) {
                    return res.status(404).json({
                        message: `Teacher ${teacherId} not found`
                    });
                }

                classesData.push({ classId, teacherId });
                if (!teachers.includes(teacherId)) {
                    teachers.push(teacherId);
                }
            }
        }

        // Create subject
        const subject = await Subject.create({
            subName,
            subCode,
            sessions: sessions || '',
            school: schoolId,
            classes: classesData,
            teachers,
        });

        return res.status(201).json({
            message: "Subject created successfully",
            subject: await subject.populate(['classes.teacherId', 'teachers']),
        });
    } catch (error) {
        console.error("Error creating subject:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get all subjects for a school
 * GET /Subject/List/:schoolId
 */
const getSubjects = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const subjects = await Subject.find({ school: schoolId })
            .populate('classes.classId', 'sclassName')
            .populate('classes.teacherId', 'name')
            .populate('teachers', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Subjects retrieved successfully",
            subjects,
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get subjects for a teacher
 * GET /Subject/Teacher/:teacherId
 */
const getTeacherSubjects = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const subjects = await Subject.find({ teachers: teacherId })
            .populate('classes.classId', 'sclassName')
            .populate('classes.teacherId', 'name')
            .select('subName classes');

        // Transform to show only classes this teacher teaches for each subject
        const transformedSubjects = subjects.map(subject => ({
            _id: subject._id,
            subName: subject.subName,
            classes: subject.classes
                .filter(c => c.teacherId._id.toString() === teacherId)
                .map(c => c.classId),
        }));

        return res.status(200).json({
            message: "Teacher subjects retrieved successfully",
            subjects: transformedSubjects,
        });
    } catch (error) {
        console.error("Error fetching teacher subjects:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE: Add a class to existing subject with teacher
 * PUT /Subject/:subjectId/AddClass
 * Body: { classId, teacherId }
 */
const addClassToSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { classId, teacherId } = req.body;

        if (!classId || !teacherId) {
            return res.status(400).json({
                message: "classId and teacherId are required"
            });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Verify class and teacher exist
        const sclass = await Sclass.findById(classId);
        const teacher = await Teacher.findById(teacherId);

        if (!sclass || !teacher) {
            return res.status(404).json({
                message: "Class or teacher not found"
            });
        }

        // Check if class already exists in subject
        const existingClass = subject.classes.find(
            c => c.classId.toString() === classId
        );

        if (existingClass) {
            // Update existing teacher assignment
            existingClass.teacherId = teacherId;
        } else {
            // Add new class
            subject.classes.push({ classId, teacherId });
        }

        // Update teachers list
        if (!subject.teachers.includes(teacherId)) {
            subject.teachers.push(teacherId);
        }

        await subject.save();

        return res.status(200).json({
            message: "Class added to subject successfully",
            subject: await subject.populate(['classes.classId', 'classes.teacherId', 'teachers']),
        });
    } catch (error) {
        console.error("Error adding class to subject:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE: Update teacher for a class in subject
 * PUT /Subject/:subjectId/UpdateTeacher/:classId
 * Body: { teacherId }
 */
const updateTeacherForClass = async (req, res) => {
    try {
        const { subjectId, classId } = req.params;
        const { teacherId } = req.body;

        if (!teacherId) {
            return res.status(400).json({
                message: "teacherId is required"
            });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Verify teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Find and update the class-teacher assignment
        const classAssignment = subject.classes.find(
            c => c.classId.toString() === classId
        );

        if (!classAssignment) {
            return res.status(404).json({
                message: "Class not found in subject"
            });
        }

        classAssignment.teacherId = teacherId;

        // Update teachers list if needed
        if (!subject.teachers.includes(teacherId)) {
            subject.teachers.push(teacherId);
        }

        await subject.save();

        return res.status(200).json({
            message: "Teacher updated successfully",
            subject: await subject.populate(['classes.classId', 'classes.teacherId', 'teachers']),
        });
    } catch (error) {
        console.error("Error updating teacher:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE: Remove class from subject
 * PUT /Subject/:subjectId/RemoveClass/:classId
 */
const removeClassFromSubject = async (req, res) => {
    try {
        const { subjectId, classId } = req.params;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Find and remove the class
        const initialLength = subject.classes.length;
        subject.classes = subject.classes.filter(
            c => c.classId.toString() !== classId
        );

        if (subject.classes.length === initialLength) {
            return res.status(404).json({
                message: "Class not found in subject"
            });
        }

        await subject.save();

        return res.status(200).json({
            message: "Class removed from subject successfully",
            subject: await subject.populate(['classes.classId', 'classes.teacherId', 'teachers']),
        });
    } catch (error) {
        console.error("Error removing class:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE: Update subject details (name, code, sessions)
 * PUT /Subject/:subjectId
 * Body: { subName, subCode, sessions, schoolId }
 */
const updateSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { subName, subCode, sessions, schoolId } = req.body;

        if (!subName || !subCode) {
            return res.status(400).json({
                message: "subName and subCode are required"
            });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Check if new code is unique for this school (if code is being changed)
        if (subCode !== subject.subCode) {
            const existingSubject = await Subject.findOne({
                subCode,
                school: schoolId,
                _id: { $ne: subjectId }
            });

            if (existingSubject) {
                return res.status(400).json({
                    message: "Subject with this code already exists for this school"
                });
            }
        }

        // Update subject fields
        subject.subName = subName;
        subject.subCode = subCode;
        if (sessions !== undefined && sessions !== null) {
            subject.sessions = sessions;
        }

        await subject.save();

        return res.status(200).json({
            message: "Subject updated successfully",
            subject: await subject.populate(['classes.classId', 'classes.teacherId', 'teachers']),
        });
    } catch (error) {
        console.error("Error updating subject:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE: Delete subject
 * DELETE /Subject/:subjectId
 */
const deleteSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const subject = await Subject.findByIdAndDelete(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        return res.status(200).json({
            message: "Subject deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    getTeacherSubjects,
    addClassToSubject,
    updateTeacherForClass,
    updateSubject,
    removeClassFromSubject,
    deleteSubject,
};
