import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

const ViewSubject = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const schoolId = currentUser?._id;

  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "http://your-backend-api"
      : "http://localhost:5000";

  // States
  const [subject, setSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data on mount
  useEffect(() => {
    if (schoolId && subjectId) {
      loadSubjectDetails();
      loadClasses();
      loadTeachers();
      loadStudents();
    }
  }, [schoolId, subjectId]);

  // ========== API Functions ==========
  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/Subject/List/${schoolId}`;
      const response = await axios.get(url);
      if (response.data.subjects) {
        const found = response.data.subjects.find((s) => s._id === subjectId);
        if (found) {
          setSubject(found);
        } else {
          setError("Subject not found");
        }
      }
    } catch (err) {
      console.error("Error loading subject:", err);
      setError(err.response?.data?.message || "Error loading subject");
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const url = `${API_BASE_URL}/SclassList/${schoolId}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else if (response.data.sclasses) {
        setClasses(response.data.sclasses);
      }
    } catch (err) {
      console.error("Error loading classes:", err);
    }
  };

  const loadTeachers = async () => {
    try {
      const url = `${API_BASE_URL}/Teachers/${schoolId}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setTeachers(response.data);
      } else if (response.data.teachers) {
        setTeachers(response.data.teachers);
      }
    } catch (err) {
      console.error("Error loading teachers:", err);
    }
  };

  const loadStudents = async () => {
    try {
      const url = `${API_BASE_URL}/StudentList/${schoolId}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else if (response.data.students) {
        setStudents(response.data.students);
      }
    } catch (err) {
      console.error("Error loading students:", err);
    }
  };

  // Helper functions
  const getClassName = (classId) => {
    const cls = classes.find((c) => c._id === classId);
    return cls?.sclassName || "Unknown";
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher?.name || "Unknown";
  };

  const getStudentCountForClass = (classId) => {
    return students.filter(
      (student) => student.sclassName === classId
    ).length;
  };

  // ========== Render ==========
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!subject) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Subject not found</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          📖 {subject.subName}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Classes Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          🏫 Danh sách các lớp
        </Typography>

        {subject.classes && subject.classes.length > 0 ? (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tên lớp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Số sinh viên
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Tên giáo viên chủ nhiệm
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subject.classes.map((classAssignment) => (
                  <TableRow key={classAssignment.classId} hover>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {getClassName(classAssignment.classId)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={500}>
                        {getStudentCountForClass(classAssignment.classId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {getTeacherName(classAssignment.teacherId)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Alert severity="info">Chưa có lớp nào được gán môn học này</Alert>
        )}
      </Paper>
    </Container>
  );
};

export default ViewSubject;
