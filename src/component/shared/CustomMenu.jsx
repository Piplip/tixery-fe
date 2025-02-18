import {IconButton, Menu, MenuItem} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {useState} from "react";
import PropTypes from "prop-types";

const ITEM_HEIGHT = 48;

CustomMenu.propTypes = {
    options: PropTypes.array.isRequired,
    handlers: PropTypes.array,
}

function CustomMenu({options, handlers}){
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>
            <Menu
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 5,
                            width: '24ch',
                        },
                    },
                }}
            >
                {options.map((option, index) => (
                    <MenuItem
                        key={option}
                        onClick={() => {
                            if (handlers[index]) {
                                handlers[index]();
                            }
                            handleClose()
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}

export default CustomMenu;