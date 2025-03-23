import "../../styles/organizer-create-tickets-styles.css"
import {Alert, Button, Checkbox, MenuItem, Snackbar, Stack, TextField, Typography} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FreeIcon from "../../assets/free-icon.png"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {useCallback, useContext, useEffect, useState} from "react";
import * as Yup from "yup";
import {useFormik} from "formik";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Card, CardActions, CardContent} from "@mui/joy";
import TextAreaWithLimit from "../shared/TextAreaWithLimit.jsx";
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import {NavLink, Outlet, useLocation, useNavigate, useOutletContext} from "react-router-dom";
import {EventContext} from "../../context.js";
import dayjs from "dayjs";
import "../../styles/organizer-create-ticket-styles.scss"
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import CurrencySelect from "../shared/CurrencySelect.jsx";
import {useTranslation} from "react-i18next";
import LayersClearIcon from '@mui/icons-material/LayersClear';
import {getUserData} from "../../common/Utilities.js";
import Grid from "@mui/material/Grid2";
import {alpha} from "@mui/material/styles";

const ticketVisibility = [
    {label: 'Visible', value: 'visible'},
    {label: 'Hidden', value: 'hidden'},
    {label: 'Hidden when not on sale', value: 'hid-on-sale'},
    {label: 'Custom', value: 'custom'},
]

function OrganizerCreateTicket() {
    const {t} = useTranslation()
    const [open, setOpen] = useState(false)
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext)
    const {validate, setAlert, setCurrentStep, maxStep} = useOutletContext()
    const [openDetail, setOpenDetail] = useState({
        type: null, open: false
    });
    const navigate = useNavigate()
    const location = useLocation()
    const [editTicket, setEditTicket] = useState(null)
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [seatMap, setSeatMap] = useState([]);
    const [tiers, setTiers] = useState(null)
    const [selectedSeatMap, setSelectedSeatMap] = useState(null)

    const tabs = [
        { label: t('ticket.admission'), to: '' },
        { label: t('ticket.addOns'), to: 'add-ons' },
        { label: t('ticket.promotions'), to: 'promotions' },
        { label: t('ticket.settings'), to: 'settings' },
    ];

    const ticketTypes = [
        {
            name: 'free',
            icon: FreeIcon,
            description: t('ticket.freeDescription'),
        },
        {
            name: 'paid',
            icon: <ReceiptIcon sx={{ color: '#007aa2', backgroundColor: '#fafafa', width: '3.5rem', height: '3.5rem', p: 1 }} />,
            description: t('ticket.paidDescription'),
        },
        {
            name: 'donation',
            icon: <FavoriteBorderIcon sx={{ color: 'red', backgroundColor: '#fdecff', width: '3.5rem', height: '3.5rem', p: 1 }} />,
            description: t('ticket.donationDescription'),
        }
    ];

    useEffect(() => {
        if(location.search.includes('ref=seat-map')){
            setCurrentStep(3)
            maxStep.current = 3
        }
    }, []);

    useEffect(() => {
        if (data.reserveSeating && seatMap.length === 0) {
            eventAxiosWithToken
                .get(`/seat-map?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}&pid=${getUserData('profileID')}`)
                .then(r => {
                    setSeatMap(r.data);
                })
                .catch(err => console.log(err));
        }
    }, [data.reserveSeating]);

    useEffect(() => {
        if(location.search.includes('ref=seat-map')) return
        const msg = validate(0)
        if (typeof msg === 'string' && location.pathname.includes('tickets')) {
            setCurrentStep(0)
            setTimeout(() => setAlert(t('ticket.requiredFieldsAlert')), 500)
            const basePath = location.pathname.split('/tickets')[0];
            navigate(basePath);
        }
    }, [location, navigate, setCurrentStep, setAlert, t, validate]);

    useEffect(() => {
        if (editTicket !== null && editTicket !== undefined) {
            const ticket = data.tickets[editTicket];

            const tierPricesArray = [];
            const tierCurrenciesArray = [];

            if (ticket.tierData && ticket.tierData.length > 0 && tiers) {
                tiers.forEach((tier) => {
                    const tierPrice = ticket.tierData.find(td => td.tierID === tier.seat_tier_id);

                    if (tierPrice) {
                        const tierIndex = tiers.findIndex(t => t.seat_tier_id === tier.seat_tier_id);
                        if (tierIndex !== -1) {
                            tierPricesArray[tierIndex] = tierPrice.price;

                            tierCurrenciesArray[tierIndex] = {
                                currency: tierPrice.currency || ticket.currency || 'USD',
                                sign: tierPrice.currencySymbol || ticket.currencySymbol || '$',
                                label: tierPrice.currencyFullForm || ticket.currencyFullForm || 'United States Dollar'
                            };
                        }
                    }
                });
            }

            setInitialValues({
                ticketID: ticket.ticketID,
                ticketName: ticket.ticketName,
                quantity: ticket.quantity,
                price: ticket.price,
                startDate: ticket.startDate ? dayjs(ticket.startDate, 'DD/MM/YYYY') : null,
                endDate: ticket.endDate ? dayjs(ticket.endDate, 'DD/MM/YYYY') : null,
                startTime: ticket.startTime ? dayjs(ticket.startTime, 'HH:mm') : null,
                endTime: ticket.endTime ? dayjs(ticket.endTime, 'HH:mm') : null,
                minPerOrder: ticket.minPerOrder,
                maxPerOrder: ticket.maxPerOrder,
                visibility: ticketVisibility.findIndex(v => v.value === ticket.visibility),
                description: ticket.description,
                visibleStartDate: ticket.visibleStartDate ? dayjs(ticket.visibleStartDate, 'DD/MM/YYYY') : null,
                visibleEndDate: ticket.visibleEndDate ? dayjs(ticket.visibleEndDate, 'DD/MM/YYYY') : null,
                visibleStartTime: ticket.visibleStartTime ? dayjs(ticket.visibleStartTime, 'HH:mm') : null,
                visibleEndTime: ticket.visibleEndTime ? dayjs(ticket.visibleEndTime, 'HH:mm') : null,
                absorbFee: ticket.absorbFee,
                currency: ticket.currency || 'USD',
                sign: ticket.currencySymbol || '$',
                label: ticket.currencyFullForm || 'United States Dollar',
                tierPrices: tierPricesArray,
                tierCurrencies: tierCurrenciesArray
            });

            setOpenDetail({type: ticket.ticketType, open: true});
        } else {
            setInitialValues({
                ticketName: "",
                quantity: '',
                price: '',
                startDate: dayjs().add(1, 'month'),
                endDate: dayjs().add(2, 'month'),
                startTime: dayjs(),
                endTime: dayjs().add(1, 'hour'),
                minPerOrder: '1',
                maxPerOrder: '1',
                visibility: 0,
                description: '',
                visibleStartDate: null,
                visibleEndDate: null,
                visibleStartTime: null,
                visibleEndTime: null,
                absorbFee: false,
                currency: 'USD',
                sign: '$',
                label: 'United States Dollar',
                tierPrices: [],
                tierCurrencies: []
            });
        }
    }, [editTicket]);

    const handleOpenChange = useCallback((event, isOpen) => {
        setOpen(isOpen);
    }, []);

    const validationSchema = Yup.object().shape({
        ticketName: Yup.string()
            .required("Ticket name is required.")
            .max(50, "Ticket name type cannot exceed 50 characters."),
        quantity: Yup.number()
            .test('quantity-validation', '', function(value) {
                if (tiers && tiers.length) return true;
                return value > 0 || this.createError({ message: 'Quantity must be greater than 0' });
            })
            .typeError("Quantity must be a number."),
        price: Yup.mixed().nullable()
            .test('price-validation', '', function(value) {
                if (tiers && tiers.length) return true;
                const {type} = this.parent;
                if (type === 'free' || type === 'donation') return true;
                return value > 0 || this.createError({ message: 'Price must be greater than 0' });
            }),
        startDate: Yup.date()
            .required('Start date is required')
            .typeError('Start date must be a valid date')
            .test(
                'is-before-end-date',
                'Start date must be earlier than the end date',
                function (value) {
                    const {endDate} = this.parent;
                    return !endDate || !value || value <= endDate;
                }
            )
            .test(
                'is-before-event-start',
                'Ticket sales start date should be before the event start date',
                function (value) {
                    if (data.eventType === 'recurring' || !value) return true;

                    const ticketSalesDate = dayjs(value);
                    const eventStartDate = dayjs(data.eventDate, "DD/MM/YYYY");

                    if (!ticketSalesDate.isValid() || !eventStartDate.isValid()) {
                        return false;
                    }

                    return ticketSalesDate.isBefore(eventStartDate);
                }
            ),
        endDate: Yup.date().required('End date is required')
            .typeError('End date must be a valid date')
            .test(
                'is-after-start-date',
                'End date must be after the start date',
                function (value) {
                    const {startDate} = this.parent;
                    return !startDate || !value || value >= startDate;
                }
            )
            .test(
                'is-before-event-start',
                'Ticket sales start date should be before the event start date',
                function (value) {
                    if (data.eventType === 'recurring' || !value) return true;

                    const ticketSalesDate = dayjs(value);
                    const eventStartDate = dayjs(data.eventDate, "DD/MM/YYYY");

                    if (!ticketSalesDate.isValid() || !eventStartDate.isValid()) {
                        return false;
                    }

                    return ticketSalesDate.isBefore(eventStartDate);
                }
            ),
        startTime: Yup.date()
            .required("Start time is required."),
        endTime: Yup.date()
            .required('End time is required.')
            .test(
                'is-valid-end-time',
                'End time cannot be earlier than start time.',
                function (value) {
                    const {startTime, startDate, endDate} = this.parent;
                    if (startDate && endDate && new Date(startDate).toDateString() === new Date(endDate).toDateString()) {
                        return !startTime || !value || value >= startTime;
                    }
                    return true;
                }
            ),
        minPerOrder: Yup.number()
            .required("Minimum quantity is required.")
            .typeError("Minimum quantity must be a number.")
        ,
        maxPerOrder: Yup.number()
            .required("Maximum quantity is required.")
            .typeError("Maximum quantity must be a number.")
        ,
        visibleStartDate: Yup.date().nullable()
            .test(
                'is-required-if-custom',
                'Visible start date is required',
                function (value) {
                    const {visibility} = this.parent;
                    return ticketVisibility[visibility].value !== 'custom' || value !== null;
                }
            )
            .test(
                'is-before-visible-end-date',
                'Visible start date must be earlier than the end date',
                function (value) {
                    const {visibility, visibleEndDate} = this.parent;
                    return ticketVisibility[visibility].value !== 'custom' || !visibleEndDate || !value || value <= visibleEndDate;
                }
            ),
        visibleEndDate: Yup.date().nullable()
            .test(
                'is-after-visible-start-date',
                'Visible end date must be later than the start date',
                function (value) {
                    const {visibility, visibleStartDate} = this.parent;
                    return ticketVisibility[visibility].value !== 'custom' || !visibleStartDate || !value || value >= visibleStartDate;
                }
            ),
    });

    const [initialValues, setInitialValues] = useState({
        ticketName: "",
        quantity: '',
        price: '',
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        minPerOrder: '1',
        maxPerOrder: '1',
        visibility: 0,
        description: '',
        visibleStartDate: null,
        visibleEndDate: null,
        visibleStartTime: null,
        visibleEndTime: null,
        absorbFee: false,
        currency: 'USD',
        sign: '$',
        label: 'United States Dollar'
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            setOpenDetail({type: null, open: false});
            let newCapacity = Number(data.capacity);
            let newData = transformData(values);

            if (editTicket !== null) {
                if (tiers && data.reserveSeating) {
                    const oldTicket = data.tickets[editTicket];
                    const ticketIDs = Array.isArray(oldTicket.ticketID) ? oldTicket.ticketID : [oldTicket.ticketID];

                    const params = new URLSearchParams({
                        eid: location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3],
                        timezone: data.timezone
                    });

                    eventAxiosWithToken.post(`/tickets/tier/update?${params}`, {
                        ticketIDs: ticketIDs,
                        ticketData: newData
                    })
                        .then(r => {
                            if (r.data.data) {
                                newData = {
                                    ...newData,
                                    ticketID: r.data.data
                                };

                                const updatedTickets = [...data.tickets];
                                updatedTickets[editTicket] = newData;

                                setData(prev => ({
                                    ...prev,
                                    tickets: updatedTickets
                                }));

                                setShowSnackbar(true);
                                setSnackbarMessage('Ticket updated successfully');
                                setHasUnsavedChanges(true);
                            }
                        })
                        .catch(err => console.log(err));
                }
                else{
                    newCapacity = Number(newCapacity + values.quantity - data.tickets[editTicket].quantity);
                    eventAxiosWithToken.put(`/tickets/update?tid=${values.ticketID}&timezone=${data.timezone}`, newData)
                        .then(() => {
                            const updatedTickets = [...data.tickets];
                            updatedTickets[editTicket] = newData;
                            setData({...data, tickets: updatedTickets, capacity: newCapacity});

                            setShowSnackbar(true);
                            setSnackbarMessage('Ticket updated successfully');
                            setHasUnsavedChanges(true);
                        })
                        .catch(err => console.log(err));
                }
            } else {
                newCapacity = Number(newCapacity + values.quantity)
                const params = new URLSearchParams({
                    eid: location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3],
                    timezone: data.timezone
                });

                if (data.eventType === 'recurring') {
                    params.append("is_recurring", "true");
                    newData = {...newData, occurrence: JSON.parse(sessionStorage.getItem('occurrence-ids'))};
                }

                if(tiers && data.reserveSeating) {
                    eventAxiosWithToken.post(`/tickets/tier/add?${params}`, newData)
                        .then(r => {
                            if (Array.isArray(r.data.data)) {
                                newData = {
                                    ...newData,
                                    ticketID: r.data.data
                                };

                                setData(prev => ({
                                    ...prev,
                                    tickets: prev.tickets ? prev.tickets.concat(newData) : [newData],
                                }));
                            } else {
                                newData = {...newData, ticketID: r.data.data};
                                setData(prev => ({
                                    ...prev,
                                    tickets: prev.tickets ? prev.tickets.concat(newData) : [newData],
                                }));
                            }

                            setSnackbarMessage('Create ticket successfully')
                            setHasUnsavedChanges(true);
                        })
                        .catch(err => console.log(err));
                }
                else{
                    eventAxiosWithToken.post(`/tickets/add?${params}`, newData)
                        .then(r => {
                            newData = {...newData, ticketID: r.data.data};
                            setData(prev => ({
                                ...prev,
                                tickets: prev.tickets ? prev.tickets.concat(newData) : [newData],
                                capacity: newCapacity
                            }));
                            setHasUnsavedChanges(true);
                            if (data.eventType === 'recurring') {
                                setShowSnackbar(true);
                                setSnackbarMessage('Your ticket was created and will appear on all time slots.');
                            }
                        })
                        .catch(err => console.log(err));
                }
            }
            formik.resetForm();
        },
    });

    function transformData(data) {
        if (tiers) {
            const validTierPrices = data.tierPrices.map((price, index) => ({
                price: price,
                totalAssignedSeats: tiers[index].assignedseats,
                tierID: tiers[index].seat_tier_id,
                currency: data.tierCurrencies?.[index]?.currency,
                currencySymbol: data.tierCurrencies?.[index]?.sign,
                currencyFullForm: data.tierCurrencies?.[index]?.label
            })).filter(tier => tier.price !== null && tier.price !== undefined && tier.price !== '');

            return {
                ticketID: data.ticketID,
                ticketType: openDetail.type,
                ticketName: data.ticketName,
                startDate: data.startDate.format('DD/MM/YYYY'),
                endDate: data.endDate.format('DD/MM/YYYY'),
                startTime: data.startTime.format('HH:mm'),
                endTime: data.endTime.format('HH:mm'),
                description: data.description,
                visibility: ticketVisibility[data.visibility].value,
                visibleStartDate: data.visibleStartDate ? data.visibleStartDate.format('DD/MM/YYYY') : null,
                visibleEndDate: data.visibleEndDate ? data.visibleEndDate.format('DD/MM/YYYY') : null,
                visibleStartTime: data.visibleStartTime ? data.visibleStartTime.format('HH:mm') : null,
                visibleEndTime: data.visibleEndTime ? data.visibleEndTime.format('HH:mm') : null,
                minPerOrder: data.minPerOrder,
                maxPerOrder: data.maxPerOrder ? data.maxPerOrder : 1,
                tierData: validTierPrices
            };
        }

        return {
            ticketID: data.ticketID,
            ticketType: openDetail.type,
            ticketName: data.ticketName,
            quantity: data.quantity,
            price: openDetail.type === 'free' ? 'free' : openDetail.type === 'donation' ? 'donation' : data.price,
            startDate: data.startDate.format('DD/MM/YYYY'),
            endDate: data.endDate.format('DD/MM/YYYY'),
            startTime: data.startTime.format('HH:mm'),
            endTime: data.endTime.format('HH:mm'),
            description: data.description,
            visibility: ticketVisibility[data.visibility].value,
            visibleStartDate: data.visibleStartDate ? data.visibleStartDate.format('DD/MM/YYYY') : null,
            visibleEndDate: data.visibleEndDate ? data.visibleEndDate.format('DD/MM/YYYY') : null,
            visibleStartTime: data.visibleStartTime ? data.visibleStartTime.format('HH:mm') : null,
            visibleEndTime: data.visibleEndTime ? data.visibleEndTime.format('HH:mm') : null,
            minPerOrder: data.minPerOrder,
            maxPerOrder: data.maxPerOrder ? data.maxPerOrder : 100,
            absorbFee: openDetail.type === 'donation' ? data.absorbFee : null,
            currency: data.currency,
            currencySymbol: data.sign,
            currencyFullForm: data.label
        };
    }

    function handleTypeSelect(type) {
        formik.setTouched({}, false)
        if (type === 'free') {
            formik.setFieldValue('price', 0);
        } else if (type === 'donation') {
            formik.setFieldValue('price', 0);
        } else formik.setFieldValue('price', '');
        setOpenDetail({type: type, open: true});
    }

    const ownerMaps = seatMap.filter(map => map.owner_id == getUserData("profileID"));
    const otherMaps = seatMap.filter(map => map.owner_id != getUserData("profileID"));

    const handleSelect = (mapId) => {
        const selectedSeatMap = seatMap.find(map => map.map_id === mapId)
        setSelectedSeatMap(selectedSeatMap)
        setData(prev => ({...prev, mapURL: selectedSeatMap.map_url}))
        eventAxiosWithToken.get(`/seat-map/tiers?smid=${mapId}`)
            .then(r => {
                setTiers(r.data)
            })
            .catch(err => console.log(err))
    };

    return (
        <Stack className={'organizer-create-ticket'} rowGap={2}>
            <Snackbar
                open={showSnackbar}
                anchorOrigin={{vertical: "top", horizontal: "right"}}
                sx={{marginTop: 6}}
                onClose={() => setShowSnackbar(false)}
                autoHideDuration={5000}
            >
                <Alert severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Stack>
                {(data.tickets && data.tickets.length !== 0 && !data.reserveSeating || tiers) ?
                    <>
                        {!!tiers &&
                            <div className={'link'} style={{marginBottom: '1rem'}}
                                onClick={() => setTiers(null)}
                            >
                                Back to map selection
                            </div>
                        }
                        <div className="tickets-section">
                            <div className="tickets-section__header">
                                <nav className="tickets-section__tabs">
                                    {tabs.map((tab) => (
                                        <NavLink
                                            key={tab.label}
                                            to={tab.to}
                                            className={({isActive}) => `tickets-section__tab ${isActive ? 'tickets-section__tab-active' : ''}`}
                                        >
                                            {tab.label}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                            <div className="tickets-section__content">
                                <Outlet context={{
                                    handleTypeSelect: handleTypeSelect,
                                    setOpenDetail: setOpenDetail,
                                    setEditTicket: setEditTicket,
                                    seatMap: selectedSeatMap,
                                    tiers
                                }}/>
                            </div>
                        </div>
                    </>
                    :
                    data.reserveSeating ?
                        seatMap.length > 0 ?
                            <Stack spacing={2} sx={{minWidth: '35rem'}}>
                                <Typography variant="h4"
                                            gutterBottom
                                            sx={{ fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                                    Select a Seat Map
                                </Typography>

                                <Typography variant="h5" gutterBottom
                                            sx={{
                                                borderBottom: '2px solid #007aa2',
                                                paddingBottom: '4px',
                                                color: '#007aa2',
                                                marginLeft: 2,
                                            }}
                                >
                                    Your Maps
                                </Typography>
                                <Grid container spacing={2}>
                                    {ownerMaps.map((map) => (
                                        <Grid item xs={12} sm={6} md={4} key={map.map_id}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    minWidth: '40rem',
                                                    width: '100%',
                                                    borderRadius: '12px',
                                                    border: '2px solid transparent',
                                                    background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
                                                    transition: 'all 0.3s ease-in-out',
                                                    '&:hover': {
                                                        border: '2px solid #007aa2',
                                                        backgroundColor: '#e0f7fa',
                                                        boxShadow: 6,
                                                    },
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => handleSelect(map.map_id)}
                                            >
                                                <CardContent>
                                                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} columnGap={5}>
                                                        <Typography variant="h6" sx={{ color: '#007aa2', fontWeight: 'bold' }}>{map.name}</Typography>
                                                        <Typography variant="body1">
                                                            Created at: {dayjs(map.created_at).format("HH:mm DD/MM/YYYY")} (Last changes: {dayjs(map.updated_at).fromNow()})
                                                        </Typography>
                                                    </Stack>
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="small" variant="contained" fullWidth
                                                            sx={{
                                                                backgroundColor: '#fff',
                                                                color: '#007aa2',
                                                                textTransform: 'none',
                                                                fontWeight: 'bold',
                                                                padding: '4px 12px',
                                                                boxShadow: 'none',
                                                                '&:hover': { backgroundColor: '#e0f7fa' },
                                                            }}
                                                    >
                                                        Select
                                                    </Button>
                                                    <Button fullWidth size="small" variant={'contained'}
                                                            onClick={() =>
                                                                navigate(`/create/seat-map?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}&mid=${map.map_id}`)}>
                                                        Edit
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {otherMaps.length > 0 &&
                                    <>
                                        <Typography variant="h5" gutterBottom
                                                    sx={{
                                                        marginTop: 3,
                                                        borderBottom: '2px solid #d32f2f',
                                                        paddingBottom: '4px',
                                                        color: '#d32f2f',
                                                        marginLeft: 2,
                                                    }}
                                        >
                                            Other Maps
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {otherMaps.map((map) => (
                                                <Grid item xs={12} sm={6} md={4} key={map.map_id}>
                                                    <Card
                                                        variant="outlined"
                                                        sx={{
                                                            borderRadius: '12px',
                                                            border: '2px solid transparent',
                                                            background: 'linear-gradient(135deg, #fdfbfb, #ebedee)',
                                                            transition: 'all 0.3s ease-in-out',
                                                            '&:hover': {
                                                                border: '2px solid #d32f2f',
                                                                backgroundColor: '#fce4ec',
                                                                boxShadow: 6,
                                                            },
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => handleSelect(map.map_id)}
                                                    >
                                                        <CardContent>
                                                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                                                <Typography variant="h6" sx={{ color: '#007aa2', fontWeight: 'bold' }}>{map.name}</Typography>
                                                                <Typography variant="body1">
                                                                    Created at: {dayjs(map.created_at).format("HH:mm DD/MM/YYYY")}
                                                                    (Last changes: {dayjs(map.updated_at).fromNow()})
                                                                </Typography>
                                                            </Stack>
                                                        </CardContent>
                                                        <CardActions>
                                                            <Button size="small" variant="contained" fullWidth
                                                                    sx={{
                                                                        backgroundColor: '#fff',
                                                                        color: '#007aa2',
                                                                        textTransform: 'none',
                                                                        fontWeight: 'bold',
                                                                        padding: '4px 12px',
                                                                        boxShadow: 'none',
                                                                        '&:hover': { backgroundColor: '#e0f7fa' },
                                                                    }}
                                                            >
                                                                Select
                                                            </Button>
                                                            <Button fullWidth size="small" onClick={() => navigate(`/create/seat-map?eid=${map.map_id}`)}
                                                                    variant={'contained'}>
                                                                Edit
                                                            </Button>
                                                        </CardActions>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </>
                                }
                            </Stack>
                            :
                            <Stack alignItems={'center'} rowGap={2}>
                                <LayersClearIcon sx={{ fontSize: '7.5rem', color: '#000000', backgroundColor: '#e3e3e3', p: 1, borderRadius: '50%' }} />
                                <Stack alignItems={'center'}>
                                    <Typography variant={'h5'} fontWeight={'bold'}>
                                        {t('ticket.noMapsFound')}
                                    </Typography>
                                    <Typography variant={'body1'}>
                                        {t('ticket.createMapPrompt')}
                                    </Typography>
                                </Stack>
                                <Button variant={'contained'} onClick={() => navigate(`/create/seat-map?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}`)}>
                                    {t('ticket.createButton')}
                                </Button>
                            </Stack>
                        :
                        <>
                            <p className={'organizer-create-ticket__title'}>{t('ticket.createTickets')}</p>
                            <p>{t('ticket.chooseTicketType')}</p>
                            <Stack className={'organizer-create-ticket__ticket-types'} rowGap={1}>
                                {ticketTypes.map((ticketType, index) => (
                                    <Stack key={index} className={'organizer-create-ticket__ticket-type'} flexDirection={'row'}
                                           onClick={() => handleTypeSelect(ticketType.name)}
                                    >
                                        <Stack direction={'row'} columnGap={2} alignItems={'center'}>
                                            {ticketType.name === 'free' ?
                                                <img style={{
                                                    backgroundColor: 'rgba(245,245,245,0.46)',
                                                    width: '3.5rem',
                                                    height: '3.5rem',
                                                    padding: '.25rem'
                                                }}
                                                     src={ticketType.icon} alt={t(`ticket.${ticketType.name}`)}/>
                                                : ticketType.icon}
                                            <Stack rowGap={1}>
                                                <p className={'ticket-type__title'}>{t(`ticket.${ticketType.name}`)}</p>
                                                <p className={'ticket-type__description'}>{ticketType.description}</p>
                                            </Stack>
                                        </Stack>
                                        <KeyboardArrowRightIcon/>
                                    </Stack>
                                ))}
                            </Stack>
                        </>
                }
            </Stack>
            <form onSubmit={formik.handleSubmit}>
                <Stack className={'organizer-create-ticket__detail'} sx={{display: openDetail.open ? 'flex' : 'none'}}>
                    <p>{t('ticket.addTickets')}</p>
                    <Stack className={'organizer-detail__main'} rowGap={2}>
                        {!tiers &&
                            <Stack direction={'row'} justifyContent={'space-between'}>
                                {['paid', 'free', 'donation'].map((type, index) => (
                                    <div key={index}
                                         className={`organizer-ticket-detail__ticket-type ${openDetail.type === type ? 'ticket-type-active' : ''}`}
                                         onClick={() => handleTypeSelect(type)}
                                    >
                                        {t(`ticket.${type}`)}
                                    </div>
                                ))}
                            </Stack>
                        }
                        <TextField name={'ticketName'} label={t('ticket.ticketNameLabel')} variant={'outlined'}
                                   fullWidth
                                   value={formik.values.ticketName} focused
                                   onChange={formik.handleChange} onBlur={formik.handleBlur}
                                   error={formik.touched.ticketName && Boolean(formik.errors.ticketName)}
                                   helperText={formik.touched.ticketName && formik.errors.ticketName}
                        />
                        {!tiers &&
                            <TextField name={'quantity'} label={t('ticket.availableQuantityLabel')} variant={'outlined'}
                                       fullWidth
                                       value={formik.values.quantity} focused
                                       onChange={formik.handleChange} onBlur={formik.handleBlur}
                                       error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                       helperText={formik.touched.quantity && formik.errors.quantity}
                            />
                        }
                        <Stack direction={'row'} columnGap={1}>
                            {tiers ?
                                <Stack spacing={2} sx={{ width: '100%' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Set prices for each tier
                                    </Typography>
                                    {tiers.map((tier, index) => (
                                        <Stack
                                            key={index}
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            sx={{
                                                borderRadius: '8px',
                                                paddingBlock: 1,
                                                paddingLeft: 1,
                                                border: '1px solid #e0e0e0',
                                                borderLeft: `4px solid ${tier.tier_color}`,
                                                backgroundColor: alpha(tier.tier_color, 0.05)
                                            }}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CurrencySelect
                                                    value={formik.values.tierCurrencies?.[index]?.currency || 'USD'}
                                                    customHandleChange={(value, sign, label) => {
                                                        formik.setFieldValue(`tierCurrencies.${index}.currency`, value);
                                                        formik.setFieldValue(`tierCurrencies.${index}.sign`, sign);
                                                        formik.setFieldValue(`tierCurrencies.${index}.label`, label);
                                                    }}
                                                />
                                                <TextField
                                                    name={`tierPrices.${index}`}
                                                    label={`Price for ${tier.name}`}
                                                    variant="outlined"
                                                    value={formik.values.tierPrices?.[index] || ''}
                                                    placeholder="0.00"
                                                    focused
                                                    disabled={openDetail.type === 'donation' || openDetail.type === 'free'}
                                                    onChange={(e) => {formik.setFieldValue(`tierPrices.${index}`, e.target.value);}}
                                                    onBlur={formik.handleBlur}
                                                    error={formik.touched.tierPrices?.[index] && Boolean(formik.errors.tierPrices?.[index])}
                                                    helperText={formik.touched.tierPrices?.[index] && formik.errors.tierPrices?.[index]}
                                                    sx={{ flexGrow: 1}}
                                                />
                                            </Stack>
                                        </Stack>
                                    ))}
                                </Stack>
                                :
                                <>
                                    {openDetail.type === 'paid' &&
                                        <CurrencySelect value={formik.values.currency} customHandleChange={
                                            (value, sign, label) => {
                                                formik.setFieldValue('currency', value)
                                                formik.setFieldValue('sign', sign)
                                                formik.setFieldValue('label', label)
                                            }
                                        }/>
                                    }
                                    <TextField name={'price'} label={t('ticket.priceLabel')} variant={'outlined'} fullWidth
                                               value={openDetail.type === 'free' ? t('ticket.free') : openDetail.type === 'donation' ? t('ticket.donation') : formik.values.price}
                                               placeholder={'0.00'} focused
                                               disabled={openDetail.type === 'donation' || openDetail.type === 'free'}
                                               onChange={formik.handleChange} onBlur={formik.handleBlur}
                                               error={formik.touched.price && Boolean(formik.errors.price)}
                                               helperText={formik.touched.price && formik.errors.price}
                                    />
                                </>
                            }
                        </Stack>
                        {openDetail.type === 'Donation' &&
                            <Stack direction={'row'} alignItems={'center'} marginBlock={'0 .5rem'}>
                                <Checkbox checked={formik.values.absorbFee}
                                          onChange={() => formik.setFieldValue('absorbFee', !formik.values.absorbFee)}/>
                                <p style={{fontSize: '.8rem'}}>{t('ticket.absorbFeesDescription')}</p>
                            </Stack>
                        }
                        <Stack direction={'row'} columnGap={1}>
                            <DatePicker name={'startDate'} label={t('ticket.salesStartLabel')}
                                        value={formik.values.startDate}
                                        onChange={(date) => formik.setFieldValue('startDate', date)}
                                        disablePast format={'DD/MM/YYYY'}
                                        slotProps={{
                                            textField: {
                                                onBlur: formik.handleBlur,
                                                error: formik.touched.startDate && Boolean(formik.errors.startDate),
                                                helperText: formik.touched.startDate && formik.errors.startDate,
                                            },
                                        }}
                            />
                            <TimePicker name={'startTime'} label={t('ticket.startTimeLabel')}
                                        value={formik.values.startTime} ampm={false}
                                        onChange={(date) => formik.setFieldValue('startTime', date)}
                                        slotProps={{
                                            textField: {
                                                onBlur: formik.handleBlur,
                                                error: formik.touched.startTime && Boolean(formik.errors.startTime),
                                                helperText: formik.touched.startTime && formik.errors.startTime,
                                            },
                                        }}
                            />
                        </Stack>
                        <Stack direction={'row'} columnGap={1}>
                            <DatePicker name={'endDate'} label={t('ticket.salesEndLabel')}
                                        value={formik.values.endDate}
                                        onChange={(date) => formik.setFieldValue('endDate', date)}
                                        disablePast format={'DD/MM/YYYY'}
                                        slotProps={{
                                            textField: {
                                                onBlur: formik.handleBlur,
                                                error: formik.touched.endDate && Boolean(formik.errors.endDate),
                                                helperText: formik.touched.endDate && formik.errors.endDate,
                                            },
                                        }}
                            />
                            <TimePicker name={'endTime'} label={t('ticket.endTimeLabel')}
                                        value={formik.values.endTime} ampm={false}
                                        onChange={(date) => formik.setFieldValue('endTime', date)}
                                        error={formik.touched.endTime && Boolean(formik.errors.endTime)}
                                        slotProps={{
                                            textField: {
                                                onBlur: formik.handleBlur,
                                                error: formik.touched.endTime && Boolean(formik.errors.endTime),
                                                helperText: formik.touched.endTime && formik.errors.endTime,
                                            },
                                        }}
                            />
                        </Stack>
                        <Stack direction={'row'} alignItems={'center'} columnGap={.5}>
                            <Typography
                                variant={'caption'}>{t('ticket.eventTimezone')} {new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1]}</Typography>
                        </Stack>
                        <AccordionGroup transition={{
                            initial: "0.3s ease-out",
                            expanded: "0.2s ease",
                        }}>
                            <Accordion sx={{p: 0, m: 0}} defaultExpanded>
                                <AccordionSummary>
                                    <Typography component="span">{t('ticket.advancedOptions')}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack rowGap={1}>
                                        <TextAreaWithLimit value={formik.values.description} maxChars={2500} rows={3}
                                                           handleChange={formik.handleChange} onBlur={formik.handleBlur}
                                                           name={'description'}
                                                           placeholder={t('ticket.ticketDescriptionPlaceholder')}
                                        />
                                        <Dropdown open={open} onOpenChange={handleOpenChange}>
                                            <MenuButton>
                                               {t(`ticket.visibility-status.${ticketVisibility[formik.values.visibility]?.label.toLowerCase()}`) || t('ticket.visible')}
                                            </MenuButton>
                                            <Menu>
                                                {ticketVisibility.map((visibility, index) => (
                                                    <MenuItem key={index} onClick={() => {
                                                        formik.setFieldValue('visibility', index)
                                                        setOpen(false)
                                                    }}>
                                                        {t(`ticket.visibility-status.${visibility.value.toLowerCase()}`)}
                                                    </MenuItem>
                                                ))}
                                            </Menu>
                                        </Dropdown>

                                        {ticketVisibility[formik.values.visibility].value === 'custom' &&
                                            <Stack rowGap={1} marginBlock={1}>
                                                <Stack direction={'row'} columnGap={1}>
                                                    <DatePicker name={'visibleStartDate'}
                                                                label={t('ticket.visibleStartLabel')}
                                                                value={formik.values.visibleStartDate}
                                                                onChange={(date) => formik.setFieldValue('visibleStartDate', date)}
                                                                disablePast format={'DD/MM/YYYY'}
                                                                slotProps={{
                                                                    textField: {
                                                                        onBlur: formik.handleBlur,
                                                                        error: formik.touched.visibleStartDate && Boolean(formik.errors.visibleStartDate),
                                                                        helperText: formik.touched.visibleStartDate && formik.errors.visibleStartDate,
                                                                    },
                                                                }}
                                                    />
                                                    <TimePicker name={'visibleStartTime'}
                                                                label={t('ticket.startTimeLabel')}
                                                                value={formik.values.visibleStartTime} ampm={false}
                                                                onChange={(date) => formik.setFieldValue('visibleStartTime', date)}
                                                                slotProps={{
                                                                    textField: {
                                                                        onBlur: formik.handleBlur,
                                                                        error: formik.touched.visibleStartTime && Boolean(formik.errors.visibleStartTime),
                                                                        helperText: formik.touched.visibleStartTime && formik.errors.visibleStartTime,
                                                                    },
                                                                }}
                                                    />
                                                </Stack>
                                                <Stack direction={'row'} columnGap={1}>
                                                    <DatePicker name={'visibleEndDate'}
                                                                label={t('ticket.visibleEndLabel')}
                                                                value={formik.values.visibleEndDate}
                                                                onChange={(date) => formik.setFieldValue('visibleEndDate', date)}
                                                                disablePast format={'DD/MM/YYYY'}
                                                                slotProps={{
                                                                    textField: {
                                                                        onBlur: formik.handleBlur,
                                                                        error: formik.touched.visibleEndDate && Boolean(formik.errors.visibleEndDate),
                                                                        helperText: formik.touched.visibleEndDate && formik.errors.visibleEndDate,
                                                                    },
                                                                }}
                                                    />
                                                    <TimePicker name={'visibleEndTime'} label={t('ticket.endTimeLabel')}
                                                                value={formik.values.visibleEndTime} ampm={false}
                                                                onChange={(date) => formik.setFieldValue('visibleEndTime', date)}
                                                                error={formik.touched.visibleEndTime && Boolean(formik.errors.visibleEndTime)}
                                                                slotProps={{
                                                                    textField: {
                                                                        onBlur: formik.handleBlur,
                                                                        error: formik.touched.visibleEndTime && Boolean(formik.errors.visibleEndTime),
                                                                        helperText: formik.touched.visibleEndTime && formik.errors.visibleEndTime,
                                                                    },
                                                                }}
                                                    />
                                                </Stack>
                                            </Stack>
                                        }

                                        <Stack rowGap={1}>
                                            <p>{t('ticket.ticketsPerOrder')}</p>
                                            <Stack direction={'row'} columnGap={1}>
                                                <TextField
                                                    key={`min-${formik.values.minPerOrder}`}
                                                    name={'minPerOrder'}
                                                    label={t('ticket.minQuantityLabel')}
                                                    variant={'outlined'}
                                                    fullWidth
                                                    value={formik.values.minPerOrder}
                                                    focused
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    error={formik.touched.minPerOrder && Boolean(formik.errors.minPerOrder)}
                                                    helperText={formik.touched.minPerOrder && formik.errors.minPerOrder}
                                                />
                                                <TextField
                                                    key={`max-${formik.values.maxPerOrder}`}
                                                    name={'maxPerOrder'}
                                                    label={t('ticket.maxQuantityLabel')}
                                                    variant={'outlined'}
                                                    fullWidth
                                                    value={formik.values.maxPerOrder}
                                                    focused
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    error={formik.touched.maxPerOrder && Boolean(formik.errors.maxPerOrder)}
                                                    helperText={formik.touched.maxPerOrder && formik.errors.maxPerOrder}
                                                />
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        </AccordionGroup>
                    </Stack>
                    <Stack direction={'row'} className={'organizer-ticket-detail__actions'} columnGap={1}>
                        <button type={'button'} onClick={() => {
                            setOpenDetail({type: null, open: false})
                            formik.resetForm()
                        }}>{t('ticket.cancel')}</button>
                        <button type={'submit'}>{t('ticket.save')}</button>
                    </Stack>
                </Stack>
            </form>
        </Stack>
    );
}

export default OrganizerCreateTicket