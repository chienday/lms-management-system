/* eslint-disable no-unused-vars */
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
import Logout from "../Logout";
import SideBar from "./SideBar";
import AdminProfile from "./AdminProfile";
import AdminHomePage from "./AdminHomePage";

import AddStudent from "./studentRelated/AddStudent";
import ImportStudent from "./studentRelated/ImportStudent";
import ShowStudents from "./studentRelated/ShowStudents";
import StudentExamMarks from "./studentRelated/StudentExamMarks";
import ViewStudent from "./studentRelated/ViewStudent";

import AddNotice from "./noticeRelated/AddNotice";
import ShowNotices from "./noticeRelated/ShowNotices";

import AdminSubjectManagement from "./AdminSubjectManagement";
import ViewSubject from "./subjectRelated/ViewSubject";
import EditSubject from "./subjectRelated/EditSubject";

import AddTeacher from "./teacherRelated/AddTeacher";
import ChooseClass from "./teacherRelated/ChooseClass";
import ChooseSubject from "./teacherRelated/ChooseSubject";
import ShowTeachers from "./teacherRelated/ShowTeachers";
import TeacherDetails from "./teacherRelated/TeacherDetails";
import AdminTeacherManagement from "./AdminTeacherManagement";
import TeachingAssignmentManager from "./TeachingAssignmentManager";

import AddClass from "./classRelated/AddClass";
import ClassDetails from "./classRelated/ClassDetails";
import ShowClasses from "./classRelated/ShowClasses";
import AccountMenu from "../../components/AccountMenu";

// ─── Global style for consistent background ───────────────────────────
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #f1f5f9;
  }
`;

// ─── Styled components ─────────────────────────────────────────────────
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
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  & svg {
    color: white;
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

// ─── AdminDashboard component ──────────────────────────────────────────
const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const [, setHasData] = useState(false);

  const toggleDrawer = () => setOpen(!open);
  const addData = () => setHasData(true);
  const removeData = () => setHasData(false);

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
              LMS Admin Dashboard
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
              <SideBar />
            </List>
          </DrawerContent>
        </DrawerStyled>

        <MainContent open={open} component="main">
          <Toolbar /> {/* spacer for fixed app bar */}
          <Routes>
            <Route path="/" element={<AdminHomePage />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/Admin/dashboard" element={<AdminHomePage />} />
            <Route path="/Admin/profile" element={<AdminProfile />} />

            {/* Notice */}
            <Route path="/Admin/addnotice" element={<AddNotice />} />
            <Route path="/Admin/notices" element={<ShowNotices />} />

            {/* Subject */}
            <Route path="/Admin/subjects" element={<AdminSubjectManagement />} />
            <Route
              path="/Admin/subjects/subject/:id"
              element={<ViewSubject />}
            />
            <Route
              path="/Admin/subjects/edit/:id"
              element={<EditSubject />}
            />
            <Route

              path="/Admin/subject/student/marks/:studentID/:subjectID"
              element={<StudentExamMarks situation="Subject" />}
            />

            {/* Class */}
            <Route path="/Admin/addclass" element={<AddClass />} />
            <Route path="/Admin/classes" element={<ShowClasses />} />
            <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
            <Route
              path="/Admin/class/addstudents/:id"
              element={<AddStudent situation="Class" />}
            />

            {/* Student */}
            <Route
              path="/Admin/addstudents"
              element={<AddStudent situation="Student" />}
            />
            <Route
              path="/Admin/importstudents"
              element={<ImportStudent />}
            />
            <Route path="/Admin/students" element={<ShowStudents />} />
            <Route
              path="/Admin/students/student/:id"
              element={<ViewStudent />}
            />
            <Route

              path="/Admin/students/student/marks/:id"
              element={<StudentExamMarks situation="Student" />}
            />

            {/* Teacher */}
            <Route path="/Admin/teachers" element={<AdminTeacherManagement />} />
            <Route path="/Admin/teachers/list" element={<ShowTeachers />} />
            <Route path="/Admin/teaching-assignments" element={<TeachingAssignmentManager />} />
            <Route
              path="/Admin/teachers/teacher/:id"
              element={<TeacherDetails />}
            />
            <Route
              path="/Admin/teachers/chooseclass"
              element={<ChooseClass situation="Teacher" />}
            />
            <Route
              path="/Admin/teachers/choosesubject/:id"
              element={<ChooseSubject situation="Norm" />}
            />
            <Route
              path="/Admin/teachers/choosesubject/:classID/:teacherID"
              element={<ChooseSubject situation="Teacher" />}
            />
            <Route
              path="/Admin/teachers/addteacher/:id"
              element={<AddTeacher />}
            />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </MainContent>
      </Box>
    </>
  );
};

export default AdminDashboard;