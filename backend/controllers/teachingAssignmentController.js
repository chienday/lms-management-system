const TeachingAssignment = require("../models/teachingAssignmentSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Subject = require("../models/subjectSchema.js");
const Sclass = require("../models/sclassSchema.js");

/**
 * CREATE: Admin assigns teacher to subject with multiple classes
 * POST /TeachingAssignment/Create
 * Body: { teacherId, subjectId, classIds: [], schoolId }
 */
const createTeachingAssignment = async (req, res) => {
    try {
        const { teacherId, subjectId, classIds, schoolId } = req.body;

        if (!teacherId || !subjectId || !classIds || classIds.length === 0 || !schoolId) {
            return res.status(400).json({
                message: "teacherId, subjectId, classIds (array), and schoolId are required"
            });
        }

        // Verify teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Verify subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Verify all classes exist
        const classes = await Sclass.find({ _id: { $in: classIds } });
        if (classes.length !== classIds.length) {
            return res.status(404).json({ message: "Some classes not found" });
        }

        // Check if assignment already exists
        const existing = await TeachingAssignment.findOne({
            teacher: teacherId,
            subject: subjectId,
            school: schoolId,
        });

        if (existing) {
            // Update existing assignment with new classes
            // First, remove old class entries for this teacher+subject
            await Subject.updateOne(
                { _id: subjectId },
                { 
                    $pull: { 
                        classes: { teacherId: teacherId }
                    }
                }
            );

            // Now add new class entries
            for (const classId of classIds) {
                await Subject.updateOne(
                    { _id: subjectId },
                    {
                        $addToSet: {
                            classes: { classId: classId, teacherId: teacherId }
                        }
                    }
                );
            }

            existing.classes = classIds;
            existing.status = 'active';
            await existing.save();
            // Populate the data before returning
            const populatedAssignment = await TeachingAssignment.findById(existing._id)
                .populate('teacher', 'name email')
                .populate('subject', 'subName subCode')
                .populate('classes', 'sclassName');
            return res.status(200).json({
                message: "Teaching assignment updated successfully",
                assignment: populatedAssignment,
            });
        }

        // Create new teaching assignment
        const assignment = await TeachingAssignment.create({
            teacher: teacherId,
            subject: subjectId,
            classes: classIds,
            school: schoolId,
            status: 'active',
        });

        // Update Subject: Add teacher to teachers array and add classes
        // Add teacher to teachers list (if not already there)
        await Subject.updateOne(
            { _id: subjectId },
            { $addToSet: { teachers: teacherId } }
        );

        // Add each class-teacher pair
        for (const classId of classIds) {
            await Subject.updateOne(
                { _id: subjectId },
                {
                    $addToSet: {
                        classes: { classId: classId, teacherId: teacherId }
                    }
                }
            );
        }

        // Populate the data before returning
        const populatedAssignment = await TeachingAssignment.findById(assignment._id)
            .populate('teacher', 'name email')
            .populate('subject', 'subName subCode')
            .populate('classes', 'sclassName');

        return res.status(201).json({
            message: "Teaching assignment created successfully",
            assignment: populatedAssignment,
        });
    } catch (error) {
        console.error("Error creating teaching assignment:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get all teaching assignments for a teacher
 * GET /TeachingAssignment/Teacher/:teacherId
 */
const getTeacherAssignments = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const assignments = await TeachingAssignment.find({ teacher: teacherId, status: 'active' })
            .populate('teacher', 'name email')
            .populate('subject', 'subName subCode')
            .populate('classes', 'sclassName');

        if (!assignments || assignments.length === 0) {
            return res.status(200).json({
                message: "No teaching assignments found",
                assignments: [],
            });
        }

        return res.status(200).json({
            message: "Teaching assignments retrieved successfully",
            assignments,
        });
    } catch (error) {
        console.error("Error fetching teaching assignments:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get classes for a teacher in a specific subject
 * GET /TeachingAssignment/Classes/:teacherId/:subjectId
 */
const getTeacherClassesBySubject = async (req, res) => {
    try {
        const { teacherId, subjectId } = req.params;

        const assignment = await TeachingAssignment.findOne({
            teacher: teacherId,
            subject: subjectId,
            status: 'active',
        }).populate('classes', 'sclassName');

        if (!assignment) {
            return res.status(404).json({
                message: "No classes found for this teacher in this subject",
                classes: [],
            });
        }

        return res.status(200).json({
            message: "Classes retrieved successfully",
            classes: assignment.classes,
        });
    } catch (error) {
        console.error("Error fetching teacher classes:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE: Update teaching assignment (add/remove classes)
 * PUT /TeachingAssignment/Update/:assignmentId
 * Body: { classIds: [] }
 */
const updateTeachingAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { classIds } = req.body;

        if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
            return res.status(400).json({ message: "classIds (array) is required" });
        }

        // Verify all classes exist
        const classes = await Sclass.find({ _id: { $in: classIds } });
        if (classes.length !== classIds.length) {
            return res.status(404).json({ message: "Some classes not found" });
        }

        // Get current assignment to know teacher and subject
        const currentAssignment = await TeachingAssignment.findById(assignmentId);
        if (!currentAssignment) {
            return res.status(404).json({ message: "Teaching assignment not found" });
        }

        // Update Subject: Remove old classes for this teacher then add new ones
        await Subject.updateOne(
            { _id: currentAssignment.subject },
            { 
                $pull: { 
                    classes: { teacherId: currentAssignment.teacher }
                }
            }
        );

        // Add new class entries
        for (const classId of classIds) {
            await Subject.updateOne(
                { _id: currentAssignment.subject },
                {
                    $addToSet: {
                        classes: { classId: classId, teacherId: currentAssignment.teacher }
                    }
                }
            );
        }

        const assignment = await TeachingAssignment.findByIdAndUpdate(
            assignmentId,
            { classes: classIds },
            { new: true }
        )
            .populate('teacher', 'name email')
            .populate('subject', 'subName subCode')
            .populate('classes', 'sclassName');

        return res.status(200).json({
            message: "Teaching assignment updated successfully",
            assignment,
        });
    } catch (error) {
        console.error("Error updating teaching assignment:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE: Deactivate teaching assignment
 * DELETE /TeachingAssignment/:assignmentId
 */
const deleteTeachingAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Get assignment first to know teacher and subject
        const assignment = await TeachingAssignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Teaching assignment not found" });
        }

        // Remove classes for this teacher from Subject
        await Subject.updateOne(
            { _id: assignment.subject },
            { 
                $pull: { 
                    classes: { teacherId: assignment.teacher }
                }
            }
        );

        // Check if teacher still has other assignments for this subject
        const otherAssignments = await TeachingAssignment.findOne({
            teacher: assignment.teacher,
            subject: assignment.subject,
            _id: { $ne: assignmentId },
            status: 'active'
        });

        // If no other assignments, remove teacher from Subject.teachers
        if (!otherAssignments) {
            await Subject.updateOne(
                { _id: assignment.subject },
                {
                    $pull: { teachers: assignment.teacher }
                }
            );
        }

        const updatedAssignment = await TeachingAssignment.findByIdAndUpdate(
            assignmentId,
            { status: 'inactive' },
            { new: true }
        );

        return res.status(200).json({
            message: "Teaching assignment deleted successfully",
            assignment: updatedAssignment,
        });
    } catch (error) {
        console.error("Error deleting teaching assignment:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get all teaching assignments (Admin view)
 * GET /TeachingAssignment/All/:schoolId
 */
const getAllTeachingAssignments = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const assignments = await TeachingAssignment.find({
            school: schoolId,
            status: 'active',
        })
            .populate('teacher', 'name email')
            .populate('subject', 'subName subCode')
            .populate('classes', 'sclassName');

        return res.status(200).json({
            message: "All teaching assignments retrieved successfully",
            assignments,
        });
    } catch (error) {
        console.error("Error fetching all teaching assignments:", error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTeachingAssignment,
    getTeacherAssignments,
    getTeacherClassesBySubject,
    updateTeachingAssignment,
    deleteTeachingAssignment,
    getAllTeachingAssignments,
};
