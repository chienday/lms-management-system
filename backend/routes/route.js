const router = require('express').Router();

// Import upload middleware
const upload = require('../middleware/upload.js');

const { adminRegister, adminLogIn,  getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

//const { adminRegister, adminLogIn,  getAdminDetail} = require('../controllers/admin-controller.js');

const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, sclassUpdate } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
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
    bulkImportStudents } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const {
    createSubject,
    getSubjects,
    getTeacherSubjects,
    addClassToSubject,
    updateTeacherForClass,
    updateSubject,
    removeClassFromSubject,
    deleteSubject: deleteSubjectNew } = require('../controllers/subjectController.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, resetTeacherPassword, updateTeacher, getTeacherWithAssignments, getTeacherStats } = require('../controllers/teacher-controller.js');
const { getChatHistory, sendChatMessage, generateQuiz, getClassInsights } = require('../controllers/chat-controller.js');
const {
    createTeachingAssignment,
    getTeacherAssignments,
    getTeacherClassesBySubject,
    updateTeachingAssignment,
    deleteTeachingAssignment,
    getAllTeachingAssignments } = require('../controllers/teachingAssignmentController.js');
const {
    createAssignment,
    getTeacherAssignments: getTeacherAssignmentsForClass,
    getStudentAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    getNotSubmittedStudents,
    getSubmissionDetail,
    updateSubmissionFeedback,
    gradeSubmission,
    deleteAssignment,
    getStudentGrades,
    getStudentSubmissionDetail } = require('../controllers/assignmentController.js');
const {
    downloadSubmissionFile,
    downloadSubmissionsAsZip,
    getSubmissionStats,
    getDetailedSubmissions } = require('../controllers/submissionController.js');
const {
    createLecture,
    uploadLectureFile,
    getLectures,
    getLectureDetail,
    updateLecture,
    deleteLecture,
    updateLectureAnalysisStatus } = require('../controllers/lectureController.js');
const {
    generateAIQuestions,
    getAIQuestions,
    reviewAIQuestion,
    editAIQuestion,
    createQuizFromAI,
    deleteAIQuestion } = require('../controllers/aiQuizController.js');
const {
    generateAIInsights,
    getAIInsights,
    getAtRiskStudents,
    getWeakTopics,
    getClassStats,
    getLearningRecommendations } = require('../controllers/aiAnalyticsController.js');
const {
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
    publishCurriculum } = require('../controllers/curriculumController.js');

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);

router.get("/Admin/:id", getAdminDetail)
// router.delete("/Admin/:id", deleteAdmin)
router.put("/Admin/:id", updateAdmin)

// Student

router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)
router.get("/Student/:studentId/Subjects", getStudentSubjects)

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

// Student account management - MUST be before generic /Student/:id route
router.put('/Student/Lock/:id', toggleStudentLockStatus);
router.put('/Student/LockAccount/:id', lockStudentAccount);
router.put('/Student/UnlockAccount/:id', unlockStudentAccount);
router.put('/Student/ResetPassword/:id', resetStudentPassword);

router.put("/Student/:id", updateStudent)

router.put('/UpdateExamResult/:id', updateExamResult)

// Bulk import students
router.post('/Students/BulkImport/:id', bulkImportStudents);

// AI Learning Analytics
router.post('/analyzeLearning', analyzeLearning);

// Learning Chatbot (per-user history - supports both students and teachers)
router.get('/Chat/History/:userId', getChatHistory);
router.post('/Chat/Send', sendChatMessage);

// AI Service Endpoints
router.post('/Chat/GenerateQuiz', generateQuiz);
router.post('/Chat/ClassInsights', getClassInsights);

// Teacher

router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id/WithAssignments", getTeacherWithAssignments)
router.get("/Teacher/:id/Stats", getTeacherStats)

router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/TeacherSubject", updateTeacherSubject)
router.put("/Teacher/:id", updateTeacher)
router.post("/Teacher/:id/ResetPassword", resetTeacherPassword)

// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

// Sclass

router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/Students/:id", getSclassStudents)

router.get("/Sclass/:id", getSclassDetail)

router.put("/Sclass/:id", sclassUpdate)

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject

router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);

router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

// Subject Management (New - Admin manages subjects with classes and teachers)
router.post('/Subject/Create', createSubject);
router.get('/Subject/List/:schoolId', getSubjects);
router.get('/Subject/Teacher/:teacherId', getTeacherSubjects);
router.put('/Subject/:subjectId', updateSubject);
router.put('/Subject/:subjectId/AddClass', addClassToSubject);
router.put('/Subject/:subjectId/UpdateTeacher/:classId', updateTeacherForClass);
router.put('/Subject/:subjectId/RemoveClass/:classId', removeClassFromSubject);
router.delete('/SubjectManagement/:subjectId', deleteSubjectNew);

// Teaching Assignments (Teacher -> Subject -> Multiple Classes)
router.post('/TeachingAssignment/Create', createTeachingAssignment);
router.get('/TeachingAssignment/Teacher/:teacherId', getTeacherAssignments);
router.get('/TeachingAssignment/Classes/:teacherId/:subjectId', getTeacherClassesBySubject);
router.put('/TeachingAssignment/:assignmentId', updateTeachingAssignment);
router.delete('/TeachingAssignment/:assignmentId', deleteTeachingAssignment);
router.get('/TeachingAssignment/All/:schoolId', getAllTeachingAssignments);

// Assignments (File uploads & submissions)
router.post('/Assignment/Create', upload.single('assignmentFile'), createAssignment);
router.get('/Assignment/Teacher/:teacherId', getTeacherAssignmentsForClass);
router.get('/Assignment/Student/:studentId', getStudentAssignments);
router.post('/Assignment/Submit', upload.single('submissionFile'), submitAssignment);
router.get('/Assignment/:assignmentId/Submissions', getAssignmentSubmissions);
router.get('/Assignment/:assignmentId/NotSubmitted', getNotSubmittedStudents);
router.get('/Assignment/:assignmentId/DetailedSubmissions', getDetailedSubmissions);
router.get('/Assignment/:assignmentId/SubmissionStats', getSubmissionStats);
router.get('/Assignment/:assignmentId/SubmissionsZip', downloadSubmissionsAsZip);
router.get('/Submission/:submissionId', getSubmissionDetail);
router.get('/Submission/:submissionId/Download', downloadSubmissionFile);
router.put('/Submission/:submissionId/Feedback', updateSubmissionFeedback);
router.put('/Assignment/Grade/:submissionId', gradeSubmission);
router.delete('/Assignment/:assignmentId', deleteAssignment);

// Student Grades and Submissions
router.get('/Student/:studentId/Grades', getStudentGrades);
router.get('/Student/:studentId/Submission/:submissionId', getStudentSubmissionDetail);

// ─────────────────────────────────────────────────────────────────────
// AI & TEACHING SUPPORT FEATURES
// ─────────────────────────────────────────────────────────────────────

// Lecture Management
router.post('/Lecture/Create', createLecture);
router.post('/Lecture/:lectureId/Upload', upload.single('lectureFile'), uploadLectureFile);
router.get('/Lecture/:lectureId', getLectureDetail);
router.get('/Lectures', getLectures);
router.put('/Lecture/:lectureId', updateLecture);
router.put('/Lecture/:lectureId/Analysis', updateLectureAnalysisStatus);
router.delete('/Lecture/:lectureId', deleteLecture);

// AI Quiz Generation & Management
router.post('/AIQuiz/GenerateQuestions', generateAIQuestions);
router.get('/AIQuestions', getAIQuestions);
router.post('/AIQuestion/:questionId/Review', reviewAIQuestion);
router.put('/AIQuestion/:questionId', editAIQuestion);
router.post('/Quiz/CreateFromAI', createQuizFromAI);
router.delete('/AIQuestion/:questionId', deleteAIQuestion);

// AI Analytics & Insights
router.post('/AIAnalytics/GenerateInsights', generateAIInsights);
router.get('/AIAnalytics/Insights', getAIInsights);
router.get('/AIAnalytics/AtRiskStudents', getAtRiskStudents);
router.get('/AIAnalytics/WeakTopics', getWeakTopics);
router.get('/AIAnalytics/ClassStats', getClassStats);
router.get('/AIAnalytics/Recommendations', getLearningRecommendations);

// ─────────────────────────────────────────────────────────────────────
// CURRICULUM MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

// Curriculum CRUD operations
router.post('/Curriculum/Create', createCurriculum);
router.get('/Curriculum/Teacher', getTeacherCurriculums);
router.get('/Curriculum/:curriculumId', getCurriculumDetail);
router.put('/Curriculum/:curriculumId', updateCurriculum);
router.delete('/Curriculum/:curriculumId', deleteCurriculum);

// Chapter operations
router.post('/Curriculum/:curriculumId/Chapter', addChapter);
router.put('/Curriculum/:curriculumId/Chapter/:chapterId', updateChapter);
router.delete('/Curriculum/:curriculumId/Chapter/:chapterId', deleteChapter);
router.put('/Curriculum/:curriculumId/Chapters/Reorder', reorderChapters);

// Lesson operations
router.post('/Curriculum/:curriculumId/Chapter/:chapterId/Lesson', addLesson);
router.put('/Curriculum/:curriculumId/Chapter/:chapterId/Lesson/:lessonId', updateLesson);
router.delete('/Curriculum/:curriculumId/Chapter/:chapterId/Lesson/:lessonId', deleteLesson);

// Document management
router.post('/Curriculum/:curriculumId/Document', upload.single('document'), uploadDocument);
router.delete('/Curriculum/:curriculumId/Document/:documentId', deleteDocument);

// Publish curriculum
router.put('/Curriculum/:curriculumId/Publish', publishCurriculum);

module.exports = router;