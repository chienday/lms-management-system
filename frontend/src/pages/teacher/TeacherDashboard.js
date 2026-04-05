import { useState } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Navigate, Route, Routes } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";

import TeacherSideBar from "./TeacherSideBar";
import Logout from "../Logout";
import AccountMenu from "../../components/AccountMenu";

import TeacherHomePage from "./TeacherHomePage";
import TeacherProfile from "./TeacherProfile";
import TeacherClassDetails from "./TeacherClassDetails";
import TeacherViewStudent from "./TeacherViewStudent";
import TeacherTeachingAssignments from "./TeacherTeachingAssignments";
import TeacherAssignments from "./TeacherAssignments";
import TeacherSubmissionViewPage from "./TeacherSubmissionViewPage";
import CurriculumList from "./curriculum/CurriculumList";
import CurriculumDetail from "./curriculum/CurriculumDetail";

import StudentExamMarks from "../admin/studentRelated/StudentExamMarks";

// ─── Global style for consistent font ───────────────────────────────
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #f1f5f9;
  }
`;

// ─── Styled components ──────────────────────────────────────────────
const AppBarStyled = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ToolbarStyled = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  min-height: 64px;
`;

const MenuButton = styled(IconButton)`
  margin-right: 24px;
  color: white;
  & svg {
    color: white;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  ${({ open }) => open && `display: none;`}
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: -0.3px;
  flex-grow: 1;
`;

const DrawerStyled = styled.div`
  width: ${({ open }) => (open ? "260px" : "0px")};
  flex-shrink: 0;
  transition: width 0.3s ease;
  overflow-x: hidden;
  background: white;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.03);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1199;
`;

const DrawerHeader = styled(Toolbar)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  min-height: 64px;
  background: white;
`;

const DrawerContent = styled.div`
  padding: 8px 0;
`;

const MainContent = styled(Box)`
  background-color: #f8fafc;
  flex-grow: 1;
  min-height: 100vh;
  margin-left: ${({ open }) => (open ? "260px" : "0px")};
  transition: margin-left 0.3s ease;
  padding: 24px;
`;

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen(!open);

  return (
    <>
      <GlobalStyle />
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBarStyled>
          <ToolbarStyled>
            <MenuButton open={open} onClick={toggleDrawer} edge="start">
              <MenuIcon />
            </MenuButton>
            <Title variant="h6" noWrap>
              Bảng điều khiển giảng viên
            </Title>
            <AccountMenu />
          </ToolbarStyled>
        </AppBarStyled>

        <DrawerStyled open={open}>
          <DrawerHeader>
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <DrawerContent>
            <List component="nav">
              <TeacherSideBar />
            </List>
          </DrawerContent>
        </DrawerStyled>

        <MainContent open={open} component="main">
          <Toolbar /> {/* spacer for fixed app bar */}
          <Routes>
            <Route index element={<TeacherHomePage />} />
            <Route path="dashboard" element={<TeacherHomePage />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="class" element={<TeacherTeachingAssignments />} />
            <Route path="class-details" element={<TeacherClassDetails />} />
            <Route path="class/student/:id" element={<TeacherViewStudent />} />
            <Route
              path="class/student/marks/:studentID/:subjectID"
              element={<StudentExamMarks situation="Subject" />}
            />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="submissions/:assignmentId" element={<TeacherSubmissionViewPage />} />
            <Route path="curriculum" element={<CurriculumList />} />
            <Route path="curriculum/:id" element={<CurriculumDetail />} />
            <Route path="logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </MainContent>
      </Box>
    </>
  );
};

export default TeacherDashboard;