import {Button, MenuItem, Stack} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import CustomMenu from "../CustomMenu.jsx";
import "../../styles/organizer-ticket-admission-styles.css"
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function OrganizerTicketAdmission(){
    return (
        <Stack rowGap={1} marginTop={2}>
            <Dropdown>
                <MenuButton className={'add-more-tickets'}>
                    Add more tickets <ArrowDropDownIcon />
                </MenuButton>
                <Menu>
                    <MenuItem>Free</MenuItem>
                    <MenuItem>Donation</MenuItem>
                    <MenuItem>Paid</MenuItem>
                </Menu>
            </Dropdown>
            <div className="tickets-section__ticket-wrapper">
                <Stack className="tickets-section__ticket-list">
                    <div className="tickets-section__ticket">
                        <DragHandleIcon className="tickets-section__ticket-drag-handle"/>
                        <Stack className="tickets-section__ticket-details" rowGap={1}>
                            <p className="tickets-section__ticket-title">Donation</p>
                            <p className="tickets-section__ticket-dates">
                                On Sale - Ends Feb 15, 2025 at 10:00 AM
                            </p>
                        </Stack>
                        <p className="tickets-section__ticket-sold">Sold: 0 / Unlimited</p>
                        <p className="tickets-section__ticket-type">Donation</p>
                        <CustomMenu
                            options={['Edit', 'Delete']}
                            handlers={[() => console.log('foo')]}
                        />
                    </div>
                    <div className="tickets-section__ticket">
                        <DragHandleIcon className="tickets-section__ticket-drag-handle"/>
                        <Stack className="tickets-section__ticket-details" rowGap={1}>
                            <p className="tickets-section__ticket-title">Donation</p>
                            <p className="tickets-section__ticket-dates">
                                On Sale - Ends Feb 15, 2025 at 10:00 AM
                            </p>
                        </Stack>
                        <p className="tickets-section__ticket-sold">Sold: 0 / Unlimited</p>
                        <p className="tickets-section__ticket-type">Donation</p>
                        <CustomMenu
                            options={['Edit', 'Delete']}
                            handlers={[() => console.log('foo')]}
                        />
                    </div>
                    <div className="tickets-section__ticket-capacity">
                        <Stack direction={'row'} columnGap={.5} alignItems={'center'}>
                            Event capacity
                            <InfoOutlinedIcon className="tickets-section__info-icon"/>
                        </Stack>
                        <p className="tickets-section__capacity-count">
                            0 / 500
                        </p>
                        <Button className="tickets-section__edit-capacity">Edit capacity</Button>
                    </div>
                </Stack>
            </div>
        </Stack>
    )
}

export default OrganizerTicketAdmission;