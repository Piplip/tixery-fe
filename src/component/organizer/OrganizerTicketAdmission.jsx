import {Button, IconButton, MenuItem, Stack} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import "../../styles/organizer-ticket-admission-styles.css"
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useOutletContext} from "react-router-dom";
import {useCallback, useContext, useState} from "react";
import {EventContext} from "../../context.js";
import {MoreVert} from "@mui/icons-material";

function OrganizerTicketAdmission(){
    const {data, setData} = useContext(EventContext)
    const {handleTypeSelect, setOpenDetail, setEditTicket} = useOutletContext();
    const [open, setOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(Array(data.tickets.length).fill(false));
    const handleAddMoreTicketChange = useCallback((event, isOpen) => {
        setOpen(!isOpen)
    }, []);

    const handleEditTicketChange = useCallback((index, isOpen) => {
        setDropdownOpen(prev => prev.map((open, i) => i === index ? isOpen : open));
    }, []);

    function handleEdit(index){
        setEditTicket(index)
        setOpenDetail({open: true, type: data.tickets[index].ticketType[0].toUpperCase() + data.tickets[index].ticketType.slice(1)})
    }

    function handleDelete(index){
        const newTickets = data.tickets.filter((ticket, i) => i !== index)
        setData({...data, tickets: newTickets})
    }

    return (
        <Stack rowGap={1} marginTop={2}>
            <Dropdown onOpenChange={handleAddMoreTicketChange} open={open[0]}>
                <MenuButton className={'add-more-tickets'}>
                    Add more tickets <ArrowDropDownIcon />
                </MenuButton>
                <Menu>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('Free')
                        setOpen(prev => [!prev[0], prev[1]])
                    }}>Free</MenuItem>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('Paid')
                        setOpen(prev => [!prev[0], prev[1]])
                    }}>Paid</MenuItem>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('Donation')
                        setOpen(prev => [!prev[0], prev[1]])
                    }}>Donation</MenuItem>
                </Menu>
            </Dropdown>
            <div className="tickets-section__ticket-wrapper">
                <Stack className="tickets-section__ticket-list">
                    {data.tickets && data.tickets.map((ticket, index) => {
                        return (
                            <div className="tickets-section__ticket" key={index}>
                                <DragHandleIcon className="tickets-section__ticket-drag-handle"/>
                                <Stack className="tickets-section__ticket-details" rowGap={1}>
                                    <p className="tickets-section__ticket-title">{ticket.ticketName}</p>
                                    <p className="tickets-section__ticket-dates">
                                        On Sale - Ends {ticket.endDate} at {ticket.endTime}
                                    </p>
                                </Stack>
                                <p className="tickets-section__ticket-sold">Sold: 0 / {ticket.quantity || 'Unlimited'}</p>
                                <p className="tickets-section__ticket-type">{ticket.ticketType}</p>
                                <Dropdown open={dropdownOpen[index]} onOpenChange={(isOpen) => handleEditTicketChange(index, isOpen)}>
                                    <MenuButton
                                        slots={{ root: IconButton }}
                                        slotProps={{ root: { variant: 'outlined', color: 'neutral' } }}
                                    >
                                        <MoreVert />
                                    </MenuButton>
                                    <Menu>
                                        <MenuItem onClick={() => {
                                            handleEdit(index)
                                            setDropdownOpen(prev => prev.map((open, i) => i === index ? !open : open));
                                        }}>Edit</MenuItem>
                                        <MenuItem onClick={() => {
                                            handleDelete(index)
                                            setDropdownOpen(prev => prev.map((open, i) => i === index ? !open : open));
                                        }}>Delete</MenuItem>
                                    </Menu>
                                </Dropdown>
                            </div>
                        )
                    })}
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