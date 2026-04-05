// Import necessary modules and components
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Box, Typography, CircularProgress
} from '@mui/material';
import styled from 'styled-components';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
`;

// Define the SeeComplains component
const SeeComplains = () => {
  // Initialize dispatch and get data from Redux store
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector(state => state.complain);
  const { currentUser } = useSelector(state => state.user);

  // Fetch all complains when the component mounts
  useEffect(() => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
  }, [currentUser._id, dispatch]);

  // Log any errors to the console
  if (error) {
    console.error(error);
  }

  // Define the columns for the complains table
  const complainColumns = [
    { id: 'user', label: 'Sinh viên', minWidth: 170 },
    { id: 'complaint', label: 'Nội dung khiếu nại', minWidth: 300 },
    { id: 'date', label: 'Ngày', minWidth: 170 },
  ];

  // Filter out invalid complaints before mapping
  const validComplainsList = complainsList?.filter(complain => {
    if (!complain || !complain.user || !complain.user.name) {
      console.warn("Invalid complaint data:", complain);
      return false; // Filter out this complaint
    }
    return true; // Keep valid complaints
  });

  // Map the valid complains data to the table rows format
  const complainRows = validComplainsList?.map(complain => ({
    user: complain.user.name,
    complaint: complain.complaint || "Không có nội dung",
    date: complain.date ? new Date(complain.date).toISOString().substring(0, 10) : "Chưa xác định",
    id: complain._id || "No ID",
  })) || []; // Ensure an empty array if validComplainsList is undefined

  // Define a component for the button in each row of the table
  const ComplainButtonHaver = () => null; // No action buttons for now

  // Render the component
  return (
    <PageContainer>
      <HeaderBox>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản lý khiếu nại
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem và quản lý các khiếu nại từ sinh viên
        </Typography>
      </HeaderBox>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : response ? (
        /* Box to center the message */
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Hiện tại không có khiếu nại nào
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: 'hidden' }}>
          {Array.isArray(complainsList) && complainsList.length > 0 && (
            <TableTemplate buttonHaver={ComplainButtonHaver} columns={complainColumns} rows={complainRows} />
          )}
        </Paper>
      )}
    </PageContainer>
  );
};

// Export the component
export default SeeComplains;
