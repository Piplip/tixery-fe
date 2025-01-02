import {IconButton, Menu, MenuItem} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {useState} from "react";
import PropTypes from "prop-types";

const ITEM_HEIGHT = 48;

CustomMenu.propTypes = {
    options: PropTypes.array.isRequired,
    handlers: PropTypes.array.isRequired,
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
            <IconButton onClick={handleClick}
                        aria-label="more"
                        id="long-button"
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
            >
                <MoreVertIcon />
            </IconButton>
            <Menu open={open} anchorEl={anchorEl} onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '20ch',
                        },
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option} selected={option === 'Pyxis'}
                              onClick={handlers[options.indexOf(option)]}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}

export default CustomMenu;