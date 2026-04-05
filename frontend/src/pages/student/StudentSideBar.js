import React from "react";
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

const StyledListItemButton = styled(ListItemButton)`
  border-radius: 12px;
  margin: 4px 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #eef2ff;
  }

  &.Mui-selected,
  &.Mui-selected:hover {
    background-color: #e0e7ff;
  }
`;

const StyledListItemIcon = styled(ListItemIcon)`
  color: ${({ active }) => (active ? "#2563eb" : "#64748b")};
  min-width: 40px;
`;

const StyledListItemText = styled(ListItemText)`
  & .MuiListItemText-primary {
    font-weight: ${({ active }) => (active ? "600" : "500")};
    color: ${({ active }) => (active ? "#1e3a8a" : "#334155")};
    font-size: 0.9rem;
  }
`;

const StudentSideBar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && (location.pathname === "/" || location.pathname === "/Student/dashboard")) return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    { path: "/", label: "Trang chủ", icon: <HomeIcon /> },
    { path: "/Student/subjects", label: "Môn học", icon: <ClassOutlinedIcon /> },
    { path: "/Student/assignments", label: "Bài tập", icon: <AssignmentIcon /> },
    { path: "/Student/attendance", label: "Điểm danh", icon: <ClassOutlinedIcon /> },
    { path: "/Student/chatbot", label: "Chatbot học tập", icon: <SmartToyOutlinedIcon /> },
  ];

  const accountItems = [
    { path: "/Student/profile", label: "Hồ sơ", icon: <AccountCircleOutlinedIcon /> },
    { path: "/logout", label: "Đăng xuất", icon: <ExitToAppIcon /> },
  ];

  return (
    <>
      {menuItems.map((item) => (
        <Tooltip title={item.label} placement="right" key={item.path}>
          <StyledListItemButton
            component={Link}
            to={item.path}
            selected={isActive(item.path)}
          >
            <StyledListItemIcon active={isActive(item.path)}>
              {item.icon}
            </StyledListItemIcon>
            <StyledListItemText
              primary={item.label}
              active={isActive(item.path)}
            />
          </StyledListItemButton>
        </Tooltip>
      ))}

      <Divider sx={{ my: 2, mx: 2 }} />

      <ListSubheader component="div" inset sx={{ fontWeight: 600, color: "#475569" }}>
        Tài khoản
      </ListSubheader>
      {accountItems.map((item) => (
        <Tooltip title={item.label} placement="right" key={item.path}>
          <StyledListItemButton
            component={Link}
            to={item.path}
            selected={isActive(item.path)}
          >
            <StyledListItemIcon active={isActive(item.path)}>
              {item.icon}
            </StyledListItemIcon>
            <StyledListItemText
              primary={item.label}
              active={isActive(item.path)}
            />
          </StyledListItemButton>
        </Tooltip>
      ))}
    </>
  );
};

export default StudentSideBar;