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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";

import AssignmentIcon from "@mui/icons-material/Assignment";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

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

const SideBar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    { path: "/", label: "Trang chủ", icon: <HomeIcon /> },
    { path: "/Admin/classes", label: "Quản lý lớp học", icon: <ClassOutlinedIcon /> },
    { path: "/Admin/subjects", label: "Quản lý môn học", icon: <AssignmentIcon /> },
    { path: "/Admin/teachers", label: "Quản lý giảng viên", icon: <SupervisorAccountOutlinedIcon /> },
    { path: "/Admin/teaching-assignments", label: "Phân công giảng dạy", icon: <PlaylistAddCheckIcon /> },
    { path: "/Admin/students", label: "Quản lý sinh viên", icon: <PersonOutlineIcon /> },
    { path: "/Admin/notices", label: "Quản lý thông báo", icon: <AnnouncementOutlinedIcon /> },
  ];

  const accountItems = [
    { path: "/Admin/profile", label: "Hồ sơ", icon: <AccountCircleOutlinedIcon /> },
    { path: "/logout", label: "Đăng xuất", icon: <ExitToAppIcon /> },
  ];

  return (
    <>
      <React.Fragment>
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
      </React.Fragment>

      <Divider sx={{ my: 2, mx: 2 }} />

      <React.Fragment>
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
      </React.Fragment>
    </>
  );
};

export default SideBar;