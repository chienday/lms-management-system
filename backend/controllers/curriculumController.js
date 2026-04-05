const Curriculum = require("../models/curriculumSchema");
const Subject = require("../models/subjectSchema");
const Teacher = require("../models/teacherSchema");
const fs = require("fs");
const path = require("path");

// Helper function to update curriculum statistics
const updateCurriculumStats = (curriculum) => {
  curriculum.totalChapters = curriculum.chapters.length;
  curriculum.totalDocuments = curriculum.documents.length;

  let totalLessons = 0;
  curriculum.chapters.forEach((chapter) => {
    totalLessons += chapter.lessons.length;
  });
  curriculum.totalLessons = totalLessons;

  return curriculum;
};

// Helper function to generate unique IDs
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Create a new curriculum
 */
const createCurriculum = async (req, res) => {
  try {
    const { name, description, subjectId, tags, topics } = req.body;
    const teacherId = req.user.id || req.user._id;
    const schoolId = req.user.schoolId || req.user.school;

    // Validate required fields
    if (!name || !subjectId) {
      return res
        .status(400)
        .json({ message: "Name and Subject are required" });
    }

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Create new curriculum
    const curriculum = new Curriculum({
      name,
      description: description || "",
      teacher: teacherId,
      subject: subjectId,
      school: schoolId,
      tags: tags || [],
      topics: topics || [],
      chapters: [],
      documents: [],
      progress: 0,
      status: "draft",
    });

    await curriculum.save();

    // Populate references
    await curriculum.populate([
      { path: "teacher", select: "name email" },
      { path: "subject", select: "name" },
    ]);

    res.status(201).json({
      message: "Curriculum created successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error creating curriculum:", error);
    res.status(500).json({ message: "Error creating curriculum", error });
  }
};

/**
 * Get all curriculums for a teacher
 */
const getTeacherCurriculums = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const { status, subject, search } = req.query;

    // Build query
    let query = { teacher: teacherId };

    if (status) {
      query.status = status;
    }

    if (subject) {
      query.subject = subject;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const curriculums = await Curriculum.find(query)
      .populate("teacher", "name email")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Curriculums retrieved successfully",
      curriculums,
    });
  } catch (error) {
    console.error("Error retrieving curriculums:", error);
    res.status(500).json({ message: "Error retrieving curriculums", error });
  }
};

/**
 * Get curriculum details
 */
const getCurriculumDetail = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId)
      .populate("teacher", "name email")
      .populate("subject", "name")
      .populate("documents.uploadedBy", "name email");

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    // Verify ownership
    if (curriculum.teacher._id.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      message: "Curriculum retrieved successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error retrieving curriculum:", error);
    res.status(500).json({ message: "Error retrieving curriculum", error });
  }
};

/**
 * Update curriculum basic info
 */
const updateCurriculum = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { name, description, tags, topics, status, progress } = req.body;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update fields if provided
    if (name) curriculum.name = name;
    if (description) curriculum.description = description;
    if (tags) curriculum.tags = tags;
    if (topics) curriculum.topics = topics;
    if (status) curriculum.status = status;
    if (progress !== undefined) curriculum.progress = progress;

    curriculum.updatedAt = new Date();
    await curriculum.save();

    await curriculum.populate([
      { path: "teacher", select: "name email" },
      { path: "subject", select: "name" },
    ]);

    res.status(200).json({
      message: "Curriculum updated successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error updating curriculum:", error);
    res.status(500).json({ message: "Error updating curriculum", error });
  }
};

/**
 * Delete curriculum
 */
const deleteCurriculum = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete associated files
    curriculum.documents.forEach((doc) => {
      try {
        if (fs.existsSync(doc.filePath)) {
          fs.unlinkSync(doc.filePath);
        }
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    });

    await Curriculum.findByIdAndDelete(curriculumId);

    res.status(200).json({ message: "Curriculum deleted successfully" });
  } catch (error) {
    console.error("Error deleting curriculum:", error);
    res.status(500).json({ message: "Error deleting curriculum", error });
  }
};

/**
 * Add chapter to curriculum
 */
const addChapter = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { name, description } = req.body;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const chapter = {
      id: generateId(),
      name,
      description: description || "",
      order: curriculum.chapters.length + 1,
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    curriculum.chapters.push(chapter);
    updateCurriculumStats(curriculum);
    await curriculum.save();

    res.status(201).json({
      message: "Chapter added successfully",
      chapter,
      curriculum,
    });
  } catch (error) {
    console.error("Error adding chapter:", error);
    res.status(500).json({ message: "Error adding chapter", error });
  }
};

/**
 * Update chapter
 */
const updateChapter = async (req, res) => {
  try {
    const { curriculumId, chapterId } = req.params;
    const { name, description, order } = req.body;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const chapter = curriculum.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (name) chapter.name = name;
    if (description) chapter.description = description;
    if (order) chapter.order = order;
    chapter.updatedAt = new Date();

    await curriculum.save();

    res.status(200).json({
      message: "Chapter updated successfully",
      chapter,
      curriculum,
    });
  } catch (error) {
    console.error("Error updating chapter:", error);
    res.status(500).json({ message: "Error updating chapter", error });
  }
};

/**
 * Delete chapter
 */
const deleteChapter = async (req, res) => {
  try {
    const { curriculumId, chapterId } = req.params;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    curriculum.chapters.id(chapterId).deleteOne();
    updateCurriculumStats(curriculum);
    await curriculum.save();

    res.status(200).json({
      message: "Chapter deleted successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    res.status(500).json({ message: "Error deleting chapter", error });
  }
};

/**
 * Add lesson to chapter
 */
const addLesson = async (req, res) => {
  try {
    const { curriculumId, chapterId } = req.params;
    const { name, description, content } = req.body;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const chapter = curriculum.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const lesson = {
      id: generateId(),
      name,
      description: description || "",
      content: content || "",
      order: chapter.lessons.length + 1,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    chapter.lessons.push(lesson);
    updateCurriculumStats(curriculum);
    await curriculum.save();

    res.status(201).json({
      message: "Lesson added successfully",
      lesson,
      curriculum,
    });
  } catch (error) {
    console.error("Error adding lesson:", error);
    res.status(500).json({ message: "Error adding lesson", error });
  }
};

/**
 * Update lesson
 */
const updateLesson = async (req, res) => {
  try {
    const { curriculumId, chapterId, lessonId } = req.params;
    const { name, description, content, status, order } = req.body;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const chapter = curriculum.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const lesson = chapter.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (name) lesson.name = name;
    if (description) lesson.description = description;
    if (content) lesson.content = content;
    if (status) lesson.status = status;
    if (order) lesson.order = order;
    lesson.updatedAt = new Date();

    await curriculum.save();

    res.status(200).json({
      message: "Lesson updated successfully",
      lesson,
      curriculum,
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ message: "Error updating lesson", error });
  }
};

/**
 * Delete lesson
 */
const deleteLesson = async (req, res) => {
  try {
    const { curriculumId, chapterId, lessonId } = req.params;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const chapter = curriculum.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    chapter.lessons.id(lessonId).deleteOne();
    updateCurriculumStats(curriculum);
    await curriculum.save();

    res.status(200).json({
      message: "Lesson deleted successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ message: "Error deleting lesson", error });
  }
};

/**
 * Upload document to curriculum
 */
const uploadDocument = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const teacherId = req.user.id || req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Validate file type
    const allowedExtensions = ["pdf", "docx", "pptx", "xlsx", "txt"];
    const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);

    if (!allowedExtensions.includes(fileExt)) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "File type not allowed" });
    }

    const document = {
      id: generateId(),
      name: req.body.name || req.file.originalname,
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      fileType: fileExt,
      fileSize: req.file.size,
      uploadedBy: teacherId,
      uploadDate: new Date(),
    };

    curriculum.documents.push(document);
    updateCurriculumStats(curriculum);
    await curriculum.save();

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
      curriculum,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Error uploading document", error });
  }
};

/**
 * Delete document
 */
const deleteDocument = async (req, res) => {
  try {
    const { curriculumId, documentId } = req.params;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const document = curriculum.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from system
    try {
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    document.deleteOne();
    updateCurriculumStats(curriculum);
    await curriculum.save();

    res.status(200).json({
      message: "Document deleted successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Error deleting document", error });
  }
};

/**
 * Reorder chapters
 */
const reorderChapters = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { chapters } = req.body;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update order
    chapters.forEach((chapterOrder, index) => {
      const chapter = curriculum.chapters.id(chapterOrder.id);
      if (chapter) {
        chapter.order = index + 1;
      }
    });

    await curriculum.save();

    res.status(200).json({
      message: "Chapters reordered successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error reordering chapters:", error);
    res.status(500).json({ message: "Error reordering chapters", error });
  }
};

/**
 * Publish curriculum
 */
const publishCurriculum = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const teacherId = req.user.id || req.user._id;

    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    if (curriculum.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    curriculum.status = "published";
    curriculum.isPublished = true;
    curriculum.publishDate = new Date();
    await curriculum.save();

    res.status(200).json({
      message: "Curriculum published successfully",
      curriculum,
    });
  } catch (error) {
    console.error("Error publishing curriculum:", error);
    res.status(500).json({ message: "Error publishing curriculum", error });
  }
};

module.exports = {
  createCurriculum,
  getTeacherCurriculums,
  getCurriculumDetail,
  updateCurriculum,
  deleteCurriculum,
  addChapter,
  updateChapter,
  deleteChapter,
  addLesson,
  updateLesson,
  deleteLesson,
  uploadDocument,
  deleteDocument,
  reorderChapters,
  publishCurriculum,
};
