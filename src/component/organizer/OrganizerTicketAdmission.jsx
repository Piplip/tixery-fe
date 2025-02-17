import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Tooltip, Typography
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
import CircleIcon from '@mui/icons-material/Circle';
import dayjs from "dayjs";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import CustomMenu from "../shared/CustomMenu.jsx";

function OrganizerTicketAdmission(){
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext)
    const {handleTypeSelect, setOpenDetail, setEditTicket} = useOutletContext();
    const [open, setOpen] = useState(false);
    const [openCapacity, setOpenCapacity] = useState(false);
    const handleAddMoreTicketChange = useCallback((event, isOpen) => {
        setOpen(isOpen)
    }, []);

    function handleEdit(index){
        setEditTicket(index)
        setOpenDetail({open: true, type: data.tickets[index].ticketType})
    }

    function handleDelete(index){
        const params = new URLSearchParams({
            tid: data.tickets[index].ticketID,
            ...(data.eventType === 'recurring' && {is_recurring: true})
        })
        eventAxiosWithToken.post(`/tickets/remove?${params.toString()}`)
            .then(() => {
                setHasUnsavedChanges(true)
                const deleteCapacity = data.tickets[index].quantity || 0
                const newTickets = data.tickets.filter((ticket, i) => i !== index)
                setData(prev => ({...prev, tickets: newTickets, capacity: prev.capacity - deleteCapacity}))
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
                    <Typography variant={'body2'}>
                        Event capacity is the total number of tickets available for sale at your event. When you set an event capacity, your event will sell out as soon as you sell that number of total tickets. You can adjust your event capacity to prevent overselling.
                    </Typography>
                    <TextField autoFocus required margin="dense" name="capacity" variant="outlined" value={data.capacity}
                               label="Event capacity" fullWidth placeholder={'Maximum allow: 10000000000'}
                               onChange={(e) => {
                                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                      if (parseInt(e.target.value, 10) > 10000000000) {
                                            e.target.value = 10000000000;
                                      }
                                        setData({...data, capacity: e.target.value})
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
                                        <p>
                                            {ticket.ticketName}
                                        </p>
                                        {dayjs(ticket.startTime + " " + ticket.startDate, 'HH:mm DD/MM/YYYY').isBefore(dayjs()) ?
                                            <Tooltip title="On Sale" placement={'top'}>
                                                <CircleIcon sx={{color: '#77d927'}}/>
                                            </Tooltip>
                                            :
                                            <CircleIcon sx={{color: 'gray'}}/>
                                        }
                                    </Stack>
                                    <p className="tickets-section__ticket-dates">
                                        {
                                            dayjs(ticket.startTime + " " + ticket.startDate, 'HH:mm DD/MM/YYYY').isBefore(dayjs()) ?
                                                'On Sale - Ends ' + dayjs(ticket.endDate, "DD/MM/YYYY").format("DD/MM/YYYY") + ' at '
                                                + dayjs(ticket.endTime, "HH:mm").format("HH:mm")
                                                :
                                                'Starts ' + ticket.startDate + ' at ' + ticket.startTime + ' - Ends ' + ticket.endDate + ' at ' + ticket.endTime
                                        }
                                    </p>
                                </Stack>
                                <p className="tickets-section__ticket-sold">Sold: 0 / {ticket.quantity || 'Unlimited'}</p>
                                <p className="tickets-section__ticket-type">{ticket.ticketType}</p>
                                <CustomMenu options={['Edit', 'Delete']}
                                    handlers={[() => {
                                        handleEdit(index)
                                    }, () => {
                                        handleDelete(index)
                                    }]}
                                />
                            </div>
                        )
                    })}
                    <div className="tickets-section__ticket-capacity">
                        <Stack direction={'row'} columnGap={.5} alignItems={'center'}>
                            Event capacity
                            <Tooltip title={'Event capacity is the total number of tickets available for sale at your event. When you set an event capacity, your event will sell out as soon as you sell that number of total tickets. You can adjust your event capacity to prevent overselling.'}>
                                <InfoOutlinedIcon className="tickets-section__info-icon"/>
                            </Tooltip>
                        </Stack>
                        <p className="tickets-section__capacity-count">
                            0 / {data.capacity}
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