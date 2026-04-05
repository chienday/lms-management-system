const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

// Create a new class
const sclassCreate = async (req, res) => {
    try {
        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            school: req.body.adminID
        });

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            school: req.body.adminID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class name already exists' });
        }
        else {
            const result = await sclass.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all classes of a school
const sclassList = async (req, res) => {
    try {
        let sclasses = await Sclass.find({ school: req.params.id })
        if (sclasses.length > 0) {
            res.send(sclasses)
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get a specific class detail
const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            sclass = await sclass.populate("school", "schoolName")
            res.send(sclass);
        }
        else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// Get all students of a specific class
const getSclassStudents = async (req, res) => {
    try {
        let students = await Student.find({ sclassName: req.params.id })
        let modifiedStudents = students.map((student) => {
            return { ...student._doc, password: undefined };
        });
        res.send(modifiedStudents);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Delete a specific class
const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ teachSclass: req.params.id });
        res.send(deletedClass);
    } catch (error) {
        res.status(500).json(error);
    }
}

// Delete all classes of a specific school
const deleteSclasses = async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ school: req.params.id });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        const deletedStudents = await Student.deleteMany({ school: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ school: req.params.id });
        res.send(deletedClasses);
    } catch (error) {
        res.status(500).json(error);
    }
}

// Update a specific class
const sclassUpdate = async (req, res) => {
    try {
        const { sclassName } = req.body;
        const classId = req.params.id;

        if (!sclassName) {
            return res.status(400).send({ message: "Class name is required" });
        }

        // Check if class exists
        let sclass = await Sclass.findById(classId);
        if (!sclass) {
            return res.status(404).send({ message: "Class not found" });
        }

        // Check for duplicate name in the same school
        const existingClass = await Sclass.findOne({
            sclassName: sclassName,
            school: sclass.school,
            _id: { $ne: classId } // Exclude current class from check
        });

        if (existingClass) {
            return res.status(400).send({ message: "Class name already exists in this school" });
        }

        // Update the class
        sclass = await Sclass.findByIdAndUpdate(
            classId,
            { sclassName },
            { new: true }
        );

        res.send(sclass);
    } catch (err) {
        res.status(500).json(err);
    }
}


module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, sclassUpdate };
