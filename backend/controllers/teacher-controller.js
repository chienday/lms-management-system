const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

// Function to register a new teacher
const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Create a new teacher instance with hashed password
        const teacher = new Teacher({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });

        // Check if a teacher with the same email already exists
        const existingTeacherByEmail = await Teacher.findOne({ email });

        // If a teacher with the same email exists, send an error message
        if (existingTeacherByEmail) {
            res.status(400).json({ message: 'Email already exists' });
        }
        // If no existing teacher is found, create a new teacher
        else {
            // Save the new teacher to the database
            let result = await teacher.save();
            // Update the subject to include the teacher's ID
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            // Remove the password from the result before sending the response
            result.password = undefined;
            // Send the result
            res.send(result);
        }
        // If there is an error, send a 500 status code with the error details
        /**
         * @param {Error} err - The error object.
         * @returns {void}
         * @throws {Error} - Throws an error if there is an issue creating the teacher.
         */

    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        // Find a teacher by email
        let teacher = await Teacher.findOne({ email: req.body.email });
        // If a teacher is found
        if (teacher) {
            // Compare the provided password with the hashed password
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            // If the password is valid
            if (validated) {
                // Populate the teacher's subject, school, and class details
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                // Remove the password from the teacher object
                teacher.password = undefined;
                // Send the teacher object
                res.send(teacher);
            // If the password is not valid
            } else {
                // Send an error message
                res.status(401).json({ message: "Invalid password" });
            }
        // If no teacher is found
        } else {
            // Send an error message
            res.status(404).json({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Function to get all teachers of a specific school
const getTeachers = async (req, res) => {
    try {
        // Find all teachers in the database that belong to the school specified by the id in the request parameters
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        // If teachers are found
        if (teachers.length > 0) {
            // Modify the array to remove passwords
            let modifiedTeachers = teachers.map((teacher) => {
                // Remove the password from the teacher object
                return { ...teacher._doc, password: undefined };
            });
            // Send the modified array
            res.send(modifiedTeachers);
        // If no teachers are found
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Function to get the details of a specific teacher
const getTeacherDetail = async (req, res) => {
    try {
        // Find the teacher by ID and populate the subject, school, and class details
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
        // If a teacher is found
        if (teacher) {
            // Remove the password from the teacher object
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// Function to update a teacher's subject
const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        // Find the teacher by ID and update the subject
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        // Update the subject to include the teacher's ID
        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        /**
         * @param {Object} updatedTeacher - The updated teacher object.
         */
        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try { // Find the teacher by ID and delete it
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        // Update the subject to remove the teacher's ID
        await Subject.updateOne(
            // Find the subject where the teacher's ID matches the deleted teacher's ID
            // and the teacher field exists
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to delete all teachers of a specific school
const deleteTeachers = async (req, res) => {
    
    try {
        // Delete all teachers that belong to the school specified by the id in the request parameters
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        // Get the number of deleted teachers
        const deletedCount = deletionResult.deletedCount || 0;

        // If no teachers are found to delete
        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        // Find all deleted teachers
        const deletedTeachers = await Teacher.find({ school: req.params.id });

        // Update the subjects to remove the teacher's ID
        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            // Remove the teacher field from the subject
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to delete all teachers of a specific class
const deleteTeachersByClass = async (req, res) => {
    try {
        // Delete all teachers that belong to the class specified by the id in the request parameters
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        // Get the number of deleted teachers
        const deletedCount = deletionResult.deletedCount || 0;

        // If no teachers are found to delete
        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        // Find all deleted teachers
        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        // Update the subjects to remove the teacher's ID
        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            // Remove the teacher field from the subject
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Function to reset teacher password
const resetTeacherPassword = async (req, res) => {
    const { teacherId, newPassword } = req.body;
    try {
        if (!teacherId || !newPassword) {
            return res.status(400).json({ message: "Teacher ID and new password are required" });
        }

        // Find the teacher by ID
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);

        // Update the password
        teacher.password = hashedPass;
        const result = await teacher.save();

        // Return without password
        result.password = undefined;
        return res.status(200).json({
            message: "Password reset successfully",
            teacher: result
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Function to update teacher information
const updateTeacher = async (req, res) => {
    const { teacherId, name, email, teachSclass } = req.body;
    try {
        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required" });
        }

        // Find the teacher by ID
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Check if new email is already in use by another teacher
        if (email && email !== teacher.email) {
            const existingTeacher = await Teacher.findOne({ email });
            if (existingTeacher) {
                return res.status(400).json({ message: "Email already in use" });
            }
            teacher.email = email;
        }

        // Update other fields
        if (name) teacher.name = name;
        if (teachSclass) teacher.teachSclass = teachSclass;

        const result = await teacher.save();
        result.password = undefined;

        return res.status(200).json({
            message: "Teacher updated successfully",
            teacher: result
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Function to get teacher with their teaching assignments
const getTeacherWithAssignments = async (req, res) => {
    try {
        const teacherId = req.params.id;
        
        // Find teacher with populated details
        let teacher = await Teacher.findById(teacherId)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName");

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Find all teaching assignments for this teacher
        const TeachingAssignment = require('../models/teachingAssignmentSchema.js');
        const assignments = await TeachingAssignment.find({ teacher: teacherId })
            .populate("subject", "subName")
            .populate("classes", "sclassName")
            .populate("school", "schoolName");

        // Count number of assignments
        const assignmentStats = {
            totalAssignments: assignments.length,
            totalClasses: new Set(assignments.flatMap(a => a.classes.map(c => c._id.toString()))).size,
            totalSubjects: new Set(assignments.map(a => a.subject._id.toString())).size,
            assignments: assignments
        };

        teacher.password = undefined;
        return res.status(200).json({
            teacher,
            assignments: assignmentStats
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Function to get comprehensive teacher statistics
const getTeacherStats = async (req, res) => {
    try {
        const teacherId = req.params.id;
        
        const TeachingAssignment = require('../models/teachingAssignmentSchema.js');
        const Assignment = require('../models/assignmentSchema.js');

        // Get teacher
        const teacher = await Teacher.findById(teacherId)
            .populate("school", "schoolName");

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Get teaching assignments
        const assignments = await TeachingAssignment.find({ teacher: teacherId })
            .populate("subject", "subName")
            .populate("classes", "sclassName");

        // Get assignments created by this teacher
        const createdAssignments = await Assignment.countDocuments({ teacher: teacherId });

        // Calculate statistics
        const stats = {
            name: teacher.name,
            email: teacher.email,
            totalSubjects: assignments.length,
            totalClasses: new Set(assignments.flatMap(a => a.classes.map(c => c._id.toString()))).size,
            assignmentsCreated: createdAssignments,
            subjects: assignments.map(a => ({
                subjectName: a.subject.subName,
                classes: a.classes.map(c => c.sclassName)
            }))
        };

        return res.status(200).json(stats);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    resetTeacherPassword,
    updateTeacher,
    getTeacherWithAssignments,
    getTeacherStats
};
