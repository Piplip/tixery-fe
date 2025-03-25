import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {alpha} from '@mui/material/styles';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import "../../styles/organizer-ticket-admission-styles.css"
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useLocation, useNavigate, useOutletContext} from "react-router-dom";
import {useCallback, useContext, useState} from "react";
import {EventContext} from "../../context.js";
import CircleIcon from '@mui/icons-material/Circle';
import dayjs from "dayjs";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import CustomMenu from "../shared/CustomMenu.jsx";
import {useTranslation} from "react-i18next";
import {getContrastColor} from "../../common/Utilities.js";
import EditIcon from '@mui/icons-material/Edit';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

function OrganizerTicketAdmission(){
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext)
    const {handleTypeSelect, setOpenDetail, setEditTicket, tiers, seatMap} = useOutletContext();
    const [open, setOpen] = useState(false);
    const [openCapacity, setOpenCapacity] = useState(false);
    const [groupBy, setGroupBy] = useState('tier');
    const handleAddMoreTicketChange = useCallback((event, isOpen) => {
        setOpen(isOpen)
    }, []);
    const {t} = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()

    function handleEdit(index) {
        setEditTicket(index);
        setOpenDetail({open: true, type: data.tickets[index].ticketType});
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
        <Stack rowGap={1} marginTop={2} sx={{minWidth:  '45rem'}}>
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
            {!tiers ?
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
                :
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                    <Dropdown onOpenChange={handleAddMoreTicketChange} open={open}>
                        <MenuButton className={'add-more-tickets'}>
                            {t('ticketSection.groupBy')} {groupBy === 'ticket' ? t('ticketSection.ticket') : t('ticketSection.tier')} <ArrowDropDownIcon />
                        </MenuButton>
                        <Menu>
                            <MenuItem onClick={() => {
                                setGroupBy('ticket')
                                setOpen(false)
                            }}>{t('ticketSection.ticketType')}</MenuItem>
                            <MenuItem onClick={() => {
                                setGroupBy('tier')
                                setOpen(false)
                            }}>{t('ticketSection.tier')}</MenuItem>
                        </Menu>
                    </Dropdown>
                    <Typography>
                        {t('ticketSection.capacity')}: {seatMap.capacity}
                    </Typography>
                    {tiers.length > 0 &&
                        <Button variant={'contained'}
                                startIcon={<LocalActivityIcon />}
                                onClick={() => {
                                    setEditTicket(null)
                                    handleTypeSelect('paid')
                                }}
                        >
                            {t('ticketSection.addMoreTickets')}
                        </Button>
                    }
                </Stack>
            }
            <div className="tickets-section__ticket-wrapper">
                <Stack className="tickets-section__ticket-list">
                    {tiers ?
                        tiers.length > 0 ?
                            <Stack>
                                {groupBy === 'tier' ? (
                                    tiers.map((tier, index) => (
                                        <Card key={index} variant="outlined" sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '5px',
                                                height: '100%',
                                                backgroundColor: tier.tier_color
                                            }} />
                                            <CardContent sx={{ p: 3 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '50%',
                                                            backgroundColor: tier.tier_color,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: getContrastColor(tier.tier_color),
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {index + 1}
                                                        </Box>
                                                        <Typography variant="h6" component="div">
                                                            {tier.name}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={3} mt={2}>
                                                        <Box textAlign={'center'}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {t('ticketSection.assignedSeats')}
                                                            </Typography>
                                                            <Typography variant="h6">
                                                                {tier.assignedseats || 0}
                                                            </Typography>
                                                        </Box>
                                                        <Box textAlign={'center'}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {t('ticketSection.totalTickets')}
                                                            </Typography>
                                                            <Typography variant="h6">
                                                                {data.tickets?.filter(ticket =>
                                                                    ticket.tierData?.some(td => td.tierID === tier.seat_tier_id)
                                                                )?.length || 0}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Stack>

                                                <Box mt={2}>
                                                    {data.tickets?.some(ticket =>
                                                        ticket.tierData?.some(td => td.tierID === tier.seat_tier_id)
                                                    ) ? (
                                                        <>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                {t('ticketSection.tickets')}
                                                            </Typography>
                                                            <Stack spacing={1}>
                                                                {data.tickets?.filter(ticket =>
                                                                    ticket.tierData?.some(td => td.tierID === tier.seat_tier_id)
                                                                ).map((ticket, idx) => (
                                                                    <Box
                                                                        key={idx}
                                                                        sx={{
                                                                            p: 1.5,
                                                                            border: '1px solid #e0e0e0',
                                                                            borderRadius: 1,
                                                                            backgroundColor: alpha(tier.tier_color, 0.05)
                                                                        }}
                                                                    >
                                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                            <Typography variant="subtitle1">{ticket.ticketName}</Typography>
                                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                                <Typography variant="body2">
                                                                                    {ticket.tierData?.find(td => td.tierID === tier.seat_tier_id)?.price || 0}
                                                                                    {ticket.currencySymbol || '$'}
                                                                                </Typography>
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    startIcon={<EditIcon />}
                                                                                    onClick={() => {
                                                                                        const ticketIndex = data.tickets.findIndex(t =>
                                                                                            t.ticketID === ticket.ticketID);
                                                                                        if (ticketIndex !== -1) {
                                                                                            setEditTicket(ticketIndex);
                                                                                            setOpenDetail({open: true, type: ticket.ticketType});
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {t('ticketSection.edit')}
                                                                                </Button>
                                                                            </Stack>
                                                                        </Stack>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {t('ticketSection.starts')} {ticket.startDate} {t('ticketSection.at')} {ticket.startTime}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Stack>
                                                        </>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {t('ticketSection.noTicketsAvailable')}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {tier.perks && (
                                                    <Box mt={2}>
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            {t('ticketSection.perks')}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                                            {tier.perks && tier.perks.split(',').map((perk, i) => (
                                                                <Chip
                                                                    key={i}
                                                                    label={perk}
                                                                    size="small"
                                                                    sx={{ backgroundColor: alpha(tier.tier_color, 0.1) }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    data.tickets?.map((ticket, index) => (
                                        <Card key={index} variant="outlined" sx={{ mb: 2, position: 'relative' }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="h6">{ticket.ticketName}</Typography>
                                                    <CustomMenu options={[t('ticketSection.edit'), t('ticketSection.delete')]}
                                                                handlers={[
                                                                    () => handleEdit(index),
                                                                    () => handleDelete(index)
                                                                ]}
                                                    />
                                                </Stack>

                                                <Stack direction="row" spacing={2} mt={1}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('ticketSection.starts')} {ticket.startDate} {t('ticketSection.at')} {ticket.startTime}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('ticketSection.ends')} {ticket.endDate} {t('ticketSection.at')} {ticket.endTime}
                                                    </Typography>
                                                </Stack>

                                                {ticket.tierData && ticket.tierData.length > 0 && (
                                                    <Box mt={2}>
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            {t('ticketSection.pricingByTier')}
                                                        </Typography>
                                                        <Stack spacing={1}>
                                                            {ticket.tierData.map((tierPrice, idx) => {
                                                                const tierInfo = tiers.find(t => t.seat_tier_id === tierPrice.tierID);
                                                                return (
                                                                    <Stack
                                                                        key={idx}
                                                                        direction="row"
                                                                        alignItems="center"
                                                                        spacing={2}
                                                                        sx={{
                                                                            p: 1,
                                                                            borderRadius: 1,
                                                                            backgroundColor: tierInfo ? alpha(tierInfo.tier_color, 0.05) : 'inherit',
                                                                            borderLeft: tierInfo ? `4px solid ${tierInfo.tier_color}` : 'none'
                                                                        }}
                                                                    >
                                                                        {tierInfo && (
                                                                            <Box sx={{
                                                                                width: 20,
                                                                                height: 20,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: tierInfo.tier_color
                                                                            }} />
                                                                        )}
                                                                        <Typography variant="body2">
                                                                            {tierInfo?.name || `Tier ${idx + 1}`}
                                                                        </Typography>
                                                                        <Typography variant="body2" fontWeight="bold">
                                                                            {tierPrice.price} {ticket.currencySymbol || '$'}
                                                                        </Typography>
                                                                    </Stack>
                                                                );
                                                            })}
                                                        </Stack>
                                                    </Box>
                                                )}

                                                <Box mt={2}>
                                                    <Chip
                                                        label={t(`ticket.${ticket.ticketType.toLowerCase()}`)}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {ticket.visibility && (
                                                        <Chip
                                                            label={t(`ticket.visibility-status.${ticket.visibility.toLowerCase()}`)}
                                                            size="small"
                                                            color="info"
                                                        />
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </Stack>
                            :
                            <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                                <Box sx={{ mb: 2 }}>
                                    <ViewModuleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        {t('ticketSection.noTiersCreated')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        {t('ticketSection.noTiersDescription')}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            const eventId = location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]
                                            const mapId = seatMap.map_id
                                            navigate(`/create/seat-map?eid=${eventId}${mapId ? `&mid=${mapId}` : ''}`);
                                        }}
                                        startIcon={<EditIcon />}
                                    >
                                        {t('ticketSection.editSeatMap')}
                                    </Button>
                                </Box>
                            </Card>
                        :
                        data.tickets && data.tickets.map((ticket, index) => {
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
                        })
                    }
                    {!tiers &&
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
                            >
                                {t('ticketSection.editCapacity')}
                            </Button>
                        </div>
                    }
                </Stack>
            </div>
        </Stack>
    );
}

export default OrganizerTicketAdmission;