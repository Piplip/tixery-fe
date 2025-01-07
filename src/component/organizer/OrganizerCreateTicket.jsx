import "../../styles/organizer-create-tickets-styles.css"
import {Checkbox, MenuItem, Stack, TextField, Tooltip, Typography} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FreeIcon from "../../assets/free-icon.png"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {useCallback, useEffect, useState} from "react";
import * as Yup from "yup";
import {useFormik} from "formik";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {Accordion, AccordionDetails, AccordionGroup, AccordionSummary} from "@mui/joy";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TextAreaWithLimit from "../TextAreaWithLimit.jsx";
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {NavLink, Outlet, useLocation, useNavigate, useOutletContext} from "react-router-dom";

const ticketTypes = [
    {
        name: 'Free',
        icon: FreeIcon,
        description: 'Create a free ticket for your event.',
    },
    {
        name: 'Paid',
        icon: <ReceiptIcon sx={{color: '#007aa2', backgroundColor: '#fafafa', width: '3.5rem', height: '3.5rem', p: 1}}/>,
        description: 'Sell tickets to your event and start making money.',
    },
    {
        name: 'Donation',
        icon: <FavoriteBorderIcon sx={{color: 'red', backgroundColor: '#fdecff', width: '3.5rem', height: '3.5rem', p: 1}}/>,
        description: 'Let attendees choose how much they want to pay for a ticket.',
    }
]

const tabs = [
    { label: 'Admission', to: '/tickets/admission' },
    { label: 'Add-ons', to: '/tickets/add-ons' },
    { label: 'Promotions', to: '/tickets/promotions' },
    { label: 'Holds', to: '/tickets/holds' },
    { label: 'Settings', to: '/tickets/settings' },
];

const ticketVisibility = [
    { label: 'Visible', value: 'visible' },
    { label: 'Hidden', value: 'hidden' },
    { label: 'Hidden when not on sale', value: 'hid-on-sale' },
    { label: 'Custom', value: 'custom' },
]

function OrganizerCreateTicket(){
    const [open, setOpen] = useState(false)
    const {validate} = useOutletContext()
    const [tickets, setTickets] = useState([])
    const [openDetail, setOpenDetail] = useState({
        type: null, open: false
    });
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!validate(0) && location.pathname.includes('tickets')) {
            const basePath = location.pathname.split('/tickets')[0];
            navigate(basePath);
        }
    }, [location]);

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
        price: Yup.mixed().when('type', {
            is: 'Paid',
            then: Yup.number().required('Price is required').typeError('Price must be a number'),
            otherwise: Yup.mixed().notRequired()
        }),
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
            ),
        endDate: Yup.date() .required('End date is required')
            .typeError('End date must be a valid date')
            .test(
                'is-after-start-date',
                'End date must be later than the start date',
                function (value) {
                    const { startDate } = this.parent;
                    return !startDate || !value || value >= startDate;
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
        minQuantity: Yup.number()
            .required("Minimum quantity is required."),
        maxQuantity: Yup.number()
            .required("Maximum quantity is required."),
    });

    const formik = useFormik({
        initialValues: {
            ticketName: "", quantity: '', price: '', startDate: null, endDate: null, startTime: null, endTime: null,
            minPerOrder: 1, maxPerOrder: 10, visibility: 0, description: ''
        },
        validationSchema,
        onSubmit: (values) => {
            console.log(values)
        },
    });

    function handleTypeSelect(type){
        formik.setTouched({}, false)
        if(type === 'Free'){
            formik.setFieldValue('price', 'Free');
        }
        else if(type === 'Donation'){
            formik.setFieldValue('price', 'Attendees can donate what they wish');
        }
        else formik.setFieldValue('price', '');
        setOpenDetail({type: type, open: true});
    }

    // TODO: Fix the price validation for donation and free tickets
    // TODO: Handle the form submission

    return (
        <Stack className={'organizer-create-ticket'} rowGap={2}>
            <p className={'organizer-create-ticket__title'}>Create tickets</p>
            <p>Choose a ticket type or build a section with multiple ticket types.</p>
            {tickets.length === 0 ?
                <Stack className={'organizer-create-ticket__ticket-types'} rowGap={1}>
                    {ticketTypes.map((ticketType, index) => (
                        <Stack key={index} className={'organizer-create-ticket__ticket-type'} flexDirection={'row'}
                               onClick={() => handleTypeSelect(ticketType.name)}
                        >
                            <Stack direction={'row'} columnGap={2} alignItems={'center'}>
                                {ticketType.name === 'Free' ?
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
                :
                <div className="tickets-section">
                    <div className="tickets-section__header">
                        <nav className="tickets-section__tabs">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.label}
                                    to={tab.to}
                                    className="tickets-section__tab"
                                >
                                    {tab.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                    <div className="tickets-section__content">
                        <Outlet />
                    </div>
                </div>
            }
            <form onSubmit={formik.handleSubmit}>
                <Stack className={'organizer-create-ticket__detail'} sx={{display: openDetail.open ? 'flex' : 'none'}}>
                    <p>Add tickets</p>
                    <Stack className={'organizer-detail__main'} rowGap={2}>
                        <Stack direction={'row'} justifyContent={'space-between'}>
                            {['Paid', 'Free', 'Donation'].map((type, index) => (
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
                                   value={formik.values.price} placeholder={'0.00'} focused
                                   disabled={openDetail.type === 'Donation' || openDetail.type === 'Free'}
                                   onChange={formik.handleChange} onBlur={formik.handleBlur}
                                   error={formik.touched.price && Boolean(formik.errors.price)}
                                   helperText={formik.touched.price && formik.errors.price}
                        />
                        {openDetail.type === 'Donation' &&
                            <Stack direction={'row'} alignItems={'center'} marginBlock={'0 .5rem'}>
                                <Checkbox defaultChecked={false}/>
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