import * as React from "react";
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import ReportIcon from "@mui/icons-material/Report";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PoliticalChatbot from "../../components/PoliticalChatbot";

const SideBar = () => {
  const location = useLocation();
  const [chatbotOpen, setChatbotOpen] = React.useState(false);
  
  const handleChatbotOpen = () => {
    setChatbotOpen(true);
  };

  const handleChatbotClose = () => {
    setChatbotOpen(false);
  };
  
  return (
    <>
      <React.Fragment>
        {/* Home button */}
        <ListItemButton component={Link} to="/">
          <Tooltip title={"Home"}>
            <ListItemIcon>
              <HomeIcon
                color={
                  location.pathname === ("/" || "/Admin/dashboard")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Home" />
        </ListItemButton>
        
        {/* Chatbot button */}
        <ListItemButton onClick={handleChatbotOpen}>
          <Tooltip title="Political Theory AI Assistant - Click to open chatbot">
            <ListItemIcon>
              <SmartToyIcon 
                color="inherit" 
                sx={{ 
                  color: chatbotOpen ? 'primary.main' : 'inherit',
                  animation: chatbotOpen ? 'pulse 2s infinite' : 'none'
                }} 
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText 
            primary="AI Assistant" 
            sx={{
              color: chatbotOpen ? 'primary.main' : 'inherit',
              fontWeight: chatbotOpen ? 'bold' : 'normal'
            }}
          />
        </ListItemButton>
        
        {/* Classes button */}
        <ListItemButton component={Link} to="/Admin/classes">
          <Tooltip title={"Classes"}>
            <ListItemIcon>
              <ClassOutlinedIcon
                color={
                  location.pathname.startsWith("/Admin/classes")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Classes" />
        </ListItemButton>
        
        {/* Subjects button */}
        <ListItemButton component={Link} to="/Admin/subjects">
          <Tooltip title={"Subjects"}>
            <ListItemIcon>
              <AssignmentIcon
                color={
                  location.pathname.startsWith("/Admin/subjects")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Subjects" />
        </ListItemButton>
        
        {/* Teachers button */}
        <ListItemButton component={Link} to="/Admin/teachers">
          <Tooltip title={"Teachers"}>
            <ListItemIcon>
              <SupervisorAccountOutlinedIcon
                color={
                  location.pathname.startsWith("/Admin/teachers")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Teachers" />
        </ListItemButton>
        
        {/* Students button */}
        <ListItemButton component={Link} to="/Admin/students">
          <Tooltip title={"Students"}>
            <ListItemIcon>
              <PersonOutlineIcon
                color={
                  location.pathname.startsWith("/Admin/students")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Students" />
        </ListItemButton>
        
        {/* Notices button */}
        <ListItemButton component={Link} to="/Admin/notices">
          <Tooltip title={"Notice"}>
            <ListItemIcon>
              <AnnouncementOutlinedIcon
                color={
                  location.pathname.startsWith("/Admin/notices")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Notices" />
        </ListItemButton>
        
        {/* Complains button */}
        <ListItemButton component={Link} to="/Admin/complains">
          <Tooltip title={"Complains"}>
            <ListItemIcon>
              <ReportIcon
                color={
                  location.pathname.startsWith("/Admin/complains")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Complains" />
        </ListItemButton>
      </React.Fragment>
      
      <Divider sx={{ my: 1 }} />
      
      <React.Fragment>
        {/* User section */}
        <ListSubheader component="div" inset>
          User
        </ListSubheader>
        
        <ListItemButton component={Link} to="/Admin/profile">
          <Tooltip title={"Profile"}>
            <ListItemIcon>
              <AccountCircleOutlinedIcon
                color={
                  location.pathname.startsWith("/Admin/profile")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Profile" />
        </ListItemButton>
        
        {/* Logout button */}
        <ListItemButton component={Link} to="/logout">
          <Tooltip title={"Logout"}>
            <ListItemIcon>
              <ExitToAppIcon
                color={
                  location.pathname.startsWith("/logout")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </React.Fragment>
      
      {/* Chatbot Modal - Sửa thành Dialog để hiển thị đúng */}
      <Dialog
        open={chatbotOpen}
        onClose={handleChatbotClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '85vh',
            maxHeight: '85vh',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <PoliticalChatbot open={chatbotOpen} onClose={handleChatbotClose} />
        </DialogContent>
      </Dialog>

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </>
  );
};

export default SideBar;