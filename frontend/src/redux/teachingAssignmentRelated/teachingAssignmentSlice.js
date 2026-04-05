import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  teachingAssignments: [],
  loading: false,
  error: null,
  selectedSubjectId: null,
  selectedClasses: [],
};

const teachingAssignmentSlice = createSlice({
  name: "teachingAssignment",
  initialState,
  reducers: {
    // Get teaching assignments request started
    getTeachingAssignmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Get teaching assignments success
    getTeachingAssignmentsSuccess: (state, action) => {
      state.loading = false;
      state.teachingAssignments = action.payload;
    },
    // Get teaching assignments failed
    getTeachingAssignmentsFailure: (state, action) => {
      state.loading = false;
      const error = action.payload;
      if (error && typeof error === 'object') {
        state.error = {
          message: error.message || 'An error occurred',
          status: error.response?.status || error.status || null,
          code: error.code || null
        };
      } else {
        state.error = error;
      }
    },
    // Set selected subject
    setSelectedSubject: (state, action) => {
      state.selectedSubjectId = action.payload;
      // Update selected classes based on subject
      const assignment = state.teachingAssignments.find(
        (ta) => ta.subject?._id === action.payload
      );
      state.selectedClasses = assignment?.classes || [];
    },
    // Update selected classes
    setSelectedClasses: (state, action) => {
      state.selectedClasses = action.payload;
    },
    // Clear assignments
    clearAssignments: (state) => {
      state.teachingAssignments = [];
      state.selectedSubjectId = null;
      state.selectedClasses = [];
      state.error = null;
    },
  },
});

export const {
  getTeachingAssignmentsRequest,
  getTeachingAssignmentsSuccess,
  getTeachingAssignmentsFailure,
  setSelectedSubject,
  setSelectedClasses,
  clearAssignments,
} = teachingAssignmentSlice.actions;

export default teachingAssignmentSlice.reducer;

// Async actions
export const getTeacherTeachingAssignments =
  (teacherId) => async (dispatch) => {
    dispatch(getTeachingAssignmentsRequest());
    try {
      const API_BASE_URL =
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_API_URL || "http://localhost:5000"
          : "http://localhost:5000";

      const response = await fetch(
        `${API_BASE_URL}/TeachingAssignment/Teacher/${teacherId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load teaching assignments: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.assignments && Array.isArray(data.assignments)) {
        dispatch(getTeachingAssignmentsSuccess(data.assignments));
        
        // Set first subject as default if available
        if (data.assignments.length > 0) {
          dispatch(setSelectedSubject(data.assignments[0].subject?._id));
        }
      } else {
        dispatch(getTeachingAssignmentsSuccess([]));
      }
    } catch (error) {
      dispatch(
        getTeachingAssignmentsFailure(
          error.message || "Failed to load teaching assignments"
        )
      );
    }
  };

export const getTeacherClassesBySubject =
  (teacherId, subjectId) => async (dispatch) => {
    try {
      const API_BASE_URL =
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_API_URL || "http://localhost:5000"
          : "http://localhost:5000";

      const response = await fetch(
        `${API_BASE_URL}/TeachingAssignment/Classes/${teacherId}/${subjectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load classes: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch(setSelectedClasses(data.classes || []));
    } catch (error) {
      dispatch(
        getTeachingAssignmentsFailure(
          error.message || "Failed to load classes"
        )
      );
    }
  };
