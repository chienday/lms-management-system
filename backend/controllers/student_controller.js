const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const ChatMessage = require('../models/chatMessageSchema.js');
const TeachingAssignment = require('../models/teachingAssignmentSchema.js');

// Function to register a new student
const studentRegister = async (req, res) => {

    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        // Check if a student with the same roll number, school, and class name already exists
        // to ensure uniqueness of roll numbers within a class and school
        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });
        if (existingStudent) {
            return res.status(400).json({ message: 'Roll Number already exists' });
        }
        // If no existing student is found, create a new student
        else {
            const student = new Student({
                ...req.body,
                school: req.body.adminID,
                password: hashedPass
            });

            // Save the new student to the database
            let result = await student.save();
            // Remove the password from the result before sending the response
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Function to log in a student
const studentLogIn = async (req, res) => {

    try {
        // Find a student by roll number and name
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            // Compare the provided password with the hashed password
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                // Populate school and class name, then remove sensitive data
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                res.send(student);
            } 
            else {
                res.status(401).json({ message: "Invalid password" });
            }
        } 
        else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Function to get all students of a specific school
const getStudents = async (req, res) => {

    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        // If students are found, modify the array to remove passwords
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } 
        else {
            // Return 200 with empty array when no students found, not 404
            res.status(200).json({ message: "No students found", data: [] });
        }
    } 
    catch (err) {
        res.status(500).json(err);
    }
};

// Function to get the details of a specific student
const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName");
        // If a student is found, remove the password before sending the response
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.status(404).json({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// Function to delete a specific student
const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to update a student's information
const updateStudent = async (req, res) => {
    try {
        // If a new password is provided, hash it before updating
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        }
        // Update the student's information
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to update a student's exam result for a specific subject
const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;


    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        // Find if a result for the subject already exists
        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        // If no existing result, add a new one
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};



// Function to analyze student learning using AI
const analyzeLearning = async (req, res) => {
    try {
        const { studentId } = req.body;

        // Get student details
        const student = await Student.findById(studentId)
            .populate("examResult.subName", "subName");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Calculate average score
        let totalScore = 0;
        let scoreCount = 0;

        if (student.examResult && student.examResult.length > 0) {
            student.examResult.forEach((exam) => {
                totalScore += exam.marksObtained || 0;
                scoreCount++;
            });
        }

        const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
        // Normalize score to 0-10 scale (assuming marksObtained is already out of 10 or similar)
        const normalizedScore = Math.min(avgScore / 10, 10);

        // Load recent real chatbot history for this student (if any)
        const recentChat = await ChatMessage.find({ student: studentId })
            .sort({ createdAt: -1 })
            .limit(20);
        const chatHistory = recentChat
            .reverse()
            .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`);

        // Prepare data for AI service
        const aiData = {
            profile: {
                student_id: student._id.toString(),
                student_name: student.name,
                attendance_rate: 0,
                avg_score: Math.round(normalizedScore * 100) / 100, // Round to 2 decimals
            },
            chat: {
                chat_history: chatHistory.length > 0
                    ? chatHistory
                    : [
                        `Điểm trung bình hiện tại: ${Math.round(avgScore * 10) / 10}/10.`
                    ],
            },
        };

        console.log("Sending to AI service:", aiData);

        // Chọn URL cho dịch vụ AI:
        // - Khi chạy Docker Compose: mặc định dùng hostname service "ai-service"
        // - Khi chạy local (không Docker): đặt AI_SERVICE_URL="http://localhost:8000/analyze-learning"
        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://ai-service:8000/analyze-learning";

        // Send to FastAPI AI service
        const aiResponse = await fetch(aiServiceUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(aiData),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            throw new Error(`AI service error: ${aiResponse.statusText} - ${errorText}`);
        }

        const aiResult = await aiResponse.json();

        console.log("AI service response:", aiResult);

        // Persist latest analysis to this student (one latest snapshot)
        const analysisDate = new Date();
        student.learningAnalysis = {
            riskLevel: aiResult.analysis?.riskLevel,
            learningBehavior: aiResult.analysis?.learningBehavior || [],
            analysis: aiResult.analysis?.analysis,
            recommendations: aiResult.analysis?.recommendations || [],
            avgScore,
            analyzedAt: analysisDate,
        };
        await student.save();

        // Return combined result including analysis date
        res.send({
            student: {
                _id: student._id,
                name: student.name,
                rollNum: student.rollNum,
                avgScore,
            },
            analysis: aiResult.analysis, // Extract only the analysis field from FastAPI response
            analysisDate,
        });
    } catch (error) {
        console.error("Error analyzing learning:", error);
        res.status(500).json({ message: error.message });
    }
};

// Function to lock/unlock a student account
const toggleStudentLockStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        // Toggle between Active and Locked
        const newStatus = student.accountStatus === 'Active' ? 'Locked' : 'Active';
        student.accountStatus = newStatus;
        const result = await student.save();
        result.password = undefined;
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to lock a student account
const lockStudentAccount = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { accountStatus: 'Locked' },
            { new: true }
        );
        if (!student) {
            return res.send({ message: 'Student not found' });
        }
        student.password = undefined;
        res.send(student);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to unlock a student account
const unlockStudentAccount = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { accountStatus: 'Active' },
            { new: true }
        );
        if (!student) {
            return res.send({ message: 'Student not found' });
        }
        student.password = undefined;
        res.send(student);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to bulk import students from CSV/Excel
const bulkImportStudents = async (req, res) => {
    try {
        const { students } = req.body; // Expecting array of students data
        const adminID = req.params.id;

        if (!Array.isArray(students) || students.length === 0) {
            return res.send({ message: 'No students data provided' });
        }

        const results = {
            success: [],
            failed: []
        };

        // Process each student
        for (const studentData of students) {
            try {
                const { name, rollNum, email, password, sclassName } = studentData;

                // Validate required fields
                if (!name || !rollNum || !password || !sclassName) {
                    results.failed.push({
                        rollNum: rollNum || 'N/A',
                        error: 'Missing required fields (name, rollNum, password, sclassName)'
                    });
                    continue;
                }

                // Check if student with same roll number already exists
                const existingStudent = await Student.findOne({
                    rollNum: rollNum,
                    school: adminID,
                    sclassName: sclassName
                });

                if (existingStudent) {
                    results.failed.push({
                        rollNum: rollNum,
                        error: 'Roll number already exists in this class'
                    });
                    continue;
                }

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(password, salt);

                // Create new student
                const newStudent = new Student({
                    name,
                    rollNum,
                    email: email || '',
                    password: hashedPass,
                    sclassName,
                    school: adminID,
                    role: 'Student',
                    accountStatus: 'Active',
                    attendance: [],
                    examResult: []
                });

                const savedStudent = await newStudent.save();
                let studentResponse = { ...savedStudent._doc };
                delete studentResponse.password;
                results.success.push(studentResponse);

            } catch (error) {
                results.failed.push({
                    rollNum: studentData.rollNum || 'N/A',
                    error: error.message
                });
            }
        }

        res.send({
            message: `Import completed. ${results.success.length} succeeded, ${results.failed.length} failed`,
            results: {
                success: results.success,
                failed: results.failed
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to reset a student's password
const resetStudentPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.send({ message: 'New password is required' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { password: hashedPass },
            { new: true }
        );

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        student.password = undefined;
        res.send(student);
    } catch (error) {
        res.status(500).json(error);
    }
};

/**
 * GET: Get all subjects for a student
 * GET /Student/:studentId/Subjects
 * Returns: List of subjects with teacher and class info
 */
const getStudentSubjects = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Get student with their class
        const student = await Student.findById(studentId)
            .populate("sclassName", "_id sclassName");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Find all teaching assignments for this student's class
        const assignments = await TeachingAssignment.find({
            classes: student.sclassName._id,
            status: 'active'
        })
            .populate('subject', '_id subName subCode sessions')
            .populate('teacher', '_id name email')
            .populate('classes', '_id sclassName');

        // Transform data to include subject with teacher info
        const subjects = assignments.map(assignment => ({
            _id: assignment.subject._id,
            subName: assignment.subject.subName,
            subCode: assignment.subject.subCode,
            sessions: assignment.subject.sessions,
            teacher: {
                _id: assignment.teacher._id,
                name: assignment.teacher.name,
                email: assignment.teacher.email
            },
            classes: assignment.classes,
            teachingAssignmentId: assignment._id,
            status: assignment.status
        }));

        return res.status(200).json({
            message: "Student subjects retrieved successfully",
            subjects,
        });
    } catch (error) {
        console.error("Error fetching student subjects:", error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    deleteStudentsByClass,
    updateExamResult,
    getStudentSubjects,
    analyzeLearning,
    toggleStudentLockStatus,
    lockStudentAccount,
    unlockStudentAccount,
    resetStudentPassword,
    bulkImportStudents,
};
