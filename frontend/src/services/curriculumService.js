import axios from 'axios';

// Base API URL - should match your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Curriculum Service
const curriculumService = {
  // ============== CURRICULUM CRUD ==============
  
  /**
   * Create a new curriculum
   */
  createCurriculum: async (data) => {
    try {
      const response = await api.post('/Curriculum/Create', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all curriculums for the logged-in teacher
   * @param {Object} filters - { status, subject, search }
   */
  getTeacherCurriculums: async (filters = {}) => {
    try {
      const response = await api.get('/Curriculum/Teacher', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get curriculum details with all chapters and lessons
   */
  getCurriculumDetail: async (curriculumId) => {
    try {
      const response = await api.get(`/Curriculum/${curriculumId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update curriculum basic information
   */
  updateCurriculum: async (curriculumId, data) => {
    try {
      const response = await api.put(`/Curriculum/${curriculumId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete curriculum
   */
  deleteCurriculum: async (curriculumId) => {
    try {
      const response = await api.delete(`/Curriculum/${curriculumId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============== CHAPTER OPERATIONS ==============

  /**
   * Add a new chapter to curriculum
   */
  addChapter: async (curriculumId, chapterData) => {
    try {
      const response = await api.post(`/Curriculum/${curriculumId}/Chapter`, chapterData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update chapter information
   */
  updateChapter: async (curriculumId, chapterId, data) => {
    try {
      const response = await api.put(
        `/Curriculum/${curriculumId}/Chapter/${chapterId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete chapter from curriculum
   */
  deleteChapter: async (curriculumId, chapterId) => {
    try {
      const response = await api.delete(
        `/Curriculum/${curriculumId}/Chapter/${chapterId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reorder chapters in curriculum
   */
  reorderChapters: async (curriculumId, chaptersOrder) => {
    try {
      const response = await api.put(
        `/Curriculum/${curriculumId}/Chapters/Reorder`,
        { chapters: chaptersOrder }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============== LESSON OPERATIONS ==============

  /**
   * Add a new lesson to a chapter
   */
  addLesson: async (curriculumId, chapterId, lessonData) => {
    try {
      const response = await api.post(
        `/Curriculum/${curriculumId}/Chapter/${chapterId}/Lesson`,
        lessonData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update lesson information
   */
  updateLesson: async (curriculumId, chapterId, lessonId, data) => {
    try {
      const response = await api.put(
        `/Curriculum/${curriculumId}/Chapter/${chapterId}/Lesson/${lessonId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete lesson from chapter
   */
  deleteLesson: async (curriculumId, chapterId, lessonId) => {
    try {
      const response = await api.delete(
        `/Curriculum/${curriculumId}/Chapter/${chapterId}/Lesson/${lessonId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============== DOCUMENT MANAGEMENT ==============

  /**
   * Upload document to curriculum
   * @param {string} curriculumId - Curriculum ID
   * @param {File} file - File to upload
   * @param {string} documentName - Optional document name
   */
  uploadDocument: async (curriculumId, file, documentName = null) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      if (documentName) {
        formData.append('name', documentName);
      }

      const response = await api.post(
        `/Curriculum/${curriculumId}/Document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete document from curriculum
   */
  deleteDocument: async (curriculumId, documentId) => {
    try {
      const response = await api.delete(
        `/Curriculum/${curriculumId}/Document/${documentId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============== PUBLISHING ==============

  /**
   * Publish curriculum to make it available to students
   */
  publishCurriculum: async (curriculumId) => {
    try {
      const response = await api.put(`/Curriculum/${curriculumId}/Publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Search and filter curriculums
   */
  searchCurriculums: async (query, filters = {}) => {
    try {
      const response = await api.get('/Curriculum/Teacher', {
        params: {
          search: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default curriculumService;
