// Import necessary modules and components
import { useEffect, useState } from 'react';
import {
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Paper,
} from '@mui/material';

import DeleteIcon from "@mui/icons-material/Delete";
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

// ================= COMPONENT =================
const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, error, getresponse } = useSelector(
    (state) => state.sclass
  );
  const { currentUser } = useSelector((state) => state.user);

  const adminID = currentUser?._id;

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  // ===== FETCH DATA =====
  useEffect(() => {
    if (adminID) {
      dispatch(getAllSclasses(adminID, "Sclass"));
    }
  }, [adminID, dispatch]);

  if (error) {
    console.error(error);
  }

  // ===== DELETE HANDLER =====
  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address)).then(() => {
      dispatch(getAllSclasses(adminID, "Sclass"));
    });
  };

  // ===== TABLE COLUMNS =====
  const sclassColumns = [
    { id: 'name', label: 'Class Name', minWidth: 220 },
   
  ];

  // ===== TABLE ROWS =====
  const sclassRows =
    Array.isArray(sclassesList) &&
    sclassesList.map((sclass) => ({
      name: sclass.sclassName,
      id: sclass._id,
    }));

  // ===== ACTION MENU (PER ROW) =====
  const ActionMenu = ({ actions }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
      <>
        <Tooltip title="Add Students & Subjects">
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <SpeedDialIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          onClick={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 3,
            sx: styles.styledPaper,
          }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          {actions.map((action, index) => (
            <MenuItem key={index} onClick={action.action}>
              <ListItemIcon>{action.icon}</ListItemIcon>
              {action.name}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  };

  // ===== BUTTONS IN TABLE =====
  const SclassButtonHaver = ({ row }) => {
    const actions = [
      {
        icon: <PostAddIcon />,
        name: 'Add Subjects',
        action: () => navigate(`/Admin/addsubject/${row.id}`),
      },
      {
        icon: <PersonAddAlt1Icon />,
        name: 'Add Student',
        action: () => navigate(`/Admin/class/addstudents/${row.id}`),
      },
    ];

    return (
      <>
        <IconButton onClick={() => deleteHandler(row.id, "Sclass")}>
          <DeleteIcon color="error" />
        </IconButton>

        <BlueButton
          variant="contained"
          onClick={() => navigate(`/Admin/classes/class/${row.id}`)}
        >
          View
        </BlueButton>

        <ActionMenu actions={actions} />
      </>
    );
  };

  // ===== SPEED DIAL ACTIONS =====
  const actions = [
    {
      icon: <AddCardIcon color="primary" />,
      name: 'Add New Class',
      action: () => navigate("/Admin/addclass"),
    },
    {
      icon: <DeleteIcon color="error" />,
      name: 'Delete All Classes',
      action: () => deleteHandler(adminID, "Sclasses"),
    },
  ];

  // ===== RENDER =====
  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {getresponse ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/addclass")}
              >
                Add Class
              </GreenButton>
            </Box>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              {Array.isArray(sclassRows) && sclassRows.length > 0 && (
                <TableTemplate
                  columns={sclassColumns}
                  rows={sclassRows}
                  buttonHaver={SclassButtonHaver}
                />
              )}
              <SpeedDialTemplate actions={actions} />
            </Paper>
          )}
        </>
      )}

      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </>
  );
};

export default ShowClasses;

// ===== STYLES =====
const styles = {
  styledPaper: {
    overflow: 'visible',
    mt: 1,
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      bgcolor: 'background.paper',
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 0,
    },
  },
};
