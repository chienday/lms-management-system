import React from "react";
import { useSelector } from "react-redux";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { Person, Email, School, Edit } from "@mui/icons-material";
import { Avatar, IconButton } from "@mui/material";

// ─── Global Style (consistent with other pages) ──────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
    color: #0f172a;
    line-height: 1.5;
  }
`;

// ─── Animations ────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Layout Components ────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
`;

const Card = styled.div`
  max-width: 700px;
  width: 100%;
  background: white;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: ${fadeIn} 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  padding: 2rem;
  text-align: center;
  color: white;
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const StyledAvatar = styled(Avatar)`
  width: 100px;
  height: 100px;
  background: white;
  color: #1e3a8a;
  font-size: 2.5rem;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
`;

const CardTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
`;

const CardSubtitle = styled.p`
  font-size: 0.9rem;
  margin-top: 0.5rem;
  opacity: 0.9;
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const IconWrapper = styled.div`
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
`;

const EditButton = styled(IconButton)`
  color: #94a3b8;
  transition: color 0.2s ease;
  &:hover {
    color: #2563eb;
  }
`;

// ─── Component ────────────────────────────────────────────────────────
const AdminProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    // Get initials for avatar (first letters of name, uppercase)
    const getInitials = (name) => {
        if (!name) return "A";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const initials = getInitials(currentUser?.name);

    return (
        <>
            <GlobalStyle />
            <Page>
                <Card>
                    <CardHeader>
                        <AvatarWrapper>
                            <StyledAvatar>{initials}</StyledAvatar>
                        </AvatarWrapper>
                        <CardTitle>Hồ sơ quản trị viên</CardTitle>
                        <CardSubtitle>Quản lý thông tin cá nhân</CardSubtitle>
                    </CardHeader>

                    <CardBody>
                        <InfoRow>
                            <IconWrapper>
                                <Person />
                            </IconWrapper>
                            <InfoContent>
                                <InfoLabel>Họ và tên</InfoLabel>
                                <InfoValue>{currentUser?.name || "Chưa cập nhật"}</InfoValue>
                            </InfoContent>
                            <EditButton size="small">
                                <Edit fontSize="small" />
                            </EditButton>
                        </InfoRow>

                        <InfoRow>
                            <IconWrapper>
                                <Email />
                            </IconWrapper>
                            <InfoContent>
                                <InfoLabel>Email</InfoLabel>
                                <InfoValue>{currentUser?.email || "Chưa cập nhật"}</InfoValue>
                            </InfoContent>
                            <EditButton size="small">
                                <Edit fontSize="small" />
                            </EditButton>
                        </InfoRow>

                        <InfoRow>
                            <IconWrapper>
                                <School />
                            </IconWrapper>
                            <InfoContent>
                                <InfoLabel>Trường học</InfoLabel>
                                <InfoValue>{currentUser?.schoolName || "Chưa có"}</InfoValue>
                            </InfoContent>
                            <EditButton size="small">
                                <Edit fontSize="small" />
                            </EditButton>
                        </InfoRow>
                    </CardBody>
                </Card>
            </Page>
        </>
    );
};

export default AdminProfile;