// API service for teacher management

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : '/api';

// ============ Teacher Registration & Authentication ============

export const registerTeacher = async (data) => {
  const response = await fetch(`${API_BASE_URL}/TeacherReg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const loginTeacher = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/TeacherLogin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// ============ Teacher Management ============

/**
 * Get all teachers for a school
 * @param {string} schoolId - Admin/School ID
 * @returns {Promise<Array>} List of teachers
 */
export const getAllTeachers = async (schoolId) => {
  const response = await fetch(`${API_BASE_URL}/Teachers/${schoolId}`);
  return response.json();
};

/**
 * Get details of a specific teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} Teacher details
 */
export const getTeacherDetail = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/Teacher/${teacherId}`);
  return response.json();
};

/**
 * Get teacher with teaching assignments
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} Teacher with assignments
 */
export const getTeacherWithAssignments = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/Teacher/${teacherId}/WithAssignments`);
  return response.json();
};

/**
 * Get teacher statistics (subjects, classes, assignments created)
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} Teacher statistics
 */
export const getTeacherStats = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/Teacher/${teacherId}/Stats`);
  return response.json();
};

/**
 * Update teacher information
 * @param {string} teacherId - Teacher ID
 * @param {Object} data - Updated teacher data (name, email, teachSclass)
 * @returns {Promise<Object>} Updated teacher
 */
export const updateTeacher = async (teacherId, data) => {
  const response = await fetch(`${API_BASE_URL}/Teacher/${teacherId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Update teacher's subject assignment
 * @param {Object} data - { teacherId, teachSubject }
 * @returns {Promise<Object>} Updated teacher
 */
export const updateTeacherSubject = async (data) => {
  const response = await fetch(`${API_BASE_URL}/TeacherSubject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Reset teacher password
 * @param {string} teacherId - Teacher ID
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message and updated teacher
 */
export const resetTeacherPassword = async (teacherId, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/Teacher/${teacherId}/ResetPassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacherId,
      newPassword,
    }),
  });
  return response.json();
};

// ============ Teacher Deletion ============

/**
 * Delete a single teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTeacher = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/Teacher/${teacherId}`, {
    method: 'DELETE',
  });
  return response.json();
};

/**
 * Delete all teachers in a school
 * @param {string} schoolId - School ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTeachersBySchool = async (schoolId) => {
  const response = await fetch(`${API_BASE_URL}/Teachers/${schoolId}`, {
    method: 'DELETE',
  });
  return response.json();
};

/**
 * Delete all teachers in a class
 * @param {string} classId - Class ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTeachersByClass = async (classId) => {
  const response = await fetch(`${API_BASE_URL}/TeachersClass/${classId}`, {
    method: 'DELETE',
  });
  return response.json();
};

// ============ Teacher Attendance ============

/**

 * Bulk import teachers from CSV/Excel
 * @param {FormData} formData - Form data with file
 * @returns {Promise<Object>} Import result
 */
export const bulkImportTeachers = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/Teachers/BulkImport`, {
    method: 'POST',
    body: formData, // FormData with file
  });
  return response.json();
};

/**
 * Export teachers list as CSV
 * @param {string} schoolId - School ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportTeachers = async (schoolId) => {
  const response = await fetch(`${API_BASE_URL}/Teachers/${schoolId}/Export`);
  return response.blob();
};
