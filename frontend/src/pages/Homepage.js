/* eslint-disable no-unused-vars */
import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import Students from "../assets/homepage.png";
import TLU from "../assets/tlu.png";

// ─── Global Styles (improved) ─────────────────────────────────────────
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

  /* Consistent heading styles */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
  }
`;

// ─── Animations (unchanged but polished) ──────────────────────────────
const riseIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const textclip = keyframes`
  to { background-position: 200% center; }
`;

const floatImage = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

// ─── Layout ───────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0 20px;
    height: 70px;
  }
`;

const LogoImage = styled.img`
  height: 42px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const NavRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NavLink = styled.a`
  padding: 8px 16px;
  border-radius: 40px;
  color: #334155;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    background: #eef2ff;
    color: #1e40af;
  }
`;

const NavCta = styled(Link)`
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 40px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(30, 64, 175, 0.25);
  }
`;

// ─── Hero Section ─────────────────────────────────────────────────────
const Hero = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 4rem 2rem;
  flex: 1;

  @media (max-width: 1024px) {
    gap: 3rem;
    padding: 3rem 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
    padding: 2rem 1.5rem;
  }
`;

const Content = styled.div`
  animation: ${riseIn} 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);

  @media (max-width: 768px) {
    order: 2;
  }
`;

const Headline = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  color: #0f172a;
  margin-bottom: 1rem;

  @media (max-width: 1024px) {
    font-size: 2.8rem;
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #f97316 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${textclip} 5s linear infinite;
`;

const Sub = styled.p`
  margin-top: 1.25rem;
  color: #334155;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 90%;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
`;

const BtnGroup = styled.div`
  margin-top: 2.25rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const PrimaryBtn = styled(Link)`
  padding: 0.85rem 2rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  border-radius: 40px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const RegisterHint = styled.p`
  font-size: 0.95rem;
  color: #475569;
  font-weight: 500;

  a {
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #1e3a8a;
      text-decoration: underline;
    }
  }
`;

// ─── Image Container ──────────────────────────────────────────────────
const ImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    order: 1;
  }
`;

const Img = styled.img`
  width: 100%;
  max-width: 520px;
  height: auto;
  animation: ${floatImage} 4s ease-in-out infinite;
  border-radius: 24px;
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.01);
  }

  @media (max-width: 768px) {
    max-width: 80%;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

// ─── Footer ───────────────────────────────────────────────────────────
const Footer = styled.footer`
  text-align: center;
  padding: 1.5rem 1rem;
  background: white;
  font-size: 0.85rem;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
`;

// ─── Component ────────────────────────────────────────────────────────
const Homepage = () => {
  return (
    <>
      <GlobalStyle />

      <Page>
        <Nav>
          <Link to="/">
            <LogoImage src={TLU} alt="TLU Logo" />
          </Link>

          <NavRight>
            <NavLink href="#">Giới thiệu</NavLink>
            <NavLink href="#">Hỗ trợ</NavLink>
            <NavCta to="/choose">Đăng nhập</NavCta>
          </NavRight>
        </Nav>

        <Hero>
          <Content>
            <Headline>
              <GradientText>Hệ thống LMS - TLU</GradientText>
              <br />
              Tự hào truyền thống
              <br />
              Kết nối sáng tạo
            </Headline>

            <Sub>
              Nền tảng quản lý học tập dành cho Đại học Thủy Lợi,
              giúp kết nối sinh viên, giảng viên và lớp học một cách nhanh chóng,
              minh bạch và hiệu quả.
            </Sub>

            <BtnGroup>
              <PrimaryBtn to="/choose">Đăng nhập</PrimaryBtn>
              <RegisterHint>
                Chưa có tài khoản? <Link to="/Adminregister">Đăng ký</Link>
              </RegisterHint>
            </BtnGroup>
          </Content>

          <ImageWrapper>
            <Img src={Students} alt="Students illustration" />
          </ImageWrapper>
        </Hero>

        <Footer>Copyright © 2021 - Phát triển bởi Sinh viên Đại học Thủy Lợi</Footer>
      </Page>
    </>
  );
};

export default Homepage;