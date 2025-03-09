import {useContext, useEffect, useState} from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Button,
    Checkbox,
    Drawer,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Snackbar,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {DateCalendar, DatePicker, TimePicker} from "@mui/x-date-pickers";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CustomDay from "../shared/CustomDay.jsx";
import {useLocation} from "react-router-dom";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {EventContext} from "../../context.js";
import "../../styles/recurring-event-schedule-styles.css"
import {useTranslation} from "react-i18next";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore)

function RecurringEventSchedule() {
    const {t} = useTranslation()
    const {data, setData} = useContext(EventContext);
    const location = useLocation();
    const [events, setEvents] = useState(data?.events || {});
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [repeatOption, setRepeatOption] = useState("Once");
    const [repeatCadence, setRepeatCadence] = useState("Weekly");
    const [timeType, setTimeType] = useState("single");
    const [openDrawer, setOpenDrawer] = useState(false);
    const [repeatInterval, setRepeatInterval] = useState(15);
    const [timeSlot, setTimeSlot] = useState({
        startTime: dayjs().hour(9).minute(0),
        endTime: dayjs().hour(10).minute(0),
    });
    const [weeklyDays, setWeeklyDays] = useState([]);
    const [monthlyDay, setMonthlyDay] = useState(dayjs().date());
    const [slotDuration, setSlotDuration] = useState("Until event ends");
    const [editingSlots, setEditingSlots] = useState([]);
    const [openDateCard, setOpenDateCard] = useState(null);
    const [openEditDrawer, setOpenEditDrawer] = useState(false);
    const [openEditTicketDrawer, setOpenEditTicketDrawer] = useState(false);
    const [editDateKey, setEditDateKey] = useState(null);
    const [editSlots, setEditSlots] = useState([]);
    const [occurrenceTickets, setOccurrenceTickets] = useState(data?.occurrenceTickets || {});
    const [applyToMultipleDates, setApplyToMultipleDates] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [editingTickets, setEditingTickets] = useState([]);
    const [selectedTicketSlotKey, setSelectedTicketSlotKey] = useState(null);

    useEffect(() => {
        setData(prev => ({...prev,
            eventDate: events[Object.keys(events)[0]]?.startDate,
            eventStartTime: events[Object.keys(events)[0]]?.startTime,
        }))
    }, [events]);

    useEffect(() => {
        // Ensure data.tickets is defined before mapping
        const defaultTickets = data?.tickets?.map(ticket => ({
            ticketID: ticket.id,
            enabled: true,
            price: ticket.price,
            quantity: ticket.quantity
        })) || [];

        const initialOccurrenceTickets = {};
        for (const dateKey in events) {
            if (Array.isArray(events[dateKey])) {
                initialOccurrenceTickets[dateKey] = events[dateKey].map(slot => {
                    const slotKey = slot.occurrenceID || slot.startTime.valueOf();
                    return { [slotKey]: defaultTickets.map(t => ({ ...t })) }; // Deep copy default tickets for each slot
                });
            }
        }
        setOccurrenceTickets(initialOccurrenceTickets);
    }, [data.tickets, events]);

    useEffect(() => {
        if (editSlots.length > 0 && editDateKey) {
            const firstSlot = editSlots[0];
            const slotKey = firstSlot.occurrenceID ||
                dayjs(firstSlot.startTime).format("HH:mm");

            // Check if this formatted key exists
            const isValidKey = occurrenceTickets[editDateKey]?.some(
                slot => Object.keys(slot)[0] === slotKey
            );

            setSelectedTicketSlotKey(isValidKey ? slotKey : "");
        }
    }, [editSlots, editDateKey, events, occurrenceTickets]);

    useEffect(() => {
        setData(prev => ({...prev, events: events, occurrenceTickets: occurrenceTickets}));
    }, [events, occurrenceTickets]);

    const initEditingSlots = (date) => {
        const dateKey = date.format("YYYY-MM-DD");
        if (events[dateKey]) {
            setEditingSlots(events[dateKey]);
        } else {
            setEditingSlots([
                {
                    startTime: date.clone().set("hour", date.hour() + 1).set("minute", 0),
                    endTime: date.clone().set("hour", date.hour() + 2).set("minute", 0)
                }
            ]);
        }
    };

    function handleChangeDate(date) {
        const d = dayjs(date);
        setSelectedDate(d);
        const dateKey = d.format("YYYY-MM-DD");
        if (events[dateKey]) {
            // If the selected day already has events,
            // update the preview view (e.g., set it as the open date card) and do not open the drawer.
            setOpenDateCard(dateKey);
            setOpenDrawer(false);
        } else {
            // Otherwise, initialize editing slots and open the drawer for a new date.
            initEditingSlots(d);
            setOpenDrawer(true);
        }
    }

    const handleSaveTickets = () => {
        if (!editDateKey || !selectedTicketSlotKey) return; // Essential checks

        setOccurrenceTickets(prev => {
            const updatedDateTickets = prev[editDateKey].map(slotObj => {
                if (Object.keys(slotObj)[0] === selectedTicketSlotKey) {
                    return { [selectedTicketSlotKey]: editingTickets };
                }
                return slotObj;
            });

            return { ...prev, [editDateKey]: updatedDateTickets };
        });

        setOpenEditTicketDrawer(false);
    };

    const handleAddDate = () => {
        initEditingSlots(selectedDate);
        setOpenDrawer(true);
    };

    const handleRepeatOptionChange = (e) => setRepeatOption(e.target.value);
    const handleRepeatCadenceChange = (e) => setRepeatCadence(e.target.value);
    const handleRepeatIntervalChange = (e) => setRepeatInterval(Number(e.target.value));

    const handleTimeTypeChange = (event, newValue) => {
        if (newValue) setTimeType(newValue);
    };

    const handleAddTimeSlot = () => {
        setEditingSlots([
            ...editingSlots,
            {startTime: dayjs(), endTime: dayjs().add(1, "hour")}
        ]);
    };

    const handleDeleteTimeSlot = (index) => {
        const newSlots = editingSlots.filter((_, i) => i !== index);
        setEditingSlots(newSlots);
    };

    const handleTimeChange = (index, field, value) => {
        const newSlots = editingSlots.map((slot, i) =>
            i === index ? {...slot, [field]: value} : slot
        );
        setEditingSlots(newSlots);
    };

    const generateDates = (start, end, option, customCadence) => {
        const startDate = dayjs(start);
        const endDate = dayjs(end);
        let dates = [];

        if (option === "Once") {
            dates.push(startDate);
        }
        else if (option === "Daily") {
            let current = startDate.clone();
            while (current.isSameOrBefore(endDate, "day")) {
                dates.push(current.clone());
                current = current.add(1, "day");
            }
        }
        else if (option === "Weekly" || (option === "Custom" && customCadence === "Weekly")) {
            /**
             * If user picked no days, we fall back to a naive approach:
             * e.g. repeating exactly 1 week from start date.
             * Otherwise, we do daily increments and only push matching weekdays.
             */
            if (weeklyDays.length === 0) {
                let current = startDate.clone();
                while (current.isSameOrBefore(endDate, "day")) {
                    dates.push(current.clone());
                    current = current.add(1, "week");
                }
            } else {
                let current = startDate.clone();
                while (current.isSameOrBefore(endDate, "day")) {
                    const dayString = current.format("ddd"); // e.g. "Mon", "Tue"
                    if (weeklyDays.includes(dayString)) {
                        dates.push(current.clone());
                    }
                    current = current.add(1, "day");
                }
            }
        }
        else if (option === "Monthly" || (option === "Custom" && customCadence === "Monthly")) {
            /**
             * We'll do daily increments and only push those that match the chosen day-of-month.
             * If the user picks day 31 and a month doesn't have 31, that month is skipped.
             */
            let current = startDate.clone();
            while (current.isSameOrBefore(endDate, "day")) {
                if (current.date() === monthlyDay) {
                    dates.push(current.clone());
                }
                current = current.add(1, "day");
            }
        }
        return dates;
    };

    function sendToServer(events, tickets) {
        const payload = Object.entries(events).flatMap(([dateKey, slots]) => {
            return slots.map(slot => {
                const slotKey = slot.occurrenceID || slot.startTime.toString();
                const ticketData = (tickets[dateKey] && Array.isArray(tickets[dateKey]))
                    ? tickets[dateKey].find(s => Object.keys(s)[0] === slotKey)?.[slotKey] || []
                    : [];

                return {
                    startDate: dayjs(dateKey).format('DD/MM/YYYY'),
                    startTime: dayjs(slot.startTime).format('HH:mm'),
                    endTime: dayjs(slot.endTime).format('HH:mm'),
                    tickets: ticketData.map(t => ({
                        ticketTypeID: t.ticketID,
                        enabled: t.enabled,
                        price: t.price,
                        quantity: t.quantity
                    }))
                };
            });
        });
        payload.sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));

        const handleResponse = (response) => {
            const occurrenceIds = response.data.data;
            let i = 0;
            const updatedEvents = { ...events };

            Object.entries(updatedEvents).forEach(([dateKey, slots]) => {
                updatedEvents[dateKey] = slots.map(slot => {
                    if (!slot.occurrenceID) {
                        slot.occurrenceID = occurrenceIds[i++];
                    }
                    return slot;
                });
            });

            setEvents(updatedEvents);
            sessionStorage.setItem('occurrence-ids', JSON.stringify(occurrenceIds));
        };

        eventAxiosWithToken.post(`/update/recurrence?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}&tz=${data.timezone}`, payload)
            .then(handleResponse)
            .catch(err => console.error(err));
    }

    const handleSave = () => {
        const validDates = generateDates(selectedDate, endDate, repeatOption, repeatCadence);
        const newEvents = {...events};
        let totalCreated = 0;

        validDates.forEach(dateObj => {
            const dateKey = dateObj.format("YYYY-MM-DD");
            const slotsToApply = timeType === "single" ? [editingSlots[0]] : editingSlots;

            const finalSlots = slotsToApply.map(slot => ({
                ...slot,
                startTime: dateObj.clone().hour(slot.startTime.hour()).minute(slot.startTime.minute()),
                endTime: dateObj.clone().hour(slot.endTime.hour()).minute(slot.endTime.minute())
            }));

            totalCreated += mergeDateSlots(dateKey, finalSlots, newEvents);


            // Initialize occurrenceTickets if it doesn't exist for this date
            if (!occurrenceTickets[dateKey]) {
                occurrenceTickets[dateKey] = [];
            }

            // Add tickets to occurrenceTickets for each new slot if they don't already exist
            finalSlots.forEach(slot => {
                const slotKey = slot.startTime.valueOf();// Or other unique identifier for the slot


                if (!occurrenceTickets[dateKey].some(ticket => Object.keys(ticket)[0] === slotKey)) {
                    occurrenceTickets[dateKey].push({[slotKey]: data.tickets?.map(t => ({ ...t, enabled: true, price: t.price, quantity: t.quantity })) || [] });

                }
            });
        });

        const newOccurrenceTickets = { ...occurrenceTickets };
        for (const dateKey in newEvents) {
            if (!newOccurrenceTickets[dateKey]) {  // If tickets don't exist for this date
                newOccurrenceTickets[dateKey] = newEvents[dateKey].map(slot => {
                    const slotKey = slot.occurrenceID || slot.startTime.valueOf();
                    return {
                        [slotKey]: data.tickets?.map(t => ({ ...t, enabled: true, price: t.price, quantity: t.quantity })) || []
                    };
                });
            }
        }

        setEvents(newEvents);
        setOccurrenceTickets(newOccurrenceTickets);
        sendToServer(newEvents, newOccurrenceTickets);

        setShowSnackbar(true);
        setSnackbarMessage(`${totalCreated} time slot${totalCreated === 1 ? "" : "s"} created!`);
        setOpenDrawer(false);
    };

    const handleOpenEditDrawer = (dateKey) => {
        setEditDateKey(dateKey);
        // Sort timeslots ascending by start time
        const sortedSlots = [...events[dateKey]].sort((a, b) =>
            dayjs(a.startTime).diff(dayjs(b.startTime))
        );
        setEditSlots(sortedSlots);
        setApplyToMultipleDates(false);
        setOpenEditDrawer(true);
    };

    const handleDeleteDate = (dateKey) => {
        let newEvents = {...events};

        eventAxiosWithToken.post(`/delete/recurrence?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}&date=${dateKey}`)
            .then(() => {
                delete newEvents[dateKey];
                setEvents(newEvents);
            })
            .catch(err => console.error(err));
    };

    const handleEditTimeChange = (index, field, value) => {
        setEditSlots((prev) =>
            prev.map((slot, i) =>
                i === index ? {...slot, [field]: value} : slot
            )
        );
    };

    const handleAddEditTimeSlot = () => {
        setEditSlots((prev) => [
            ...prev,
            {
                startTime: dayjs().hour(9).minute(0),
                endTime: dayjs().hour(10).minute(0)
            }
        ]);
    };

    const handleDeleteEditTimeSlot = (index) => {
        setEditSlots((prev) => prev.filter((_, i) => i !== index));
    };

    const mergeDateSlots = (dateKey, newSlots, baseEvents) => {
        let added = 0;
        if (!baseEvents[dateKey]) {
            baseEvents[dateKey] = newSlots;
            added = newSlots.length;
        } else {
            const existingSlots = baseEvents[dateKey];
            const slotsToAdd = newSlots.filter((slot) => {
                return !existingSlots.some((exist) => {
                    return (
                        dayjs(slot.startTime).isSame(exist.startTime) &&
                        dayjs(slot.endTime).isSame(exist.endTime)
                    );
                });
            });
            if (slotsToAdd.length > 0) {
                baseEvents[dateKey] = [...existingSlots, ...slotsToAdd];
                added = slotsToAdd.length;
            }
        }
        return added;
    };

    const removeDuplicateSlots = (slots) => {
        const uniqueSlots = [];
        slots.forEach((slot) => {
            // Check if a slot with the same start and end time already exists
            const exists = uniqueSlots.some((s) =>
                dayjs(s.startTime).isSame(slot.startTime) &&
                dayjs(s.endTime).isSame(slot.endTime)
            );
            if (!exists) {
                uniqueSlots.push(slot);
            }
        });
        return uniqueSlots;
    };

    const handleSaveEditTimes = () => {
        let newEvents = { ...events };
        let totalCreated = 0;
        const newOccurrenceTickets = { ...occurrenceTickets };

        if (!editDateKey) {
            setOpenEditDrawer(false);
            return;
        }

        if (!applyToMultipleDates) {
            // For a single date, count the difference if any.
            const oldCount = events[editDateKey] ? events[editDateKey].length : 0;
            const newUnique = removeDuplicateSlots(editSlots);
            totalCreated = newUnique.length > oldCount ? newUnique.length - oldCount : 0;
            newEvents[editDateKey] = newUnique;
            const dateKey = editDateKey;
            if (!newOccurrenceTickets[dateKey]) {
                newOccurrenceTickets[dateKey] = [];
            }
        } else {
            // Apply changes to multiple dates.
            const validDates = generateDates(selectedDate, endDate, repeatOption, repeatCadence);
            validDates.forEach((dateObj) => {
                const dateKey = dateObj.format("YYYY-MM-DD");
                if (!newOccurrenceTickets[dateKey]) {
                    newOccurrenceTickets[dateKey] = [];
                }
                const finalSlots = editSlots.map((slot) => ({
                    startTime: dateObj
                        .clone()
                        .set("hour", dayjs(slot.startTime).hour())
                        .set("minute", dayjs(slot.startTime).minute()),
                    endTime: dateObj
                        .clone()
                        .set("hour", dayjs(slot.endTime).hour())
                        .set("minute", dayjs(slot.endTime).minute())
                }));
                const added = mergeDateSlots(dateKey, finalSlots, newEvents);
                totalCreated += added;
            });
        }
        sendToServer(newEvents, newOccurrenceTickets)
        setOccurrenceTickets(newOccurrenceTickets);
        setEvents(newEvents);

        setShowSnackbar(true);
        setSnackbarMessage(`${totalCreated} time slot${totalCreated === 1 ? "" : "s"} was created!`);
        setOpenEditDrawer(false);
    };

    const RenderRepeatOption = () => {
        switch (repeatOption) {
            case "Weekly":
                return (
                    <ToggleButtonGroup
                        value={weeklyDays}
                        onChange={(event, newDays) => setWeeklyDays(newDays)}
                        multiple
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                    >
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                            <ToggleButton key={index} value={day} sx={{ borderRadius: "50%" }}>
                                {day}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                );
            case "Monthly":
                return (
                    <FormControl fullWidth>
                        <InputLabel>{t('renderRepeatOption.dayOfMonth')}</InputLabel>
                        <Select
                            label={t('renderRepeatOption.dayOfMonth')}
                            value={monthlyDay}
                            onChange={(e) => setMonthlyDay(e.target.value)}
                        >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <MenuItem key={day} value={day}>
                                    {day}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case "Custom":
                return (
                    <Stack rowGap={4}>
                        <Stack direction="row" columnGap={1}>
                            <FormControl>
                                <InputLabel required>{t('renderRepeatOption.repeatEvery')}</InputLabel>
                                <OutlinedInput
                                    label={t('renderRepeatOption.repeatEvery')}
                                    value={repeatInterval}
                                    onChange={handleRepeatIntervalChange}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel required>{t('renderRepeatOption.cadence')}</InputLabel>
                                <Select
                                    label={t('renderRepeatOption.cadence')}
                                    value={repeatCadence}
                                    onChange={handleRepeatCadenceChange}
                                    fullWidth
                                >
                                    <MenuItem value="Weekly">{t('eventDatePicker.weekly')}</MenuItem>
                                    <MenuItem value="Monthly">{t('eventDatePicker.monthly')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        {repeatCadence === "Weekly" ?
                            <ToggleButtonGroup
                                value={weeklyDays}
                                onChange={(event, newDays) => setWeeklyDays(newDays)}
                                multiple
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                                    <ToggleButton key={index} value={day} sx={{ borderRadius: "50%" }}>
                                        {day}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            :
                            <FormControl fullWidth>
                                <InputLabel>{t('renderRepeatOption.dayOfMonth')}</InputLabel>
                                <Select
                                    label={t('renderRepeatOption.dayOfMonth')}
                                    value={monthlyDay}
                                    onChange={(e) => setMonthlyDay(e.target.value)}
                                >
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                        <MenuItem key={day} value={day}>
                                            {day}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        }
                    </Stack>
                );
            default:
                return null;
        }
    };

    const toggleDateCard = (dateKey) => {
        setOpenDateCard(openDateCard === dateKey ? null : dateKey);
    };

    const handleTimeSlotClick = (dateKey, slot) => {
        if (!data?.tickets || !slot || !dateKey || !events[dateKey]) return;

        const slotKey = slot.occurrenceID || slot.startTime.valueOf();
        setSelectedTicketSlotKey(slotKey); // Set before opening the drawer
        setEditDateKey(dateKey);

        const existingTickets = occurrenceTickets[dateKey]?.find(s => Object.keys(s)[0] === slotKey)?.[slotKey];

        // Initialize editingTickets only if no existing tickets are found for that slot.
        setEditingTickets(existingTickets ? [...existingTickets] :  data.tickets.map(t => ({ ...t }))); // Deep copy

        setOpenEditTicketDrawer(true);
    };

    const RenderTimeSlotPreview = () => {
        return (
            <div className="time-slot-container">
                {Object.entries(events).map(([dateKey, slots]) => {
                    const formattedDate = dayjs(dateKey);
                    const dayName = formattedDate.format("ddd").toUpperCase();
                    const dayNumber = formattedDate.format("DD");
                    const monthName = formattedDate.format("MMMM");
                    const isSelected = openDateCard === dateKey;
                    const highlightStyle = (isSelected) ? { backgroundColor: "#bde4ff" } : {};

                    return (
                        <div
                            key={dateKey}
                            className="date-card"
                            style={highlightStyle}
                        >
                            <div className="date-header" onClick={() => toggleDateCard(dateKey)}>
                                <Stack direction="row" columnGap={3}>
                                    <Stack rowGap={1}>
                                        <span className="day-name">{dayName}</span>
                                        <span className="day-number">{dayNumber}</span>
                                    </Stack>
                                    <Stack justifyContent="space-between" alignItems="flex-start">
                                        <Stack direction="row" columnGap={1}>
                                            <span className="month-name">{monthName}</span>
                                            <span className="time-slot-count">{slots.length} {t('renderTimeSlotPreview.timeSlots')}</span>
                                        </Stack>
                                        <Stack>
                                            {openDateCard === dateKey ? (
                                                <Stack direction="row" columnGap={2}>
                                                <span
                                                    className="edit-action"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEditDrawer(dateKey);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" /> {t('renderTimeSlotPreview.editTimes')}
                                                </span>
                                                    <span
                                                        className="delete-action"
                                                        style={{ cursor: "pointer", color: "red" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDate(dateKey);
                                                        }}
                                                    >
                                                    <DeleteIcon fontSize="small" /> {t('renderTimeSlotPreview.deleteDate')}
                                                </span>
                                                </Stack>
                                            ) : (
                                                <span className="time-list">
                                                {slots.map((slot, idx) => (
                                                    <div className="time-list__item" key={idx}>
                                                        {dayjs(slot.startTime).format("h:mm A")}
                                                    </div>
                                                ))}
                                            </span>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Stack>
                                <span className="toggle-icon">
                                    {openDateCard === dateKey ? (
                                        <KeyboardArrowUpIcon fontSize="medium" />
                                    ) : (
                                        <KeyboardArrowDownIcon fontSize="medium" />
                                    )}
                                </span>
                                </Stack>
                            </div>

                            {openDateCard === dateKey && (
                                <div className="time-slots" onClick={() => handleTimeSlotClick(dateKey)}>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>{t('renderTimeSlotPreview.timeSlot')}</th>
                                            <th>{t('renderTimeSlotPreview.duration')}</th>
                                            <th>{t('renderTimeSlotPreview.visibleTickets')}</th>
                                            <th>{t('renderTimeSlotPreview.ticketPrice')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {slots.map((slot, index) => {
                                            const startTimeFormatted = dayjs(slot.startTime).format("h:mm A");
                                            const slotKey = slot.occurrenceID || slot.startTime.valueOf().toString();
                                            const slotTickets = occurrenceTickets[dateKey]?.find(obj => Object.keys(obj)[0] == slotKey)
                                                ?.[slotKey] || [];
                                            const enabledTicketCount = slotTickets.filter(t => t.enabled).length;

                                            return (
                                                <tr key={index} onClick={() => handleTimeSlotClick(dateKey, slot)}>
                                                    <td>{startTimeFormatted}</td>
                                                    <td>{dayjs(slot.endTime).diff(dayjs(slot.startTime), 'minute')} min</td>
                                                    <td>
                                                        <Stack direction={'row'} alignItems={'center'}>
                                                            <BookOnlineIcon sx={{ fontSize: 16, color: 'gray' }} />
                                                            {enabledTicketCount}
                                                        </Stack>
                                                    </td>
                                                    <td>
                                                        {(() => {
                                                            const enabledTickets = slotTickets.filter(t => t.enabled);
                                                            if (enabledTickets.length === 0) return '---';

                                                            const prices = enabledTickets.map(t => {
                                                                const price = parseFloat(t.price);
                                                                return isNaN(price) ? 0 : price;
                                                            });
                                                            const minPrice = Math.min(...prices);
                                                            return minPrice > 0 ? `$${minPrice.toFixed(2)}` : '0.0';
                                                        })()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Stack className="event-date-picker">
            <Snackbar
                open={showSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ marginTop: 6 }}
                onClose={() => setShowSnackbar(false)}
                autoHideDuration={5000}
            >
                <Alert severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <h1 className="event-date-picker__title">{t('eventDatePicker.manageDatesTimes')}</h1>
            <p className="event-date-picker__subtitle">
                {t('eventDatePicker.addDatesTimesDescription')}
            </p>
            <Stack
                direction="row"
                className="event-date-picker__container"
                columnGap={3}
            >
                <div className="event-date-picker__calendar">
                    <DateCalendar
                        sx={{
                            "&.MuiDateCalendar-root": {
                                width: "100%",
                                height: "100%",
                                borderRadius: "8px",
                                border: "1px solid #E0E0E0",
                                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
                                backgroundColor: "#FFFFFF",
                                paddingInline: '1rem'
                            }
                        }}
                        value={selectedDate}
                        onChange={handleChangeDate}
                        slots={{ day: CustomDay }}
                        slotProps={{
                            day: { selectdate: selectedDate, events },
                        }}
                    />
                </div>
                <Stack className="event-date-picker__details">
                    {Object.keys(events).length === 0 ? (
                        <>
                            <div className="event-date-picker__illustration">
                                <img style={{height: '10rem'}}
                                    src="https://firebasestorage.googleapis.com/v0/b/medicare-10c3b.appspot.com/o/events%2FAdobe%20Express%20-%20file.png?alt=media&token=711f6d98-4a61-4ca3-ba87-1d16c593d68a"
                                    alt={t('eventDatePicker.eventPlanningAlt')}
                                />
                            </div>
                            <h2 className="event-date-picker__heading">{t('eventDatePicker.startPlanning')}</h2>
                            <p className="event-date-picker__description">{t('eventDatePicker.gonnaBeEpic')}</p>
                            <button
                                className="event-date-picker__button"
                                onClick={handleAddDate}
                            >
                                {t('eventDatePicker.addDate')}
                            </button>
                        </>
                    ) : (
                        <Stack sx={{ width: "100%" }} rowGap={1}>
                            <p className="link" onClick={handleAddDate}>
                                + {t('eventDatePicker.addDate')}
                            </p>
                            <RenderTimeSlotPreview
                                events={events}
                                openDateCard={openDateCard}
                                toggleDateCard={toggleDateCard}
                                handleOpenEditDrawer={handleOpenEditDrawer}
                                handleDeleteDate={handleDeleteDate}
                                handleTimeSlotClick={handleTimeSlotClick}
                                occurrenceTickets={occurrenceTickets}
                            />
                        </Stack>
                    )}
                </Stack>
            </Stack>
            <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
                <Stack
                    paddingBlock={1}
                    width="30rem"
                    paddingInline={3}
                    rowGap={3}
                    sx={{ fontFamily: "Nunito" }}
                >
                    <Stack>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            paddingBlock=".5rem"
                        >
                            <Typography fontSize={17} fontWeight="bold">
                                {t('eventDatePicker.addDatesTimes')}
                            </Typography>
                            <IconButton onClick={() => setOpenDrawer(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                        <hr />
                    </Stack>

                    <Stack rowGap={3}>
                        <Typography fontWeight="bold" fontSize={22}>
                            {t('eventDatePicker.date')}
                        </Typography>
                        <DatePicker
                            format="DD/MM/YYYY"
                            label={t('eventDatePicker.startDate')}
                            value={selectedDate}
                            onChange={(newValue) => {
                                setSelectedDate(newValue);
                                initEditingSlots(newValue);
                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel required>{t('eventDatePicker.repeats')}</InputLabel>
                            <Select
                                label={t('eventDatePicker.repeats')}
                                value={repeatOption}
                                onChange={handleRepeatOptionChange}
                                fullWidth
                            >
                                <MenuItem value="Once">{t('eventDatePicker.once')}</MenuItem>
                                <MenuItem value="Daily">{t('eventDatePicker.daily')}</MenuItem>
                                <MenuItem value="Weekly">{t('eventDatePicker.weekly')}</MenuItem>
                                <MenuItem value="Monthly">{t('eventDatePicker.monthly')}</MenuItem>
                                <MenuItem value="Custom">{t('eventDatePicker.custom')}</MenuItem>
                            </Select>
                        </FormControl>
                        <RenderRepeatOption
                            repeatOption={repeatOption}
                            weeklyDays={weeklyDays}
                            setWeeklyDays={setWeeklyDays}
                            monthlyDay={monthlyDay}
                            setMonthlyDay={setMonthlyDay}
                            repeatInterval={repeatInterval}
                            handleRepeatIntervalChange={handleRepeatIntervalChange}
                            repeatCadence={repeatCadence}
                            handleRepeatCadenceChange={handleRepeatCadenceChange}
                        />
                        {repeatOption !== "Once" && (
                            <DatePicker
                                format="DD/MM/YYYY"
                                label={t('eventDatePicker.endDate')}
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                            />
                        )}
                    </Stack>

                    <Stack rowGap={2}>
                        <Typography fontWeight="bold" fontSize={22}>
                            {t('eventDatePicker.time')}
                        </Typography>
                        <ToggleButtonGroup
                            color="primary"
                            exclusive
                            fullWidth
                            value={timeType}
                            onChange={handleTimeTypeChange}
                        >
                            <ToggleButton value="single">{t('eventDatePicker.singleTime')}</ToggleButton>
                            <ToggleButton value="multiple">{t('eventDatePicker.multipleTimes')}</ToggleButton>
                        </ToggleButtonGroup>

                        <Stack rowGap={2}>
                            {timeType === "multiple" && (
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Stack direction="row" columnGap={2}>
                                            <DynamicFeedIcon />{" "}
                                            <p style={{ fontFamily: "Nunito", color: "gray" }}>
                                                {t('eventDatePicker.generateTimeSlots')}
                                            </p>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack paddingBottom={2} rowGap={4}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TimePicker
                                                    label={t('eventDatePicker.startTime')}
                                                    variant="outlined"
                                                    fullWidth
                                                    value={timeSlot.startTime}
                                                    onChange={(newValue) =>
                                                        setTimeSlot((prev) => ({ ...prev, startTime: newValue }))
                                                    }
                                                />
                                                <TimePicker
                                                    label={t('eventDatePicker.endTime')}
                                                    variant="outlined"
                                                    fullWidth
                                                    value={timeSlot.endTime}
                                                    onChange={(newValue) =>
                                                        setTimeSlot((prev) => ({ ...prev, endTime: newValue }))
                                                    }
                                                />
                                            </Stack>
                                            <Stack rowGap={2}>
                                                <p style={{ fontWeight: "bold" }}>{t('eventDatePicker.timeSlotsRepeat')}</p>
                                                <ToggleButtonGroup
                                                    value={repeatInterval}
                                                    exclusive
                                                    onChange={(e, value) => value && setRepeatInterval(value)}
                                                    fullWidth
                                                >
                                                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                                                        {[15, 30, 45, 60, 120, 180, 240].map((time) => (
                                                            <ToggleButton fullWidth={false}
                                                                          key={time}
                                                                          value={time}
                                                                          sx={{ borderRadius: 5 }}
                                                            >
                                                                {time >= 60 ? time / 60 : time} {time >= 60 ? t('eventDatePicker.hours') : t('eventDatePicker.min')}
                                                            </ToggleButton>
                                                        ))}
                                                    </Stack>
                                                </ToggleButtonGroup>
                                                <Typography fontSize={16} color="#306adc">
                                                    {t('eventDatePicker.addCustomTime')}
                                                </Typography>
                                            </Stack>
                                            <Stack rowGap={1}>
                                                <p style={{ fontWeight: "bold" }}>{t('eventDatePicker.timeSlotDuration')}</p>
                                                <Select
                                                    value={slotDuration}
                                                    onChange={(e) => setSlotDuration(e.target.value)}
                                                    fullWidth
                                                >
                                                    <MenuItem value="Until event ends">
                                                        {t('eventDatePicker.untilEventEnds')} {data?.end_time && dayjs(data.end_time).format("HH:mm")}
                                                    </MenuItem>
                                                    <MenuItem value="Custom">{t('eventDatePicker.customDuration')}</MenuItem>
                                                </Select>
                                            </Stack>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                fullWidth
                                                onClick={() => {
                                                    const start = dayjs(timeSlot.startTime);
                                                    const duration = dayjs(timeSlot.endTime).diff(dayjs(timeSlot.startTime), "minute");
                                                    let generationEnd;
                                                    if (slotDuration === "Until event ends") {
                                                        generationEnd = selectedDate.clone().set("hour", 22).set("minute", 0);
                                                    } else {
                                                        generationEnd = start.add(duration, "minute");
                                                    }
                                                    let current = start;
                                                    const generated = [];
                                                    // Generate new timeslots until we exceed generationEnd
                                                    while (current.add(duration, "minute").isSameOrBefore(generationEnd)) {
                                                        generated.push({
                                                            startTime: current,
                                                            endTime: current.add(duration, "minute")
                                                        });
                                                        current = current.add(repeatInterval, "minute");
                                                    }
                                                    // Append the new generated timeslots to the existing editingSlots
                                                    setEditingSlots((prev) => [...prev, ...generated]);
                                                }}
                                            >
                                                {t('eventDatePicker.previewChanges')}
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            )}
                        </Stack>
                    </Stack>

                    <Stack rowGap={2}>
                        <Stack rowGap={2}>
                            {editingSlots.map((item, index) => (
                                <Stack direction="row" columnGap={1} key={index} alignItems="center">
                                    <TimePicker
                                        format="HH:mm"
                                        label={t('eventDatePicker.startTime')}
                                        value={item.startTime}
                                        onChange={(newValue) => handleTimeChange(index, "startTime", newValue)}
                                    />
                                    <TimePicker
                                        format="HH:mm"
                                        label={t('eventDatePicker.endTime')}
                                        value={item.endTime}
                                        onChange={(newValue) => handleTimeChange(index, "endTime", newValue)}
                                    />
                                    {editingSlots.length > 1 && (
                                        <IconButton onClick={() => handleDeleteTimeSlot(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                        {timeType === "multiple" && (
                            <div className="link" onClick={handleAddTimeSlot}>
                                + {t('eventDatePicker.addTimeSlot')}
                            </div>
                        )}
                    </Stack>

                    <Stack direction="row" marginTop={3} columnGap={1}>
                        <Button fullWidth variant="outlined" onClick={() => setOpenDrawer(false)}>
                            {t('eventDatePicker.cancel')}
                        </Button>
                        <Button fullWidth variant="contained" color="error" onClick={handleSave}>
                            {t('eventDatePicker.save')}
                        </Button>
                    </Stack>
                </Stack>
            </Drawer>
            <Drawer anchor="right" open={openEditDrawer} onClose={() => setOpenEditDrawer(false)}>
                <Stack width="30rem" rowGap={2} sx={{ fontFamily: "Nunito" }}
                       paddingBlock="1rem"
                       height={'100%'}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" paddingInline={3}>
                        {editDateKey && (
                            <Typography fontSize={17} fontWeight="bold">{t('eventDatePicker.editTimeSlots')}</Typography>
                        )}
                        <IconButton onClick={() => setOpenEditDrawer(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                    <Stack rowGap={3} paddingInline={3} flexGrow={1} sx={{ height: '70%', overflowY: 'auto' }}>
                        <hr />
                        <Typography fontWeight="bold" fontSize={22} sx={{textTransform: 'capitalize'}}>
                            {dayjs(editDateKey).format("dddd, DD MMMM, YYYY")}
                        </Typography>
                        {editSlots.map((slot, index) => (
                            <Stack direction="row" columnGap={1} key={index} alignItems="center">
                                <TimePicker
                                    label={t('eventDatePicker.timeSlotStart')}
                                    value={slot.startTime}
                                    onChange={(newValue) => handleEditTimeChange(index, "startTime", newValue)}
                                />
                                <TimePicker
                                    label={t('eventDatePicker.timeSlotEnd')}
                                    value={slot.endTime}
                                    onChange={(newValue) => handleEditTimeChange(index, "endTime", newValue)}
                                />
                                <IconButton onClick={() => handleDeleteEditTimeSlot(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        ))}
                        <div
                            className="link"
                            style={{ color: "#306adc", cursor: "pointer" }}
                            onClick={handleAddEditTimeSlot}
                        >
                            + {t('eventDatePicker.addTimeSlot')}
                        </div>
                    </Stack>

                    <Stack paddingInline={3} rowGap={1}>
                        <hr />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={applyToMultipleDates}
                                    onChange={(e) => setApplyToMultipleDates(e.target.checked)}
                                />
                            }
                            label={t('eventDatePicker.applyToMultipleDates')}
                        />
                        <Stack direction="row" marginTop="auto" columnGap={1}>
                            <Button variant="outlined" fullWidth onClick={() => setOpenEditDrawer(false)}>
                                {t('eventDatePicker.cancel')}
                            </Button>
                            <Button variant="contained" color="error" fullWidth onClick={handleSaveEditTimes}>
                                {t('eventDatePicker.save')}
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Drawer>
            <Drawer
                anchor="right"
                open={openEditTicketDrawer}
                onClose={() => setOpenEditTicketDrawer(false)}
            >
                <Stack
                    width="30rem"
                    rowGap={2}
                    sx={{ fontFamily: "Nunito" }}
                    paddingBlock="5rem 1rem"
                    height={'100%'}
                >
                    <Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" paddingInline={3}>
                            <Typography fontSize={17} fontWeight="bold">
                                {t('eventDatePicker.tickets')}
                            </Typography>
                            <IconButton onClick={() => setOpenEditTicketDrawer(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                        <hr />
                    </Stack>
                    <Stack rowGap={3} paddingInline={3} flexGrow={1} sx={{ height: '70%', overflowY: 'auto' }}>
                        <Typography fontWeight="bold" fontSize={22}>
                            {dayjs(editDateKey).format("dddd, DD MMMM, YYYY")}
                        </Typography>
                        {events[editDateKey] &&
                            <FormControl>
                                <InputLabel>{t('eventDatePicker.selectTimeSlot')}</InputLabel>
                                <Select
                                    label={t('eventDatePicker.selectTimeSlot')}
                                    fullWidth
                                    value={selectedTicketSlotKey}
                                    onChange={(e) => {
                                        setSelectedTicketSlotKey(e.target.value);
                                        const ticketsForSlot = occurrenceTickets[editDateKey]?.find(
                                            obj => Object.keys(obj)[0] === e.target.value
                                        )?.[e.target.value];
                                        setEditingTickets(ticketsForSlot || []);
                                    }}
                                >
                                    {events[editDateKey].map((slot, index) => (
                                        <MenuItem key={index} value={slot.occurrenceID || slot.startTime.valueOf()}>
                                            {dayjs(slot.startTime).format("h:mm A")} - {dayjs(slot.endTime).format("h:mm A")}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        }
                        <Stack rowGap={2}>
                            {data?.tickets?.map((item, index) => {
                                const editedTicket = editingTickets.find((t) => t.ticketID === item.id) || { ...item, enabled: true };
                                return (
                                    <Stack key={index} sx={{ border: '1px solid', padding: '.75rem 1rem' }}>
                                        <Stack direction={'row'} justifyContent={'space-between'}>
                                            <Stack alignItems={'center'} direction={'row'} columnGap={1}>
                                                {editedTicket.enabled ?
                                                    <>
                                                        <VisibilityIcon sx={{ fontSize: 16 }} /> {t('eventDatePicker.visible')}
                                                    </>
                                                    :
                                                    <>
                                                        <VisibilityOffIcon sx={{ fontSize: 16 }} /> {t('eventDatePicker.hidden')}
                                                    </>
                                                }
                                            </Stack>
                                            <Switch
                                                checked={editedTicket.enabled}
                                                onChange={(e) => {
                                                    setEditingTickets(prevTickets =>
                                                        prevTickets.map(t =>
                                                            t.ticketID === item.id ? { ...t, enabled: e.target.checked } : t
                                                        )
                                                    );
                                                }}
                                            />
                                        </Stack>
                                        <Stack rowGap={3}>
                                            <Typography fontWeight={'bold'}>
                                                {item?.ticketName}
                                            </Typography>
                                            <Stack direction={'row'} columnGap={1.5}>
                                                <TextField disabled
                                                           label={t('eventDatePicker.price')}
                                                           value={
                                                               editedTicket.ticketType === 'paid' ? editedTicket.price
                                                                   :
                                                                   editedTicket.ticketType === 'free' ? t('eventDatePicker.free') : t('eventDatePicker.donation')
                                                           }
                                                           onChange={(e) => {
                                                               const newPrice = e.target.value;
                                                               setEditingTickets((prev) =>
                                                                   prev.map((t) =>
                                                                       t.id === item.id ? { ...t, price: newPrice } : t
                                                                   )
                                                               );
                                                           }}
                                                />
                                                <TextField
                                                    label={t('eventDatePicker.quantity')} disabled
                                                    value={editedTicket.quantity}
                                                    onChange={(e) => {
                                                        const newQuantity = e.target.value;
                                                        setEditingTickets((prev) =>
                                                            prev.map((t) =>
                                                                t.id === item.id ? { ...t, quantity: newQuantity } : t
                                                            )
                                                        );
                                                    }}
                                                />
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                );
                            })}
                            <Stack
                                direction={'row'}
                                columnGap={1}
                                alignItems={'center'}
                                sx={{ backgroundColor: '#dcdcdc', padding: '.5rem 1rem' }}
                            >
                                <InfoOutlinedIcon sx={{ fontSize: 16 }} /> {t('eventDatePicker.createNewTickets')}
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack>
                        <hr />
                        <Stack paddingInline={3} rowGap={1} sx={{ overflowY: 'auto' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={applyToMultipleDates}
                                        onChange={(e) => setApplyToMultipleDates(e.target.checked)}
                                    />
                                }
                                label={t('eventDatePicker.applyToMultipleDates')}
                            />
                            <Stack direction={'row'} marginTop="auto" columnGap={1}>
                                <Button variant="outlined" fullWidth onClick={() => setOpenEditTicketDrawer(false)}>
                                    {t('eventDatePicker.cancel')}
                                </Button>
                                <Button variant="contained" color="error" fullWidth onClick={handleSaveTickets}>
                                    {t('eventDatePicker.save')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Drawer>
        </Stack>
    );
}

export default RecurringEventSchedule;
