const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Assignment = require("../models/assignmentSchema.js");
const AssignmentSubmission = require("../models/assignmentSubmissionSchema.js");
const Student = require("../models/studentSchema.js");

/**
 * DOWNLOAD: Download single submission file
 * GET /Submission/:submissionId/Download
 */
const downloadSubmissionFile = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const submission = await AssignmentSubmission.findById(submissionId)
            .populate('student', 'name rollNum')
            .populate('assignment', 'title');

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        if (!submission.submissionFile || !submission.submissionFile.fileUrl) {
            return res.status(404).json({ message: "No file submitted yet" });
        }

        // Get file path
        const filePath = path.join(__dirname, '..', submission.submissionFile.fileUrl);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found on server" });
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${submission.student.name}_${submission.submissionFile.fileName}"`
        );

        // Stream file to response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error("Error streaming file:", error);
            res.status(500).json({ message: "Error downloading file" });
        });
    } catch (error) {
        console.error("Error downloading submission file:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * DOWNLOAD: Download all submissions as ZIP
 * GET /Assignment/:assignmentId/SubmissionsZip
 * Creates structure: className/studentName/fileName
 */
const downloadSubmissionsAsZip = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Get all submissions with student and class info
        const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
            .populate('student', 'name rollNum sclassName')
            .populate('sclass', 'sclassName');

        if (submissions.length === 0) {
            return res.status(404).json({ message: "No submissions found" });
        }

        // Create ZIP file
        const zipFileName = `${assignment.title.replace(/\s+/g, '_')}_Submissions_${Date.now()}.zip`;
        const zipPath = path.join(__dirname, '..', 'uploads', zipFileName);

        // Create a write stream for the ZIP file
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Handle errors
        output.on('error', (error) => {
            console.error("Archive error:", error);
            res.status(500).json({ message: "Error creating ZIP file" });
        });

        archive.on('error', (error) => {
            console.error("Archiver error:", error);
            res.status(500).json({ message: "Error during archiving" });
        });

        // Pipe archive data to file
        archive.pipe(output);

        // Add files to archive
        let fileCount = 0;
        for (const submission of submissions) {
            if (submission.submissionFile && submission.submissionFile.fileUrl) {
                const studentName = submission.student.name.replace(/\s+/g, '_');
                const className = submission.sclass 
                    ? submission.sclass.sclassName.replace(/\s+/g, '_')
                    : 'Unknown_Class';
                
                const filePath = path.join(__dirname, '..', submission.submissionFile.fileUrl);

                if (fs.existsSync(filePath)) {
                    // Archive path: className/studentName_rollNum/fileName
                    const archivePath = `${className}/${studentName}_${submission.student.rollNum}/${submission.submissionFile.fileName}`;
                    archive.file(filePath, { name: archivePath });
                    fileCount++;
                } else {
                    console.warn(`File not found: ${filePath}`);
                }
            }
        }

        // Finalize archive
        archive.finalize();

        // Send file when complete
        output.on('close', () => {
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${zipFileName}"`
            );

            const fileStream = fs.createReadStream(zipPath);
            fileStream.pipe(res);

            fileStream.on('end', () => {
                // Delete ZIP file after sending
                setTimeout(() => {
                    fs.unlink(zipPath, (error) => {
                        if (error) console.error("Error deleting temp ZIP:", error);
                    });
                }, 1000);
            });

            fileStream.on('error', (error) => {
                console.error("Error streaming ZIP:", error);
                res.status(500).json({ message: "Error sending ZIP file" });
            });
        });
    } catch (error) {
        console.error("Error creating ZIP file:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get submission statistics for an assignment
 * GET /Assignment/:assignmentId/SubmissionStats
 */
const getSubmissionStats = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId)
            .populate('classes', 'sclassName');

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Get all students in the classes
        const allStudents = await Student.find({ 
            sclassName: { $in: assignment.classes.map(c => c._id) } 
        });

        // Get submissions
        const submissions = await AssignmentSubmission.find({ assignment: assignmentId });

        // Calculate stats
        const stats = {
            totalStudents: allStudents.length,
            totalSubmissions: submissions.length,
            submitted: submissions.filter(s => s.status === 'submitted').length,
            late: submissions.filter(s => s.status === 'late').length,
            graded: submissions.filter(s => s.status === 'graded').length,
            pending: submissions.filter(s => s.status === 'pending').length,
            avgMarks: submissions.filter(s => s.marksObtained > 0).length > 0
                ? (submissions.reduce((sum, s) => sum + (s.marksObtained || 0), 0) / 
                   submissions.filter(s => s.marksObtained > 0).length).toFixed(2)
                : 0,
            gradeDistribution: {
                excellent: submissions.filter(s => s.marksObtained >= assignment.totalMarks * 0.9).length,
                good: submissions.filter(s => s.marksObtained >= assignment.totalMarks * 0.7 && s.marksObtained < assignment.totalMarks * 0.9).length,
                average: submissions.filter(s => s.marksObtained >= assignment.totalMarks * 0.5 && s.marksObtained < assignment.totalMarks * 0.7).length,
                poor: submissions.filter(s => s.marksObtained > 0 && s.marksObtained < assignment.totalMarks * 0.5).length,
            },
        };

        return res.status(200).json({
            message: "Submission statistics retrieved successfully",
            stats,
        });
    } catch (error) {
        console.error("Error fetching submission stats:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * READ: Get detailed submissions list with student info
 * GET /Assignment/:assignmentId/DetailedSubmissions
 */
const getDetailedSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { page = 1, limit = 20, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

        const assignment = await Assignment.findById(assignmentId)
            .populate('classes', 'sclassName');

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Get all students
        const allStudents = await Student.find({ 
            sclassName: { $in: assignment.classes.map(c => c._id) }
        }).select('_id name rollNum sclassName email');

        // Get submissions with full details
        const skip = (page - 1) * limit;
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
            .populate('student', 'name rollNum sclassName email')
            .populate('teacher', 'name')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        // Create map of submitted students
        const submittedMap = {};
        submissions.forEach(sub => {
            submittedMap[sub.student._id.toString()] = sub;
        });

        // Combine submitted and not submitted
        const detailedSubmissions = allStudents.map(student => {
            const submission = submittedMap[student._id.toString()];
            return {
                student: {
                    _id: student._id,
                    name: student.name,
                    rollNum: student.rollNum,
                    sclassName: student.sclassName,
                    email: student.email,
                },
                submission: submission ? {
                    _id: submission._id,
                    status: submission.status,
                    submittedAt: submission.submittedAt,
                    marksObtained: submission.marksObtained,
                    feedback: submission.feedback,
                    isLate: submission.isLate,
                    fileName: submission.submissionFile?.fileName,
                    fileSize: submission.submissionFile?.size,
                } : null,
                submitted: !!submission && submission.status !== 'pending',
                isLate: submission?.isLate || false,
                isGraded: submission?.status === 'graded',
            };
        });

        const totalCount = allStudents.length;
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            message: "Detailed submissions retrieved successfully",
            submissions: detailedSubmissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: totalPages,
            },
        });
    } catch (error) {
        console.error("Error fetching detailed submissions:", error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    downloadSubmissionFile,
    downloadSubmissionsAsZip,
    getSubmissionStats,
    getDetailedSubmissions,
};
