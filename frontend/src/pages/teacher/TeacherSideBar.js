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
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { useState } from "react";

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

const TeacherSideBar = () => {
  const location = useLocation();
  const [expandAI, setExpandAI] = useState(false);

  const isActive = (path) => {
    if (path === "dashboard" && location.pathname.endsWith("/dashboard")) return true;
    if (path !== "dashboard" && location.pathname.includes(path)) return true;
    return false;
  };

  const menuItems = [
    { path: "dashboard", label: "Trang chủ", icon: <HomeIcon /> },
    { path: "class", label: "Lớp học", icon: <ClassOutlinedIcon /> },
    { path: "curriculum", label: "Giáo trình", icon: <MenuBookIcon /> },
    { path: "assignments", label: "Bài tập & Chấm bài", icon: <AssignmentIcon /> },
    { path: "question-bank", label: "Ngân hàng câu hỏi", icon: <QuestionAnswerIcon /> },
    { path: "analytics", label: "Phân tích học tập", icon: <AnalyticsIcon /> },
    { path: "discussion", label: " Thảo luận lớp học", icon: <ChatBubbleOutlineIcon /> },
  ];

  const aiItems = [
    { path: "ai-chat", label: "Chat AI", icon: <ChatBubbleOutlineIcon /> },
    { path: "ai-quiz", label: "Tạo Quiz AI", icon: <QuizIcon /> },
  ];

  const accountItems = [
    { path: "profile", label: " Hồ sơ", icon: <AccountCircleOutlinedIcon /> },
    { path: "/logout", label: " Đăng xuất", icon: <ExitToAppIcon /> },
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

      {/* AI Hỗ trợ giảng dạy */}
      <Tooltip title="AI Hỗ trợ giảng dạy" placement="right">
        <StyledListItemButton
          onClick={() => setExpandAI(!expandAI)}
          selected={location.pathname.includes("ai-")}
        >
          <StyledListItemIcon active={location.pathname.includes("ai-")}>
            <SmartToyIcon />
          </StyledListItemIcon>
          <StyledListItemText
            primary=" AI Hỗ trợ giảng dạy"
            active={location.pathname.includes("ai-")}
          />
          {expandAI ? <ExpandLess /> : <ExpandMore />}
        </StyledListItemButton>
      </Tooltip>

      {expandAI && (
        <div style={{ pl: 4 }}>
          {aiItems.map((item) => (
            <Tooltip title={item.label} placement="right" key={item.path}>
              <StyledListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{ pl: 6 }}
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
        </div>
      )}

      <Divider sx={{ my: 2, mx: 2 }} />

      <ListSubheader component="div" inset sx={{ fontWeight: 600, color: "#475569" }}>
        Người dùng
      </ListSubheader>

      {accountItems.map((item) => (
        <Tooltip title={item.label} placement="right" key={item.path}>
          <StyledListItemButton
            component={Link}
            to={item.path}
            selected={location.pathname.includes(item.path)}
          >
            <StyledListItemIcon active={location.pathname.includes(item.path)}>
              {item.icon}
            </StyledListItemIcon>
            <StyledListItemText
              primary={item.label}
              active={location.pathname.includes(item.path)}
            />
          </StyledListItemButton>
        </Tooltip>
      ))}
    </>
  );
};

export default TeacherSideBar;