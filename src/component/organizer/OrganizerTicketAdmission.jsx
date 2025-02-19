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
import {useTranslation} from "react-i18next";

function OrganizerTicketAdmission(){
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext)
    const {handleTypeSelect, setOpenDetail, setEditTicket} = useOutletContext();
    const [open, setOpen] = useState(false);
    const [openCapacity, setOpenCapacity] = useState(false);
    const handleAddMoreTicketChange = useCallback((event, isOpen) => {
        setOpen(isOpen)
    }, []);
    const {t} = useTranslation()

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
                        setData({ ...data, capacity: capacity })
                        setOpenCapacity(false)
                    },
                }}
            >
                <DialogTitle>{t('ticketSection.changeEventCapacity')}</DialogTitle>
                <DialogContent>
                    <Typography variant={'body2'}>
                        {t('ticketSection.eventCapacityDescription')}
                    </Typography>
                    <TextField autoFocus required margin="dense" name="capacity" variant="outlined" value={data.capacity} sx={{marginTop: 3}}
                               label={t('ticketSection.eventCapacityLabel')} fullWidth placeholder={t('ticketSection.maximumAllow')}
                               onChange={(e) => {
                                   e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                   if (parseInt(e.target.value, 10) > 10000000000) {
                                       e.target.value = 10000000000;
                                   }
                                   setData({ ...data, capacity: e.target.value })
                               }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color={'error'} onClick={() => setOpenCapacity(false)}>{t('ticketSection.cancel')}</Button>
                    <Button variant={'contained'} type="submit">{t('ticketSection.change')}</Button>
                </DialogActions>
            </Dialog>
            <Dropdown onOpenChange={handleAddMoreTicketChange} open={open}>
                <MenuButton className={'add-more-tickets'}>
                    {t('ticketSection.addMoreTickets')} <ArrowDropDownIcon />
                </MenuButton>
                <Menu>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('free')
                        setOpen(prev => !prev)
                    }}>{t('ticket.free')}</MenuItem>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('paid')
                        setOpen(prev => !prev)
                    }}>{t('ticket.paid')}</MenuItem>
                    <MenuItem onClick={() => {
                        setEditTicket(null)
                        handleTypeSelect('donation')
                        setOpen(prev => !prev)
                    }}>{t('ticket.donation')}</MenuItem>
                </Menu>
            </Dropdown>
            <div className="tickets-section__ticket-wrapper">
                <Stack className="tickets-section__ticket-list">
                    {data.tickets && data.tickets.map((ticket, index) => {
                        return (
                            <div className="tickets-section__ticket" key={index}>
                                <DragHandleIcon className="tickets-section__ticket-drag-handle" />
                                <Stack className="tickets-section__ticket-details" rowGap={1}>
                                    <Stack className="tickets-section__ticket-title" direction={'row'} columnGap={1} alignItems={'center'}>
                                        <p>
                                            {ticket.ticketName}
                                        </p>
                                        {dayjs(ticket.startTime + " " + ticket.startDate, 'HH:mm DD/MM/YYYY').isBefore(dayjs()) ?
                                            <Tooltip title={t('ticketSection.onSale')} placement={'top'}>
                                                <CircleIcon sx={{ color: '#77d927' }} />
                                            </Tooltip>
                                            :
                                            <CircleIcon sx={{ color: 'gray' }} />
                                        }
                                    </Stack>
                                    <p className="tickets-section__ticket-dates">
                                        {
                                            dayjs(ticket.startTime + " " + ticket.startDate, 'HH:mm DD/MM/YYYY').isBefore(dayjs()) ?
                                                t('ticketSection.onSaleEnds') + dayjs(ticket.endDate, "DD/MM/YYYY").format("DD/MM/YYYY") + t('ticketSection.at')
                                                + dayjs(ticket.endTime, "HH:mm").format("HH:mm")
                                                :
                                                t('ticketSection.starts') + ticket.startDate + t('ticketSection.at') + ticket.startTime + t('ticketSection.ends') + ticket.endDate + t('ticketSection.at') + ticket.endTime
                                        }
                                    </p>
                                </Stack>
                                <p className="tickets-section__ticket-sold">{t('ticketSection.sold')}: 0 / {ticket.quantity || t('ticketSection.unlimited')}</p>
                                <p className="tickets-section__ticket-type">{t(`ticket.${ticket.ticketType.toLowerCase()}`)}</p>
                                <CustomMenu options={[t('ticketSection.edit'), t('ticketSection.delete')]}
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
                            {t('ticketSection.eventCapacity')}
                            <Tooltip title={t('ticketSection.eventCapacityTooltip')}>
                                <InfoOutlinedIcon className="tickets-section__info-icon" />
                            </Tooltip>
                        </Stack>
                        <p className="tickets-section__capacity-count">
                            0 / {data.capacity}
                        </p>
                        <Button className="tickets-section__edit-capacity"
                                onClick={() => setOpenCapacity(true)}
                        >{t('ticketSection.editCapacity')}</Button>
                    </div>
                </Stack>
            </div>
        </Stack>
    );
}

export default OrganizerTicketAdmission;