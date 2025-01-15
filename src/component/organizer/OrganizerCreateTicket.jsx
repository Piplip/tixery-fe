import "../../styles/organizer-create-tickets-styles.css"
import {Checkbox, MenuItem, Stack, TextField, Tooltip, Typography} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FreeIcon from "../../assets/free-icon.png"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {useCallback, useContext, useEffect, useState} from "react";
import * as Yup from "yup";
import {useFormik} from "formik";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {Accordion, AccordionDetails, AccordionGroup, AccordionSummary} from "@mui/joy";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TextAreaWithLimit from "../shared/TextAreaWithLimit.jsx";
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import {NavLink, Outlet, useLocation, useNavigate, useOutletContext} from "react-router-dom";
import {EventContext} from "../../context.js";
import dayjs from "dayjs";
import "../../styles/organizer-create-ticket-styles.scss"
import {eventAxiosWithToken} from "../../config/axiosConfig.js";

const ticketTypes = [
    {
        name: 'free',
        icon: FreeIcon,
        description: 'Create a free ticket for your event.',
    },
    {
        name: 'paid',
        icon: <ReceiptIcon sx={{color: '#007aa2', backgroundColor: '#fafafa', width: '3.5rem', height: '3.5rem', p: 1}}/>,
        description: 'Sell tickets to your event and start making money.',
    },
    {
        name: 'donation',
        icon: <FavoriteBorderIcon sx={{color: 'red', backgroundColor: '#fdecff', width: '3.5rem', height: '3.5rem', p: 1}}/>,
        description: 'Let attendees choose how much they want to pay for a ticket.',
    }
]

const tabs = [
    { label: 'Admission', to: '' },
    { label: 'Add-ons', to: 'add-ons' },
    { label: 'Promotions', to: 'promotions' },
    { label: 'Holds', to: 'holds' },
    { label: 'Settings', to: 'settings' },
];

const ticketVisibility = [
    { label: 'Visible', value: 'visible' },
    { label: 'Hidden', value: 'hidden' },
    { label: 'Hidden when not on sale', value: 'hid-on-sale' },
    { label: 'Custom', value: 'custom' },
]

function OrganizerCreateTicket(){
    const [open, setOpen] = useState(false)
    const {data, setData} = useContext(EventContext)
    const {validate} = useOutletContext()
    const [openDetail, setOpenDetail] = useState({
        type: null, open: false
    });
    const navigate = useNavigate()
    const location = useLocation()
    const [editTicket, setEditTicket] = useState(null)

    useEffect(() => {
        const msg = validate(0)
        if (typeof msg === 'string' && location.pathname.includes('tickets')) {
            const basePath = location.pathname.split('/tickets')[0];
            navigate(basePath);
        }
    }, [location]);

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
                absorbFee: data.tickets[editTicket].absorbFee
            });
        }
        else{
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
                absorbFee: false
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
            .typeError("Quantity must be a number.")
            .required("Quantity is required."),
        price: Yup.mixed().nullable()
            .test(
                'is-valid-price',
                'Price must be a valid number.',
                function (){
                    if(openDetail.type === 'free' || openDetail.type === 'donation'){
                        return true;
                    }
                    else {
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
                    const { endDate } = this.parent;
                    return !endDate || !value || value <= endDate;
                }
            )
            .test(
                'is-before-event-start',
                'Ticket sales start date should be before the event start date',
                function (value) {
                    if (!value) return true;

                    const ticketSalesDate = dayjs(value);
                    const eventStartDate = dayjs(data.eventDate, "DD/MM/YYYY");

                    if (!ticketSalesDate.isValid() || !eventStartDate.isValid()) {
                        return false;
                    }

                    return ticketSalesDate.isBefore(eventStartDate);
                }
            ),
        endDate: Yup.date() .required('End date is required')
            .typeError('End date must be a valid date')
            .test(
                'is-after-start-date',
                'End date must be after the start date',
                function (value) {
                    const { startDate } = this.parent;
                    return !startDate || !value || value >= startDate;
                }
            )
            .test(
                'is-before-event-start',
                'Ticket sales start date should be before the event start date',
                function (value) {
                    if (!value) return true;

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
                    const { startTime, startDate, endDate } = this.parent;
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
                    const { visibility } = this.parent;
                    return ticketVisibility[visibility].value !== 'custom' || value !== null;
                }
            )
            .test(
                'is-before-visible-end-date',
                'Visible start date must be earlier than the end date',
                function (value) {
                    const { visibility, visibleEndDate } = this.parent;
                    return ticketVisibility[visibility].value !== 'custom' || !visibleEndDate || !value || value <= visibleEndDate;
                }
            ),
        visibleEndDate: Yup.date().nullable()
            .test(
                'is-after-visible-start-date',
                'Visible end date must be later than the start date',
                function (value) {
                    const { visibility, visibleStartDate } = this.parent;
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
        minPerOrder: '',
        maxPerOrder: '',
        visibility: 0,
        description: '',
        visibleStartDate: null,
        visibleEndDate: null,
        visibleStartTime: null,
        visibleEndTime: null,
        absorbFee: false
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            setOpenDetail({type: null, open: false})
            let newData = transformData(values)
            if (editTicket !== null) {
                eventAxiosWithToken.put(`/tickets/update?tid=${values.ticketID}&timezone=${data.timezone}`, newData)
                    .then(r => {
                        console.log(r.data)
                        const updatedTickets = [...data.tickets];
                        updatedTickets[editTicket] = newData;
                        setData({...data, tickets: updatedTickets});
                    })
                    .catch(err => console.log(err))
            } else {
                eventAxiosWithToken.post(`/tickets/add?eid=${location.pathname.split('/')[3]}&timezone=${data.timezone}`, newData)
                    .then(r => {
                        console.log(r.data)
                        newData = {...newData, ticketID: r.data.data};
                        setData(prev => ({...prev, tickets: prev.tickets ? prev.tickets.concat(newData) : [newData]}));
                    })
                    .catch(err => console.log(err));
            }
            formik.resetForm()
        },
    });

    function transformData(data){
        return {
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
            absorbFee: openDetail.type === 'Donation' ? data.absorbFee : null
        }
    }

    function handleTypeSelect(type){
        formik.setTouched({}, false)
        if(type === 'free'){
            formik.setFieldValue('price', 0);
        }
        else if(type === 'donation'){
            formik.setFieldValue('price', 0);
        }
        else formik.setFieldValue('price', '');
        setOpenDetail({type: type, open: true});
    }

    return (
        <Stack className={'organizer-create-ticket'} rowGap={2}>
            <p className={'organizer-create-ticket__title'}>Create tickets</p>
            <p>Choose a ticket type or build a section with multiple ticket types.</p>
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
                        <Outlet context={{handleTypeSelect: handleTypeSelect, setOpenDetail: setOpenDetail, setEditTicket: setEditTicket}}/>
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
                                         src={ticketType.icon} alt={ticketType.name}/>
                                    : ticketType.icon}
                                <Stack rowGap={1}>
                                    <p className={'ticket-type__title'}>{ticketType.name}</p>
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
                    <p>Add tickets</p>
                    <Stack className={'organizer-detail__main'} rowGap={2}>
                        <Stack direction={'row'} justifyContent={'space-between'}>
                            {['paid', 'free', 'donation'].map((type, index) => (
                                <div key={index}
                                     className={`organizer-ticket-detail__ticket-type ${openDetail.type === type ? 'ticket-type-active' : ''}`}
                                     onClick={() => handleTypeSelect(type)}
                                >
                                    {type}
                                </div>
                            ))}
                        </Stack>
                        <TextField name={'ticketName'} label={'Ticket name'} variant={'outlined'} fullWidth
                                   value={formik.values.ticketName} focused
                                   onChange={formik.handleChange} onBlur={formik.handleBlur}
                                   error={formik.touched.ticketName && Boolean(formik.errors.ticketName)}
                                   helperText={formik.touched.ticketName && formik.errors.ticketName}
                        />
                        <TextField name={'quantity'} label={'Available Quantity'} variant={'outlined'} fullWidth
                                   value={formik.values.quantity} focused
                                   onChange={formik.handleChange} onBlur={formik.handleBlur}
                                   error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                   helperText={formik.touched.quantity && formik.errors.quantity}
                        />
                        <TextField name={'price'} label={'Price'} variant={'outlined'} fullWidth
                                   value={openDetail.type === 'free' ? 'Free' : openDetail.type === 'donation' ? 'Donation' : formik.values.price}
                                   placeholder={'0.00'} focused
                                   disabled={openDetail.type === 'donation' || openDetail.type === 'free'}
                                   onChange={formik.handleChange} onBlur={formik.handleBlur}
                                   error={formik.touched.price && Boolean(formik.errors.price)}
                                   helperText={formik.touched.price && formik.errors.price}
                        />
                        {openDetail.type === 'Donation' &&
                            <Stack direction={'row'} alignItems={'center'} marginBlock={'0 .5rem'}>
                                <Checkbox checked={formik.values.absorbFee} onChange={() => formik.setFieldValue('absorbFee', !formik.values.absorbFee)}/>
                                <p style={{fontSize: '.8rem'}}>Absorb fees: Ticketing fees are deducted from your donation
                                    amount</p>
                            </Stack>
                        }
                        <Stack direction={'row'} columnGap={1}>
                            <DatePicker name={'startDate'} label={'Sales start'} value={formik.values.startDate}
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
                            <TimePicker name={'startTime'} label={'Start time'} value={formik.values.startTime} ampm={false}
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
                            <DatePicker name={'endDate'} label={'Sales end'} value={formik.values.endDate}
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
                            <TimePicker name={'endTime'} label={'End time'} value={formik.values.endTime} ampm={false}
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
                            <Typography variant={'caption'}>Event time zone is KST</Typography>
                            <Tooltip title={'Test'} placement={'bottom'}>
                                <InfoOutlinedIcon sx={{fontSize: '.9rem'}}/>
                            </Tooltip>
                        </Stack>
                        <AccordionGroup transition={{
                            initial: "0.3s ease-out",
                            expanded: "0.2s ease",
                        }}>
                            <Accordion sx={{p: 0, m: 0}} defaultExpanded>
                                <AccordionSummary>
                                    <Typography component="span">Advanced Options</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack rowGap={1}>
                                        <TextAreaWithLimit value={formik.values.description} maxChars={2500} rows={3}
                                                          handleChange={formik.handleChange} onBlur={formik.handleBlur}
                                                           name={'description'}
                                                           placeholder={'Tell attendee more about this ticket'}
                                        />
                                        <Dropdown open={open} onOpenChange={handleOpenChange}>
                                            <MenuButton>
                                                Visibility: {ticketVisibility[formik.values.visibility].label || "Visible"}
                                            </MenuButton>
                                            <Menu>
                                                {ticketVisibility.map((visibility, index) => (
                                                    <MenuItem key={index} onClick={() => {
                                                        formik.setFieldValue('visibility', index)
                                                        setOpen(false)
                                                    }}>
                                                        {visibility.label}
                                                    </MenuItem>
                                                ))}
                                            </Menu>
                                        </Dropdown>

                                        {ticketVisibility[formik.values.visibility].value === 'custom' &&
                                            <Stack rowGap={1} marginBlock={1}>
                                                <Stack direction={'row'} columnGap={1}>
                                                    <DatePicker name={'visibleStartDate'} label={'Visible start'} value={formik.values.visibleStartDate}
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
                                                    <TimePicker name={'visibleStartTime'} label={'Start time'} value={formik.values.visibleStartTime} ampm={false}
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
                                                    <DatePicker name={'visibleEndDate'} label={'Visible end'} value={formik.values.visibleEndDate}
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
                                                    <TimePicker name={'visibleEndTime'} label={'End time'} value={formik.values.visibleEndTime} ampm={false}
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
                                            <p>Tickets per order</p>
                                            <Stack direction={'row'} columnGap={1}>
                                                <TextField name={'minPerOrder'} label={'Minimum Quantity'}
                                                           variant={'outlined'} fullWidth
                                                           value={formik.values.minPerOrder} focused
                                                           onChange={formik.handleChange} onBlur={formik.handleBlur}
                                                           error={formik.touched.minPerOrder && Boolean(formik.errors.minPerOrder)}
                                                           helperText={formik.touched.minPerOrder && formik.errors.minPerOrder}
                                                />
                                                <TextField name={'maxPerOrder'} label={'Maximum Quantity'}
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
                        }}>Cancel</button>
                        <button type={'submit'}>Save</button>
                    </Stack>
                </Stack>
            </form>
        </Stack>
    )
}

export default OrganizerCreateTicket