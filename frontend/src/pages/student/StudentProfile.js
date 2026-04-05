import React from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Avatar,
  Container,
  Paper,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Edit } from "@mui/icons-material";

// ─── Global style ──────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #f1f5f9;
  }
`;

// ─── Animations ────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────
const ProfileContainer = styled(Container)`
  margin-top: 2rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

// Card always has a strong, visible shadow (floating)
const StyledCard = styled(Card)`
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  margin-bottom: 1.5rem;
  background: white;
`;

const AvatarWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
`;

const LargeAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  font-size: 3rem;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled(Typography)`
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: #0f172a;
  border-left: 4px solid #2563eb;
  padding-left: 1rem;
`;

const InfoGrid = styled(Grid)`
  margin-top: 0.5rem;
`;

const InfoItem = styled(Paper)`
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: #f8fafc;
  box-shadow: none;
  height: 100%;
  transition: background 0.2s ease;
  &:hover {
    background: #f1f5f9;
  }
`;

const InfoLabel = styled(Typography)`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled(Typography)`
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
`;

// Edit button with static white text and icon
const EditButton = styled(Button)`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white !important;
  border-radius: 40px;
  padding: 10px 28px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
  transition: all 0.25s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    color: white !important;
  }

  & .MuiButton-startIcon {
    color: white !important;
  }
`;

const StudentProfile = () => {
  const { currentUser, response, error } = useSelector((state) => state.user);

  if (response) console.log(response);
  if (error) console.log(error);

  const sclassName = currentUser?.sclassName;
  const studentSchool = currentUser?.school;
  const studentName = currentUser?.name || "Học viên";
  const rollNum = currentUser?.rollNum || "Chưa cập nhật";
  const className = sclassName?.sclassName || "Chưa có lớp";
  const schoolName = studentSchool?.schoolName || "Chưa có trường";

  const personalFields = [
    { label: "Ngày sinh", value: currentUser?.dateOfBirth || "Chưa cập nhật" },
    { label: "Giới tính", value: currentUser?.gender || "Chưa cập nhật" },
    { label: "Email", value: currentUser?.email || "Chưa cập nhật" },
    { label: "Số điện thoại", value: currentUser?.phone || "Chưa cập nhật" },
    { label: "Địa chỉ", value: currentUser?.address || "Chưa cập nhật" },
    { label: "Liên hệ khẩn cấp", value: currentUser?.emergencyContact || "Chưa cập nhật" },
  ];

  return (
    <>
      <GlobalStyle />
      <ProfileContainer maxWidth="md">
        {/* Profile header card */}
        <StyledCard elevation={0}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <AvatarWrapper>
              <LargeAvatar>{studentName.charAt(0).toUpperCase()}</LargeAvatar>
            </AvatarWrapper>
            <Box textAlign="center" mb={2.5}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {studentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mã số sinh viên: {rollNum}
              </Typography>
            </Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <InfoItem elevation={0}>
                  <InfoLabel>Lớp</InfoLabel>
                  <InfoValue>{className}</InfoValue>
                </InfoItem>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem elevation={0}>
                  <InfoLabel>Trường</InfoLabel>
                  <InfoValue>{schoolName}</InfoValue>
                </InfoItem>
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="center" mt={3}>
              <EditButton
                component={Link}
                to="/student/form"
                startIcon={<Edit />}
              >
                Cập nhật thông tin cá nhân
              </EditButton>
            </Box>
          </CardContent>
        </StyledCard>

        {/* Personal Information Section */}
        <StyledCard elevation={0}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <SectionTitle variant="h6">Thông tin chi tiết</SectionTitle>
            <InfoGrid container spacing={2.5}>
              {personalFields.map((field, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <InfoItem elevation={0}>
                    <InfoLabel>{field.label}</InfoLabel>
                    <InfoValue>{field.value}</InfoValue>
                  </InfoItem>
                </Grid>
              ))}
            </InfoGrid>
          </CardContent>
        </StyledCard>
      </ProfileContainer>
    </>
  );
};

export default StudentProfile;