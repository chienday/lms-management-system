const Assignment = require("../models/assignmentSchema.js");
const AssignmentSubmission = require("../models/assignmentSubmissionSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Student = require("../models/studentSchema.js");
const Subject = require("../models/subjectSchema.js");
const Sclass = require("../models/sclassSchema.js");

/**
 * CREATE: Teacher creates assignment for one or multiple classes
 * POST /Assignment/Create
 * Body: { teacherId, subjectId, classIds: [classId1, classId2...], title, description, startDate, dueDate, totalMarks, assignmentType, schoolId }
 * File: assignmentFile
 * assignmentType: 'essay' | 'multiple-choice' | 'file-upload' | 'project' | 'coding'
 */
const createAssignment = async (req, res) => {
    try {
        let { teacherId, subjectId, classIds, title, description, startDate, dueDate, totalMarks, assignmentType, schoolId } = req.body;

        // Parse classIds if it's a JSON string (from FormData)
        if (typeof classIds === 'string') {
            try {
                classIds = JSON.parse(classIds);
            } catch (e) {
                return res.status(400).json({
                    message: "classIds must be a valid JSON array"
                });
            }
        }

        // Validation
        if (!teacherId || !subjectId || !classIds || !Array.isArray(classIds) || classIds.length === 0 || !title || !dueDate || !schoolId) {
            return res.status(400).json({
                message: "teacherId, subjectId, classIds (array with at least 1 class), title, dueDate, and schoolId are required"
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

        console.log("🔍 SUBJECT VERIFICATION DEBUG:");
        console.log("   subjectId:", subjectId);
        console.log("   subject.classes:", subject.classes);
        console.log("   subject.classes structure:", subject.classes.map(c => ({
            classId: c.classId,
            classIdType: typeof c.classId,
            classIdString: c.classId?.toString(),
            teacherId: c.teacherId
        })));

        // Verify all classes exist and teacher is assigned to teach this subject in these classes
        const classesData = await Sclass.find({ _id: { $in: classIds } });
        if (classesData.length !== classIds.length) {
            return res.status(404).json({ message: "One or more classes not found" });
        }

        console.log("🔍 CLASSIDS DEBUG:");
        console.log("   classIds received:", classIds);
        console.log("   classIds types:", classIds.map(id => ({ 
            id, 
            type: typeof id 
        })));

        // Verify teacher teaches this subject in these classes
        for (const classId of classIds) {
            console.log(`\n🔍 Checking classId: ${classId} (type: ${typeof classId})`);
            
            // Find class assignment - check both classId field and treat as direct ID
            let classAssignment = subject.classes.find(c => {
                const match1 = c.classId?.toString() === classId;
                const match2 = c.classId === classId;
                console.log(`   Checking c.classId='${c.classId}' vs classId='${classId}'`);
                console.log(`   match1 (toString): ${match1}, match2 (direct): ${match2}`);
                return match1 || match2;
            });
            
            if (!classAssignment) {
                console.error(`❌ No class assignment found for classId: ${classId}`);
                console.error(`   Available classes in subject:`, subject.classes);
                
                // Alternative: Check if class ID exists in subject.classes as fallback
                // Some systems might store class directly without classId wrapping
                console.log("🔄 Trying fallback check...");
                return res.status(403).json({ 
                    message: `Subject is not assigned to class ${classId}` 
                });
            }
            
            console.log(`✅ Found class assignment:`, classAssignment);
            
            if (classAssignment.teacherId && classAssignment.teacherId.toString() !== teacherId) {
                console.error(`❌ Teacher ID mismatch. Expected: ${teacherId}, Got: ${classAssignment.teacherId}`);
                return res.status(403).json({ 
                    message: `You are not assigned to teach this subject in class ${classId}` 
                });
            }
        }

        // Prepare assignment file data
        let assignmentFile = null;
        if (req.file) {
            assignmentFile = {
                fileName: req.file.originalname,
                fileUrl: `/uploads/assignments/${req.file.filename}`,
                uploadedAt: new Date(),
                size: req.file.size,
            };
        }

        // Create assignment
        const assignment = await Assignment.create({
            teacher: teacherId,
            subject: subjectId,
            classes: classIds,
            school: schoolId,
            title,
            description: description || '',
            assignmentFile,
            startDate: startDate ? new Date(startDate) : new Date(),
            dueDate: new Date(dueDate),
            totalMarks: totalMarks || 100,
            assignmentType: assignmentType || 'file-upload',
            published: true,
        });

        // Create submission records for all students in all classes
        const students = await Student.find({ sclassName: { $in: classIds } });
        const submissions = students.map(student => ({
            assignment: assignment._id,
            student: student._id,
            teacher: teacherId,
            subject: subjectId,
            sclass: student.sclassName,
            school: schoolId,
            status: 'pending',
        }));

        if (submissions.length > 0) {
            await AssignmentSubmission.insertMany(submissions);
        }

        return res.status(201).json({
            message: "Assignment created successfully",
            assignment: await assignment.populate(['teacher', 'subject', 'classes']),
        });
    } catch (error) {
        console.error("Error creating assignment:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get assignments created by a teacher
 * GET /Assignment/Teacher/:teacherId
 * Query: ?subjectId=xxx
 */
const getTeacherAssignments = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { subjectId } = req.query;

        let query = { teacher: teacherId };
        if (subjectId) query.subject = subjectId;

        const assignments = await Assignment.find(query)
            .populate('teacher', 'name')
            .populate('subject', 'subName')
            .populate('classes', 'sclassName')
            .sort({ createdAt: -1 });

        // Get submission count for each assignment
        const assignmentsWithStats = await Promise.all(
            assignments.map(async (assignment) => {
                const submissionCount = await AssignmentSubmission.countDocuments({
                    assignment: assignment._id,
                    status: { $in: ['submitted', 'late', 'graded'] }
                });
                return {
                    ...assignment.toObject(),
                    submissionCount,
                };
            })
        );

        return res.status(200).json({
            message: "Assignments retrieved successfully",
            assignments: assignmentsWithStats,
        });
    } catch (error) {
        console.error("Error fetching teacher assignments:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get assignments for a student by class and subject
 * GET /Assignment/Student/:studentId
 * Query: ?subjectId=xxx
 */
const getStudentAssignments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { subjectId } = req.query;

        // Get student info
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Build query: assignments where student's class is in the classes array
        let query = {
            classes: student.sclassName,
            published: true,
        };

        if (subjectId) query.subject = subjectId;

        const assignments = await Assignment.find(query)
            .populate('teacher', 'name')
            .populate('subject', 'subName')
            .sort({ dueDate: 1 });

        // Get submissions for each assignment
        const assignmentsWithSubmissions = await Promise.all(
            assignments.map(async (assignment) => {
                const submission = await AssignmentSubmission.findOne({
                    assignment: assignment._id,
                    student: studentId,
                });
                
                // Calculate if late
                let isLate = false;
                if (submission && submission.submittedAt) {
                    isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
                }

                return {
                    ...assignment.toObject(),
                    submission: submission || null,
                    isLate,
                };
            })
        );

        return res.status(200).json({
            message: "Assignments retrieved successfully",
            assignments: assignmentsWithSubmissions,
        });
    } catch (error) {
        console.error("Error fetching student assignments:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * CREATE: Student submits assignment
 * POST /Assignment/Submit
 * Body: { assignmentId, studentId, subjectId, classId, schoolId }
 * File: submissionFile
 */
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId, subjectId, classId, schoolId } = req.body;

        if (!assignmentId || !studentId || !subjectId || !classId || !schoolId) {
            return res.status(400).json({
                message: "assignmentId, studentId, subjectId, classId, and schoolId are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Submission file is required" });
        }

        // Verify entities exist
        const assignment = await Assignment.findById(assignmentId);
        const student = await Student.findById(studentId);

        if (!assignment || !student) {
            return res.status(404).json({ message: "Assignment or student not found" });
        }

        // Get teacher info
        const teacher = await Teacher.findById(assignment.teacher);

        // Check for existing submission
        let submission = await AssignmentSubmission.findOne({
            assignment: assignmentId,
            student: studentId,
        });

        if (submission && submission.status === 'graded') {
            return res.status(400).json({ message: "Assignment already graded. Cannot resubmit." });
        }

        // Prepare submission file data
        const submissionFile = {
            fileName: req.file.originalname,
            fileUrl: `/uploads/submissions/${req.file.filename}`,
            uploadedAt: new Date(),
            size: req.file.size,
        };

        // Check if submission is late
        const now = new Date();
        const isLate = now > assignment.dueDate;

        if (submission) {
            // Update existing submission
            submission.submissionFile = submissionFile;
            submission.status = isLate ? 'late' : 'submitted';
            submission.submittedAt = now;
            submission.isLate = isLate;
            await submission.save();
        } else {
            // Create new submission
            submission = await AssignmentSubmission.create({
                assignment: assignmentId,
                student: studentId,
                teacher: assignment.teacher,
                subject: subjectId,
                sclass: classId,
                school: schoolId,
                submissionFile,
                status: isLate ? 'late' : 'submitted',
                submittedAt: now,
                isLate,
            });
        }

        return res.status(201).json({
            message: "Assignment submitted successfully",
            submission: await submission.populate(['assignment', 'student', 'teacher']),
        });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get submissions for an assignment (Teacher view)
 * GET /Assignment/:assignmentId/Submissions
 */
const getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Get all students in the assignment's classes
        const allStudents = await Student.find({ sclassName: { $in: assignment.classes } });

        const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
            .populate('student', 'name rollNum sclassName')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Submissions retrieved successfully",
            submissions,
            totalStudents: allStudents.length,
            submittedCount: submissions.filter(s => s.status !== 'pending').length,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE: Teacher grades a submission
 * PUT /Assignment/Grade/:submissionId
 * Body: { marksObtained, feedback }
 */
const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { marksObtained, feedback } = req.body;

        if (marksObtained === undefined) {
            return res.status(400).json({ message: "marksObtained is required" });
        }

        const submission = await AssignmentSubmission.findByIdAndUpdate(
            submissionId,
            {
                marksObtained,
                feedback: feedback || '',
                status: 'graded',
            },
            { new: true }
        ).populate(['student', 'assignment']);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        return res.status(200).json({
            message: "Submission graded successfully",
            submission,
        });
    } catch (error) {
        console.error("Error grading submission:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE: Delete an assignment
 * DELETE /Assignment/:assignmentId
 */
const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findByIdAndDelete(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Also delete related submissions
        await AssignmentSubmission.deleteMany({ assignment: assignmentId });

        return res.status(200).json({
            message: "Assignment deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get students who have not submitted for an assignment (Teacher view)
 * GET /Assignment/:assignmentId/NotSubmitted
 */
const getNotSubmittedStudents = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Get all students in the assignment's classes
        const allStudents = await Student.find({ sclassName: { $in: assignment.classes } })
            .select('_id name rollNum sclassName email');

        // Get student IDs who have submitted
        const submissions = await AssignmentSubmission.find({ 
            assignment: assignmentId,
            status: { $in: ['submitted', 'late', 'graded'] }
        }).select('student');

        const submittedStudentIds = new Set(submissions.map(s => s.student.toString()));

        // Filter out students who have submitted
        const notSubmittedStudents = allStudents.filter(
            student => !submittedStudentIds.has(student._id.toString())
        );

        return res.status(200).json({
            message: "Not submitted students retrieved successfully",
            notSubmittedStudents,
            count: notSubmittedStudents.length,
            totalStudents: allStudents.length,
            submittedCount: submittedStudentIds.size,
        });
    } catch (error) {
        console.error("Error fetching not submitted students:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get submission details and file info
 * GET /Assignment/Submission/:submissionId
 */
const getSubmissionDetail = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const submission = await AssignmentSubmission.findById(submissionId)
            .populate('student', 'name rollNum email sclassName')
            .populate('teacher', 'name email')
            .populate('assignment', 'title dueDate totalMarks')
            .populate('subject', 'subName')
            .populate('sclass', 'sclassName');

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        return res.status(200).json({
            message: "Submission details retrieved successfully",
            submission,
        });
    } catch (error) {
        console.error("Error fetching submission detail:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE: Teacher provide feedback on submission
 * PUT /Assignment/Submission/:submissionId/Feedback
 * Body: { feedback, marksObtained }
 */
const updateSubmissionFeedback = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { feedback, marksObtained } = req.body;

        const submission = await AssignmentSubmission.findByIdAndUpdate(
            submissionId,
            {
                feedback: feedback || '',
                marksObtained: marksObtained !== undefined ? marksObtained : submission.marksObtained,
                status: 'graded',
            },
            { new: true }
        ).populate(['student', 'assignment']);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        return res.status(200).json({
            message: "Submission feedback updated successfully",
            submission,
        });
    } catch (error) {
        console.error("Error updating submission feedback:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * GET: Get student grades for all assignments by subject
 * GET /Student/:studentId/Grades
 */
const getStudentGrades = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { subjectId } = req.query;

        // Get student info
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Build query for submissions
        let query = {
            student: studentId,
            status: 'graded'
        };

        if (subjectId) {
            query.subject = subjectId;
        }

        // Get all graded submissions with assignment details
        const submissions = await AssignmentSubmission.find(query)
            .populate({
                path: 'assignment',
                populate: { path: 'teacher', select: 'name' }
            })
            .populate('subject', 'subName subCode')
            .sort({ createdAt: -1 });

        // Calculate statistics by subject
        const statsBySubject = {};
        submissions.forEach(sub => {
            const subName = sub.subject.subName;
            if (!statsBySubject[subName]) {
                statsBySubject[subName] = {
                    subName,
                    subCode: sub.subject.subCode,
                    subjectId: sub.subject._id,
                    totalMarks: 0,
                    obtainedMarks: 0,
                    assignmentCount: 0,
                    gradePercentage: 0
                };
            }
            statsBySubject[subName].totalMarks += sub.assignment.totalMarks || 100;
            statsBySubject[subName].obtainedMarks += sub.marksObtained || 0;
            statsBySubject[subName].assignmentCount += 1;
        });

        // Calculate percentages
        Object.keys(statsBySubject).forEach(key => {
            if (statsBySubject[key].totalMarks > 0) {
                statsBySubject[key].gradePercentage = 
                    ((statsBySubject[key].obtainedMarks / statsBySubject[key].totalMarks) * 100).toFixed(2);
            }
        });

        return res.status(200).json({
            message: "Student grades retrieved successfully",
            submissions,
            statsBySubject: Object.values(statsBySubject),
        });
    } catch (error) {
        console.error("Error fetching student grades:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * GET: Get student submission details for a specific assignment
 * GET /Student/:studentId/Submission/:submissionId
 */
const getStudentSubmissionDetail = async (req, res) => {
    try {
        const { studentId, submissionId } = req.params;

        const submission = await AssignmentSubmission.findById(submissionId)
            .populate('student', 'name rollNum')
            .populate({
                path: 'assignment',
                select: 'title description totalMarks dueDate assignmentFile',
                populate: { path: 'teacher', select: 'name email' }
            })
            .populate('subject', 'subName subCode');

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        // Verify student owns this submission
        if (submission.student._id.toString() !== studentId) {
            return res.status(403).json({ message: "Access denied" });
        }

        return res.status(200).json({
            message: "Submission details retrieved successfully",
            submission,
        });
    } catch (error) {
        console.error("Error fetching submission details:", error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    getTeacherAssignments,
    getStudentAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    getNotSubmittedStudents,
    getSubmissionDetail,
    updateSubmissionFeedback,
    gradeSubmission,
    deleteAssignment,
    getStudentGrades,
    getStudentSubmissionDetail,
};
