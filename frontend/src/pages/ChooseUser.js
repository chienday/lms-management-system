import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { AccountCircle, School, Group } from "@mui/icons-material";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/userRelated/userHandle";
import Popup from "../components/Popup";

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(
    (state) => state.user
  );

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    // Security fix: Disable hardcoded guest login in production
    // Only allow guest login in development with proper credentials
    const ENABLE_GUEST_LOGIN = process.env.REACT_APP_ENABLE_GUEST === "true";

    if (user === "Admin") {
      if (visitor === "guest" && ENABLE_GUEST_LOGIN) {
        const email = process.env.REACT_APP_DEMO_ADMIN_EMAIL || "admin@demo.com";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate("/Adminlogin");
      }
    } else if (user === "Student") {
      if (visitor === "guest" && ENABLE_GUEST_LOGIN) {
        const rollNum = process.env.REACT_APP_DEMO_STUDENT_ROLL || "1";
        const studentName = process.env.REACT_APP_DEMO_STUDENT_NAME || "Demo Student";
        const fields = { rollNum, studentName, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate("/Studentlogin");
      }
    } else if (user === "Teacher") {
      if (visitor === "guest" && ENABLE_GUEST_LOGIN) {
        const email = process.env.REACT_APP_DEMO_TEACHER_EMAIL || "teacher@demo.com";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate("/Teacherlogin");
      }
    }
  };

  useEffect(() => {
    if (status === "success" || currentUser !== null) {
      if (currentRole === "Admin") {
        navigate("/Admin/dashboard");
      } else if (currentRole === "Student") {
        navigate("/Student/dashboard");
      } else if (currentRole === "Teacher") {
        navigate("/Teacher/dashboard");
      }
    } else if (status === "error") {
      setLoader(false);
      setMessage("Lỗi kết nối mạng");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <Container>
        <StyledGrid container spacing={2} justifyContent="center">

          {/* ADMIN */}
          <Grid item xs={12} sm={6} md={4}>
            <div onClick={() => navigateHandler("Admin")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <AccountCircle fontSize="large" />
                </Box>
                <StyledTypography>Quản trị viên</StyledTypography>
                Đăng nhập với quyền quản trị để truy cập hệ thống và quản lý dữ liệu.
              </StyledPaper>
            </div>
          </Grid>

          {/* STUDENT */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3}>
              <div onClick={() => navigateHandler("Student")}>
                <Box mb={2}>
                  <School fontSize="large" />
                </Box>
                <StyledTypography>Sinh viên</StyledTypography>
                Đăng nhập để xem tài liệu học tập, bài tập và các tài nguyên liên quan.
              </div>
            </StyledPaper>
          </Grid>

          {/* TEACHER */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3}>
              <div onClick={() => navigateHandler("Teacher")}>
                <Box mb={2}>
                  <Group fontSize="large" />
                </Box>
                <StyledTypography>Giảng viên</StyledTypography>
                Đăng nhập để tạo khóa học, giao bài tập và theo dõi tiến độ học tập.
              </div>
            </StyledPaper>
          </Grid>

        </StyledGrid>
      </Container>

      {/* Loader */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <CircularProgress color="inherit" />
        <span style={{ marginLeft: "10px" }}>Vui lòng chờ...</span>
      </Backdrop>

      {/* Popup */}
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </StyledContainer>
  );
};

export default ChooseUser;

// STYLE giữ nguyên
const StyledContainer = styled.div`
  background: linear-gradient(to bottom, #4b1d70, #19118b);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  text-align: center;
  background-color: #1f1f38;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;

  &:hover {
    background-color: #07005b;
    color: white;
  }
`;

const StyledGrid = styled(Grid)`
  max-width: 1500px;
`;

const StyledTypography = styled.h2`
  margin-bottom: 10px;
`;