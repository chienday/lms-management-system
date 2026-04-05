// API service for assignment management

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : '/api';

// ============ Teaching Assignment APIs ============

export const createTeachingAssignment = async (data) => {
  const response = await fetch(`${API_BASE_URL}/TeachingAssignment/Create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getTeacherAssignments = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/TeachingAssignment/Teacher/${teacherId}`);
  return response.json();
};

export const getTeacherClassesBySubject = async (teacherId, subjectId) => {
  const response = await fetch(`${API_BASE_URL}/TeachingAssignment/Classes/${teacherId}/${subjectId}`);
  return response.json();
};

export const updateTeachingAssignment = async (assignmentId, data) => {
  const response = await fetch(`${API_BASE_URL}/TeachingAssignment/${assignmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteTeachingAssignment = async (assignmentId) => {
  const response = await fetch(`${API_BASE_URL}/TeachingAssignment/${assignmentId}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const getAllTeachingAssignments = async (schoolId) => {
  const response = await fetch(`${API_BASE_URL}/TeachingAssignment/All/${schoolId}`);
  return response.json();
};

// ============ Assignment APIs ============

export const createAssignment = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/Assignment/Create`, {
    method: 'POST',
    body: formData, // FormData with file
  });
  return response.json();
};

export const getTeacherAssignmentsList = async (teacherId, subjectId) => {
  let url = `${API_BASE_URL}/Assignment/Teacher/${teacherId}`;
  const params = new URLSearchParams();
  if (subjectId) params.append('subjectId', subjectId);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url);
  return response.json();
};

export const getStudentAssignments = async (studentId, subjectId) => {
  let url = `${API_BASE_URL}/Assignment/Student/${studentId}`;
  const params = new URLSearchParams();
  if (subjectId) params.append('subjectId', subjectId);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url);
  return response.json();
};

export const submitAssignment = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/Assignment/Submit`, {
    method: 'POST',
    body: formData, // FormData with file
  });
  return response.json();
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await fetch(`${API_BASE_URL}/Assignment/${assignmentId}/Submissions`);
  return response.json();
};

export const gradeSubmission = async (submissionId, data) => {
  const response = await fetch(`${API_BASE_URL}/Assignment/Grade/${submissionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteAssignment = async (assignmentId) => {
  const response = await fetch(`${API_BASE_URL}/Assignment/${assignmentId}`, {
    method: 'DELETE',
  });
  return response.json();
};
