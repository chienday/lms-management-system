// eslint-disable-next-line no-unused-vars
import { useEffect, useState } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const TeacherClassDetails = () => {
    // Initialize navigation hook
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);
   
    // Extract class ID and subject ID from the current user's data
    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    // Log error if it exists
    if (error) {
        console.log(error)
    }
    // Define columns for the student table
    const studentColumns = [
        { id: 'name', label: 'Họ tên', minWidth: 170 },
        { id: 'rollNum', label: 'MSSV', minWidth: 100 },
    ]
    // Map student data to table rows
    const studentRows = sclassStudents.map((student) => {
        return {
            // Extract name, roll number, and ID from each student
            // These are used to display the student's information in the table
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        // Define options for the split button
        const options = ['Điểm danh', 'Nhập điểm'];

        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            console.info(`You clicked ${options[selectedIndex]}`);
            // Navigate based on the selected option
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        // Function to handle navigation to the attendance page
        const handleAttendance = () => {
            // Điều hướng theo đúng route được khai báo trong TeacherDashboard
            navigate(`/class/student/attendance/${row.id}/${subjectID}`);
        };
        // Function to handle navigation to the marks page
        const handleMarks = () => {
            // Điều hướng theo đúng route được khai báo trong TeacherDashboard
            navigate(`/class/student/marks/${row.id}/${subjectID}`);
        };
        // Function to handle the click event of a menu item
        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };
        // Function to toggle the open/close state of the menu
        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };
        // Function to handle the close event of the menu
        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }
            // Close the menu
            setOpen(false);
        };
        return (
            <>
                <BlueButton
                    variant="contained"
                    onClick={() =>
                        // Navigate to the student view page
                        // Điều hướng theo đúng route được khai báo trong TeacherDashboard
                        navigate(`/class/student/${row.id}`)
                    }
                >
                    Xem
                </BlueButton>
                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        {/* Main button */}
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>
                    <Popper
                        // Popper component for the menu
                        sx={{
                            zIndex: 1,
                        }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {/* Grow transition for the menu */}
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                {/* Menu component */}
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    disabled={index === 2}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </>
        );
    };

    return (
        <>
            {/* Display loading message while data is being fetched */}
            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <>
                    {/* Display class details */}
                    <Typography variant="h4" align="center" gutterBottom>
                        Chi tiết lớp
                    </Typography>
                    {/* Check if there is a response from the server */}
                    {getresponse ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                Không có sinh viên
                            </Box>
                        </>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <Typography variant="h5" gutterBottom>
                                Danh sách sinh viên:
                            </Typography>
                            {/* Check if sclassStudents is an array and has data */}
                            {Array.isArray(sclassStudents) && sclassStudents.length > 0 &&
                                <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                            }
                        </Paper>
                    )}
                </>
            )}
        </>
    );
};

export default TeacherClassDetails;