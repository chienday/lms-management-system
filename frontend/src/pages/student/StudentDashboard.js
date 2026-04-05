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
import StudentSideBar from "./StudentSideBar";
import StudentHomePage from "./StudentHomePage";
import StudentProfile from "./StudentProfile";
import StudentForm from "./StudentForm";
import StudentSubjects from "./StudentSubjects";
import ViewStdAttendance from "./ViewStdAttendance";
import StudentChatbot from "./StudentChatbot";
import StudentAssignments from "./StudentAssignments";
import Logout from "../Logout";
import AccountMenu from "../../components/AccountMenu";

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

const StudentDashboard = () => {
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
              Bảng điều khiển sinh viên 
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
              <StudentSideBar />
            </List>
          </DrawerContent>
        </DrawerStyled>

        <MainContent open={open} component="main">
          <Toolbar /> {/* spacer for fixed app bar */}
          <Routes>
            <Route path="/" element={<StudentHomePage />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/Student/dashboard" element={<StudentHomePage />} />
            <Route path="/Student/profile" element={<StudentProfile />} />
            <Route path="/Student/form" element={<StudentForm />} />
            <Route path="/Student/subjects" element={<StudentSubjects />} />
            <Route path="/Student/attendance" element={<ViewStdAttendance />} />
            <Route path="/Student/chatbot" element={<StudentChatbot />} />
            <Route path="/Student/assignments" element={<StudentAssignments />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </MainContent>
      </Box>
    </>
  );
};

export default StudentDashboard;