import "../../styles/organizer-create-tickets-styles.css"
import {Alert, Checkbox, MenuItem, Snackbar, Stack, TextField, Typography} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FreeIcon from "../../../public/assets/free-icon.png"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {useCallback, useContext, useEffect, useState} from "react";
import * as Yup from "yup";
import {useFormik} from "formik";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {Accordion, AccordionDetails, AccordionGroup, AccordionSummary} from "@mui/joy";
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
    const {validate, setAlert, setCurrentStep} = useOutletContext()
    const [openDetail, setOpenDetail] = useState({
        type: null, open: false
    });
    const navigate = useNavigate()
    const location = useLocation()
    const [editTicket, setEditTicket] = useState(null)
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const tabs = [
        { label: t('ticket.admission'), to: '' },
        { label: t('ticket.addOns'), to: 'add-ons' },
        { label: t('ticket.promotions'), to: 'promotions' },
        { label: t('ticket.holds'), to: 'holds' },
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
            setInitialValues({
                ticketID: data.tickets[editTicket].ticketID,
                ticketName: data.tickets[editTicket].ticketName,
                quantity: data.tickets[editTicket].quantity,
                price: data.tickets[editTicket].price,
                startDate: data.tickets[editTicket].startDate ? dayjs(data.tickets[editTicket].startDate, 'DD/MM/YYYY') : null,
                endDate: data.tickets[editTicket].endDate ? dayjs(data.tickets[editTicket].endDate, 'DD/MM/YYYY') : null,
                startTime: data.tickets[editTicket].startTime ? dayjs(data.tickets[editTicket].startTime, 'HH:mm') : null,
                endTime: data.tickets[editTicket].endTime ? dayjs(data.tickets[editTicket].endTime, 'HH:mm') : null,
                minPerOrder: data.tickets[editTicket].minPerOrder,
                maxPerOrder: data.tickets[editTicket].maxPerOrder,
                visibility: ticketVisibility.findIndex(v => v.value === data.tickets[editTicket].visibility),
                description: data.tickets[editTicket].description,
                visibleStartDate: data.tickets[editTicket].visibleStartDate ? dayjs(data.tickets[editTicket].visibleStartDate, 'DD/MM/YYYY') : null,
                visibleEndDate: data.tickets[editTicket].visibleEndDate ? dayjs(data.tickets[editTicket].visibleEndDate, 'DD/MM/YYYY') : null,
                visibleStartTime: data.tickets[editTicket].visibleStartTime ? dayjs(data.tickets[editTicket].visibleStartTime, 'HH:mm') : null,
                visibleEndTime: data.tickets[editTicket].visibleEndTime ? dayjs(data.tickets[editTicket].visibleEndTime, 'HH:mm') : null,
                absorbFee: data.tickets[editTicket].absorbFee,
                currency: data.tickets[editTicket]?.currency
            });
        } else {
            setInitialValues({
                ticketName: "",
                quantity: '',
                price: '',
                startDate: null,
                endDate: null,
                startTime: null,
                endTime: null,
                minPerOrder: '',
                maxPerOrder: '',
                visibility: 0,
                description: '',
                visibleStartDate: null,
                visibleEndDate: null,
                visibleStartTime: null,
                visibleEndTime: null,
                absorbFee: false,
                currency: 'USD',
            });
        }
    }, [data.tickets, editTicket]);

    const handleOpenChange = useCallback((event, isOpen) => {
        setOpen(isOpen);
    }, []);

    const validationSchema = Yup.object().shape({
        ticketName: Yup.string()
            .required("Ticket name is required.")
            .max(50, "Ticket name type cannot exceed 50 characters."),
        quantity: Yup.number()
            .moreThan(1, "Quantity must be greater than 1.")
            .typeError("Quantity must be a number.")
            .required("Quantity is required."),
        price: Yup.mixed().nullable()
            .test(
                'is-valid-price',
                'Price must be a valid number.',
                function () {
                    if (openDetail.type === 'free' || openDetail.type === 'donation') {
                        return true;
                    } else {
                        return this.parent.price > 0 && this.parent.price !== undefined;
                    }
                }
            ),
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
        minPerOrder: 1,
        maxPerOrder: 1,
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
            let newCapacity = data.capacity;
            let newData = transformData(values);

            if (editTicket !== null) {
                newCapacity = Number(newCapacity + values.quantity - data.tickets[editTicket].quantity);
                eventAxiosWithToken.put(`/tickets/update?tid=${values.ticketID}&timezone=${data.timezone}`, newData)
                    .then(() => {
                        const updatedTickets = [...data.tickets];
                        updatedTickets[editTicket] = newData;
                        setData({...data, tickets: updatedTickets, capacity: newCapacity});
                        setHasUnsavedChanges(true);
                    })
                    .catch(err => console.log(err));
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
            formik.resetForm();
        },
    });

    function transformData(data) {
        return {
            ticketID: data.ticketID,
            ticketType: openDetail.type,
            ticketName: data.ticketName,
            quantity: data.quantity,
            price: openDetail.type === 'Free' ? 'free' : openDetail.type === 'Donation' ? 'donation' : data.price,
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
            absorbFee: openDetail.type === 'Donation' ? data.absorbFee : null,
            currency: data.currency,
            currencySymbol: data.sign,
            currencyFullForm: data.label
        }
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
            <p className={'organizer-create-ticket__title'}>{t('ticket.createTickets')}</p>
            <p>{t('ticket.chooseTicketType')}</p>
            {data.tickets && data.tickets.length !== 0 ?
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
                            setEditTicket: setEditTicket
                        }}/>
                    </div>
                </div>
                :
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
            }
            <form onSubmit={formik.handleSubmit}>
                <Stack className={'organizer-create-ticket__detail'} sx={{display: openDetail.open ? 'flex' : 'none'}}>
                    <p>{t('ticket.addTickets')}</p>
                    <Stack className={'organizer-detail__main'} rowGap={2}>
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
                        <TextField name={'ticketName'} label={t('ticket.ticketNameLabel')} variant={'outlined'}
                                   fullWidth
                                   value={formik.values.ticketName} focused
                                   onChange={formik.handleChange} onBlur={formik.handleBlur}
                                   error={formik.touched.ticketName && Boolean(formik.errors.ticketName)}
                                   helperText={formik.touched.ticketName && formik.errors.ticketName}
                        />
                        <TextField name={'quantity'} label={t('ticket.availableQuantityLabel')} variant={'outlined'}
                                   fullWidth
                                   value={formik.values.quantity} focused
                                   onChange={formik.handleChange} onBlur={formik.handleBlur}
                                   error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                   helperText={formik.touched.quantity && formik.errors.quantity}
                        />
                        <Stack direction={'row'} columnGap={1}>
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
                                                <TextField name={'minPerOrder'} label={t('ticket.minQuantityLabel')}
                                                           variant={'outlined'} fullWidth
                                                           value={formik.values.minPerOrder} focused
                                                           onChange={formik.handleChange} onBlur={formik.handleBlur}
                                                           error={formik.touched.minPerOrder && Boolean(formik.errors.minPerOrder)}
                                                           helperText={formik.touched.minPerOrder && formik.errors.minPerOrder}
                                                />
                                                <TextField name={'maxPerOrder'} label={t('ticket.maxQuantityLabel')}
                                                           variant={'outlined'} fullWidth
                                                           value={formik.values.maxPerOrder} focused
                                                           onChange={formik.handleChange} onBlur={formik.handleBlur}
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