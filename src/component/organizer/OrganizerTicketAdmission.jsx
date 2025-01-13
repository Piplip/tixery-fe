import {
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack, TextField,
    Tooltip
} from "@mui/material";
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
import CircleIcon from '@mui/icons-material/Circle';
import dayjs from "dayjs";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";

function OrganizerTicketAdmission(){
    const {data, setData} = useContext(EventContext)
    const {handleTypeSelect, setOpenDetail, setEditTicket} = useOutletContext();
    const [open, setOpen] = useState(false);
    const [openCapacity, setOpenCapacity] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(Array(data.tickets.length).fill(false));
    const handleAddMoreTicketChange = useCallback((event, isOpen) => {
        setOpen(isOpen)
    }, []);

    const handleEditTicketChange = useCallback((index, isOpen) => {
        setDropdownOpen(prev => prev.map((open, i) => i === index ? isOpen : open));
    }, []);

    function handleEdit(index){
        setEditTicket(index)
        setOpenDetail({open: true, type: data.tickets[index].ticketType})
    }

    function handleDelete(index){
        eventAxiosWithToken.post(`/tickets/remove?tid=${data.tickets[index].ticketID}`)
            .then(r => {
                console.log(r.data)
                const newTickets = data.tickets.filter((ticket, i) => i !== index)
                setData({...data, tickets: newTickets})
            })
            .catch(err => console.log(err))
    }

    return (
        <Stack rowGap={1} marginTop={2}>
            <Dialog
                open={openCapacity}
                onClose={() => setOpenCapacity(false)}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        const capacity = formJson.capacity;
                        setData({...data, capacity: capacity})
                        setOpenCapacity(false)
                    },
                }}
            >
                <DialogTitle>CHANGE EVENT CAPACITY</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required margin="dense" name="capacity" variant="outlined"
                               label="Event capacity" fullWidth placeholder={'Maximum allow: 10000000000'}
                               onInput={(e) => {
                                   e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                   if (parseInt(e.target.value, 10) > 10000000000) {
                                       e.target.value = 10000000000;
                                   }
                               }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color={'error'} onClick={() => setOpenCapacity(false)}>Cancel</Button>
                    <Button variant={'contained'} type="submit">Change</Button>
                </DialogActions>
            </Dialog>
            <Dropdown onOpenChange={handleAddMoreTicketChange} open={open}>
                <MenuButton className={'add-more-tickets'}>
                    Add more tickets <ArrowDropDownIcon />
                </MenuButton>
                <Menu>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('free')
                        setOpen(prev => !prev)
                    }}>Free</MenuItem>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('paid')
                        setOpen(prev => !prev)
                    }}>Paid</MenuItem>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('donation')
                        setOpen(prev => !prev)
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
                                    <Stack className="tickets-section__ticket-title" direction={'row'} columnGap={1} alignItems={'center'}>
                                        {ticket.ticketName}
                                        {dayjs(ticket.startTime + " " + ticket.startDate, 'HH:mm DD/MM/YYYY').isBefore(dayjs()) ?
                                            <Tooltip title="On Sale" placement={'top'}>
                                                <CircleIcon sx={{color: '#77d927'}}/>
                                            </Tooltip>
                                            :
                                            <CircleIcon sx={{color: 'gray'}}/>
                                        }
                                    </Stack>
                                    <p className="tickets-section__ticket-dates">
                                        {/*On Sale - Ends {ticket.endDate} at {ticket.endTime}*/}
                                        {
                                            dayjs(ticket.startTime + " " + ticket.startDate, 'HH:mm DD/MM/YYYY').isBefore(dayjs()) ?
                                                'On Sale - Ends ' + ticket.endDate + ' at ' + ticket.endTime
                                                :
                                                'Starts ' + ticket.startDate + ' at ' + ticket.startTime + ' - Ends ' + ticket.endDate + ' at ' + ticket.endTime
                                        }
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
                            0 / {data.capacity || '100'}
                        </p>
                        <Button className="tickets-section__edit-capacity"
                            onClick={() => setOpenCapacity(true)}
                        >Edit capacity</Button>
                    </div>
                </Stack>
            </div>
        </Stack>
    )
}

export default OrganizerTicketAdmission;