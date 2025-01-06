import "../../styles/organizer-create-tickets-styles.css"
import {Checkbox, MenuItem, Stack, TextField, Tooltip, Typography} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FreeIcon from "../../assets/free-icon.png"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {useState} from "react";
import * as Yup from "yup";
import {useFormik} from "formik";
import dayjs from "dayjs";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {Accordion, AccordionDetails, AccordionGroup, AccordionSummary} from "@mui/joy";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TextAreaWithLimit from "../TextAreaWithLimit.jsx";
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {NavLink, Outlet} from "react-router-dom";

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

function OrganizerCreateTicket(){
    const [tickets, setTickets] = useState([])
    const [openDetail, setOpenDetail] = useState({
        type: null, open: false
    });

    const tabs = [
        { label: 'Admission', to: '/tickets/admission' },
        { label: 'Add-ons', to: '/tickets/add-ons' },
        { label: 'Promotions', to: '/tickets/promotions' },
        { label: 'Holds', to: '/tickets/holds' },
        { label: 'Settings', to: '/tickets/settings' },
    ];

    const validationSchema = Yup.object().shape({
        ticketName: Yup.string()
            .required("Ticket name is required.")
            .max(50, "Ticket name type cannot exceed 50 characters."),
        quantity: Yup.number()
            .required("Quantity is required."),
        price: Yup.mixed().oneOf([Yup.string(), Yup.number(), Yup.array()]).required('Price is required'),
        startDate: Yup.date()
            .required("Start date is required."),
        endDate: Yup.date()
            .required("End date is required."),
        minQuantity: Yup.number()
            .required("Minimum quantity is required."),
        maxQuantity: Yup.number()
            .required("Maximum quantity is required."),
    });

    const formik = useFormik({
        initialValues: {
            ticketName: "", quantity: '', price: '', startDate: dayjs(), endDate: dayjs(),
        },
        validationSchema,
        onSubmit: (values) => {
            alert("Event Overview Submitted Successfully!");
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
                                    error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                                    helperText={formik.touched.startDate && formik.errors.startDate}
                        />
                        <TimePicker name={'startTime'} label={'Start time'} value={formik.values.startDate}
                                    onChange={(date) => formik.setFieldValue('startDate', date)}
                                    error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                                    helperText={formik.touched.startDate && formik.errors.startDate}
                        />
                    </Stack>
                    <Stack direction={'row'} columnGap={1}>
                        <DatePicker name={'endDate'} label={'Sales end'} value={formik.values.endDate}
                                    onChange={(date) => formik.setFieldValue('endDate', date)}
                                    error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                                    helperText={formik.touched.endDate && formik.errors.endDate}
                        />
                        <TimePicker name={'endTime'} label={'End time'} value={formik.values.endDate}
                                    onChange={(date) => formik.setFieldValue('endDate', date)}
                                    error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                                    helperText={formik.touched.endDate && formik.errors.endDate}
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
                        <Accordion sx={{p: 0, m: 0}}>
                            <AccordionSummary>
                                <Typography component="span">Advanced Options</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack rowGap={1}>
                                    <TextAreaWithLimit value={''} maxChars={2500} rows={3}
                                                       placeholder={'Tell attendee more about this ticket'}/>
                                    <Dropdown>
                                        <MenuButton>
                                            Visibility
                                            <ArrowDropDownIcon/>
                                        </MenuButton>
                                        <Menu>
                                            <MenuItem>Visible</MenuItem>
                                            <MenuItem>Hidden</MenuItem>
                                            <MenuItem>Hidden when not on sales</MenuItem>
                                            <MenuItem>Custom</MenuItem>
                                        </Menu>
                                    </Dropdown>

                                    <Stack rowGap={1}>
                                        <p>Tickets per order</p>
                                        <Stack direction={'row'} columnGap={1}>
                                            <TextField name={'minQuantity'} label={'Minimum Quantity'}
                                                       variant={'outlined'} fullWidth
                                                       value={formik.values.minQuantity} focused size={'small'}
                                                       onChange={formik.handleChange} onBlur={formik.handleBlur}
                                                       error={formik.touched.minQuantity && Boolean(formik.errors.minQuantity)}
                                                       helperText={formik.touched.minQuantity && formik.errors.minQuantity}
                                            />
                                            <TextField name={'maxQuantity'} label={'Maximum Quantity'}
                                                       variant={'outlined'} fullWidth
                                                       value={formik.values.maxQuantity} focused size={'small'}
                                                       onChange={formik.handleChange} onBlur={formik.handleBlur}
                                                       error={formik.touched.maxQuantity && Boolean(formik.errors.maxQuantity)}
                                                       helperText={formik.touched.maxQuantity && formik.errors.maxQuantity}
                                            />
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    </AccordionGroup>
                </Stack>
                <Stack direction={'row'} className={'organizer-ticket-detail__actions'} columnGap={1}>
                    <button onClick={() => setOpenDetail({type: null, open: false})}>Cancel</button>
                    <button>Save</button>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default OrganizerCreateTicket