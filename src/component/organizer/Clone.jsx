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
    Stack, Switch, TextField,
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

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore)

function RecurringEventSchedule() {
    const {data, setData} = useContext(EventContext)
    const location = useLocation()
    // Global events store: key = date (YYYY-MM-DD), value = array of timeslots for that day
    const [events, setEvents] = useState(data?.events || {});
    // The currently selected start date (from calendar)
    const [selectedDate, setSelectedDate] = useState(dayjs());
    // End date (for repeats)
    const [endDate, setEndDate] = useState(dayjs());
    // Repeat options: "Once", "Daily", "Weekly", "Monthly", "Custom"
    const [repeatOption, setRepeatOption] = useState("Once");
    // In Custom mode, what cadence to use (default "Daily")
    const [repeatCadence, setRepeatCadence] = useState("Weekly");
    // Time mode: "single" or "multiple"
    const [timeType, setTimeType] = useState("single");
    // Controls the right-hand drawer (for adding/editing times)
    const [openDrawer, setOpenDrawer] = useState(false);
    // For generating timeslots within a day (in multiple mode)
    const [repeatInterval, setRepeatInterval] = useState(15);
    // A template timeslot used in generation UI
    const [timeSlot, setTimeSlot] = useState({
        startTime: dayjs().hour(9).minute(0),
        endTime: dayjs().hour(10).minute(0)
    });
    const [weeklyDays, setWeeklyDays] = useState([]);
    // Which day of month to repeat on (for Monthly repeats). E.g. 13 => 13th of each month.
    const [monthlyDay, setMonthlyDay] = useState(dayjs().date());
    // The slot duration mode
    const [slotDuration, setSlotDuration] = useState("Until event ends");
    // Transient state: the timeslots being edited for the currently active date
    const [editingSlots, setEditingSlots] = useState([]);
    // For preview UI: which date card is expanded
    const [openDateCard, setOpenDateCard] = useState(null);
    // ------------------ Edit Times Drawer ------------------
    const [openEditDrawer, setOpenEditDrawer] = useState(false);
    const [openEditTicketDrawer, setOpenEditTicketDrawer] = useState(false);
    const [editDateKey, setEditDateKey] = useState(null);
    // Timeslots for the date being edited (sorted ascending)
    const [editSlots, setEditSlots] = useState([]);
    // If user wants to apply changes to multiple dates
    const [occurrenceTickets, setOccurrenceTickets] = useState({});
    const [applyToMultipleDates, setApplyToMultipleDates] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [editingTickets, setEditingTickets] = useState([]);
    const [selectedTicketSlotKey, setSelectedTicketSlotKey] = useState("");

    useEffect(() => {
        // When data.tickets changes, update occurenceTickets by adding any new ticket
        setOccurrenceTickets((prev) => {
            // If there are no previously stored tickets, nothing to update.
            if (!prev || Object.keys(prev).length === 0) {
                return prev;
            }
            // Otherwise, for each date and time slot, add missing tickets.
            const updated = { ...prev };
            Object.keys(updated).forEach((dateKey) => {
                // Each dateKey maps to an object where keys are time slot keys (e.g. the slot's startTime as a string)
                const slotMapping = { ...updated[dateKey] };
                Object.keys(slotMapping).forEach((slotKey) => {
                    // Get current ticket configurations for this time slot
                    let currentTickets = slotMapping[slotKey] || [];
                    data.tickets.forEach((newTicket) => {
                        // If this ticket doesn't exist in the current configuration, add it with default values
                        if (!currentTickets.find((ticket) => ticket.id === newTicket.id)) {
                            currentTickets.push({
                                ...newTicket,
                                enabled: true, // default to enabled
                            });
                        }
                    });
                    slotMapping[slotKey] = currentTickets;
                });
                updated[dateKey] = slotMapping;
            });
            return updated;
        });
    }, [data.tickets]);

    useEffect(() => {
        setData(prev => ({...prev, events: events}))
    }, [events]);

    // Helper: initialize editingSlots for the current selectedDate (if none exists, create a default slot)
    const initEditingSlots = (date) => {
        const dateKey = date.format("YYYY-MM-DD");
        if (events[dateKey]) {
            setEditingSlots(events[dateKey]);
        } else {
            // default: one timeslot from 9:00 to 10:00 on the selected date
            setEditingSlots([
                {
                    startTime: date.clone().set("hour", 9).set("minute", 0),
                    endTime: date.clone().set("hour", 10).set("minute", 0)
                }
            ]);
        }
    };

    // Called when a date is selected from the calendar
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

    function handleSaveTickets() {
        setOccurrenceTickets((prev) => {
            const newState = { ...prev };
            if (!newState[editDateKey]) {
                newState[editDateKey] = {};
            }
            newState[editDateKey][selectedTicketSlotKey] = editingTickets;
            return newState;
        });
        setOpenEditTicketDrawer(false);
    }

    // Handler for the "Add a date" button outside the drawer
    const handleAddDate = () => {
        initEditingSlots(selectedDate);
        setOpenDrawer(true);
    };

    // Handlers for repeat options
    const handleRepeatOptionChange = (e) => setRepeatOption(e.target.value);
    const handleRepeatCadenceChange = (e) => setRepeatCadence(e.target.value);
    const handleRepeatIntervalChange = (e) => setRepeatInterval(Number(e.target.value));

    const handleTimeTypeChange = (event, newValue) => {
        if (newValue) setTimeType(newValue);
    };

    // Handlers for editing timeslots in the drawer
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

    function sendToServer(events) {
        const transformEvents = Object.entries(events).map(([dateKey, slots]) => {
            return slots.map(slot => ({
                startDate: dayjs(dateKey).format('DD/MM/YYYY'),
                startTime: slot.startTime.format('HH:mm'),
                endTime: slot.endTime.format('HH:mm')
            }));
        }).flat();
        eventAxiosWithToken.post(`/create/recurrence?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}&timezone=${data.timezone}`,
            transformEvents)
            .then(r => {
                console.log(r.data);
                sessionStorage.setItem('occurrence-ids', r.data.data)
            })
            .catch(err => console.log(err));
    }

    // When the user clicks "Save", generate events for all valid dates based on the repeat settings,
    // and combine the timeslot info from the drawer (editingSlots) onto each date.
    const handleSave = () => {
        const validDates = generateDates(selectedDate, endDate, repeatOption, repeatCadence);
        let newEvents = { ...events };
        let totalCreated = 0;

        validDates.forEach((dateObj) => {
            const dateKey = dateObj.format("YYYY-MM-DD");
            // In single mode, use only the first slot; otherwise, use all editingSlots.
            const slotsToApply = timeType === "single" ? [editingSlots[0]] : editingSlots;
            // Map each slot’s time-of-day onto dateObj.
            const finalSlots = slotsToApply.map((slot) => ({
                startTime: dateObj
                    .clone()
                    .set("hour", dayjs(slot.startTime).hour())
                    .set("minute", dayjs(slot.startTime).minute()),
                endTime: dateObj
                    .clone()
                    .set("hour", dayjs(slot.endTime).hour())
                    .set("minute", dayjs(slot.endTime).minute())
            }));
            // Merge and count how many new slots are added.
            const added = mergeDateSlots(dateKey, finalSlots, newEvents);
            totalCreated += added;
        });
        sendToServer(newEvents)
        setEvents(newEvents);
        setShowSnackbar(true);
        setSnackbarMessage(`${totalCreated} time slot${totalCreated === 1 ? "" : "s"} was created!`);
        setOpenDrawer(false);
    };

    // ------------------ Edit Times Drawer ------------------

    // “Edit times” button from preview: open the edit drawer with sorted times
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

    // If user clicks “Delete date”
    const handleDeleteDate = (dateKey) => {
        let newEvents = {...events};
        delete newEvents[dateKey];
        setEvents(newEvents);
    };

    // In the edit drawer, handle changing a timeslot
    const handleEditTimeChange = (index, field, value) => {
        setEditSlots((prev) =>
            prev.map((slot, i) =>
                i === index ? {...slot, [field]: value} : slot
            )
        );
    };

    // Add or remove timeslots from the edit drawer
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

    // Merge timeslots for a single date into events, ensuring no duplicates
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

    // Save the changes from the edit drawer
    const handleSaveEditTimes = () => {
        let newEvents = { ...events };
        let totalCreated = 0;

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
        } else {
            // Apply changes to multiple dates.
            const validDates = generateDates(selectedDate, endDate, repeatOption, repeatCadence);
            validDates.forEach((dateObj) => {
                const dateKey = dateObj.format("YYYY-MM-DD");
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
        sendToServer(newEvents)
        setEvents(newEvents);
        setShowSnackbar(true);
        setSnackbarMessage(`${totalCreated} time slot${totalCreated === 1 ? "" : "s"} was created!`);
        setOpenEditDrawer(false);
    };

    // Render repeat options fields based on the selected repeatOption
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
                        <InputLabel>Day of month</InputLabel>
                        <Select
                            label="Day of month"
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
                                <InputLabel required>Repeat every</InputLabel>
                                <OutlinedInput
                                    label="Repeat every"
                                    value={repeatInterval}
                                    onChange={handleRepeatIntervalChange}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel required>Cadence</InputLabel>
                                <Select
                                    label="Cadence"
                                    value={repeatCadence}
                                    onChange={handleRepeatCadenceChange}
                                    fullWidth
                                >
                                    <MenuItem value="Weekly">Weekly</MenuItem>
                                    <MenuItem value="Monthly">Monthly</MenuItem>
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
                                <InputLabel>Day of month</InputLabel>
                                <Select
                                    label="Day of month"
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

    // ------------------ Ticket Drawer Trigger ------------------
    function handleTimeSlotClick(dateKey) {
        // Only open Ticket Drawer if there are tickets defined in data (assumed to be provided)
        if (data?.tickets?.length > 0) {
            setEditDateKey(dateKey);
            const sortedSlots = [...events[dateKey]].sort((a, b) =>
                dayjs(a.startTime).diff(dayjs(b.startTime))
            );
            setEditSlots(sortedSlots);
            // Set the selected ticket slot key as the first slot's startTime (as string)
            const firstSlotKey = sortedSlots[0].startTime.toString();
            setSelectedTicketSlotKey(firstSlotKey);
            // Load tickets for this slot if already stored; otherwise, use defaults.
            if (
                occurrenceTickets[dateKey] &&
                occurrenceTickets[dateKey][firstSlotKey]
            ) {
                setEditingTickets(occurrenceTickets[dateKey][firstSlotKey]);
            } else {
                const defaultTickets = data.tickets.map((ticket) => ({
                    ...ticket,
                    enabled: true,
                }));
                setEditingTickets(defaultTickets);
            }
            setOpenEditTicketDrawer(true);
        }
    }

    // Render the preview UI – list of dates (from global events) with their timeslots
    const RenderTimeSlotPreview = () => {
        return (
            <div className="time-slot-container">
                {Object.entries(events).map(([dateKey, slots]) => {
                    const formattedDate = dayjs(dateKey);
                    const dayName = formattedDate.format("ddd").toUpperCase();
                    const dayNumber = formattedDate.format("DD");
                    const monthName = formattedDate.format("MMMM");
                    // Determine if this card should be highlighted either by selection or hover.
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
                                            <span className="time-slot-count">{slots.length} time slot(s)</span>
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
                                                      <EditIcon fontSize="small" /> Edit times
                                                    </span>
                                                    <span
                                                        className="delete-action"
                                                        style={{ cursor: "pointer", color: "red" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDate(dateKey);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" /> Delete date
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
                                <Stack direction="row" columnGap={3}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        columnGap={.25}
                                        sx={{ color: "#7c7c7c", fontSize: 14 }}
                                    >
                                        <BookOnlineIcon sx={{fontSize: 16}}/> {occurrenceTickets[dateKey] ? Object.keys(occurrenceTickets[dateKey]).length : 'No'} tickets
                                    </Stack>
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
                                                <th>Time Slot</th>
                                                <th>Duration</th>
                                                <th>Visible Tickets</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {slots.map((slot, index) => {
                                            const startTime = dayjs(slot.startTime).format("h:mm A");
                                            return (
                                                <tr key={index}>
                                                    <td>{startTime}</td>
                                                    <td>3h</td>
                                                    <td>
                                                        <Stack direction={'row'} alignItems={'center'}>
                                                            <BookOnlineIcon sx={{fontSize: 16, color: 'gray'}}/>
                                                            {occurrenceTickets[dateKey] && occurrenceTickets[dateKey][slot.startTime.toString()] ? Object.keys(occurrenceTickets[dateKey][slot.startTime.toString()]).length : 0}
                                                        </Stack>
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
            <h1 className="event-date-picker__title">Manage dates and times</h1>
            <p className="event-date-picker__subtitle">
                Start by adding the dates and time slots for your recurring event. Then
                edit ticket types, prices, and quantities for each time slot you create.
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
                                padding: "16px",
                            }
                        }}
                        value={selectedDate}
                        onChange={handleChangeDate}
                        slots={{ day: CustomDay }}
                        slotProps={{
                            day: { selectedDate, events },
                        }}
                    />
                </div>
                <Stack className="event-date-picker__details">
                    {Object.keys(events).length === 0 ? (
                        <>
                            <div className="event-date-picker__illustration">
                                <img
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0eRAW3FmfiHgn_Z8trB3HZhDPXcpkbNYAoA&s"
                                    alt="Event Planning"
                                />
                            </div>
                            <h2 className="event-date-picker__heading">Start planning your event</h2>
                            <p className="event-date-picker__description">It&#39;s gonna be epic!</p>
                            <button
                                className="event-date-picker__button"
                                onClick={handleAddDate}
                            >
                                Add a date
                            </button>
                        </>
                    ) : (
                        <Stack sx={{width: "100%"}} rowGap={1}>
                            <p className="link" onClick={handleAddDate}>
                                + Add a date
                            </p>
                            <RenderTimeSlotPreview />
                        </Stack>
                    )}
                </Stack>
            </Stack>
            <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
                <Stack
                    paddingBlock="4rem 1rem"
                    width="30rem"
                    paddingInline={3}
                    rowGap={3}
                    sx={{fontFamily: "Nunito"}}
                >
                    <Stack>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            paddingBlock=".5rem"
                        >
                            <Typography fontSize={17} fontWeight="bold">
                                Add dates and times
                            </Typography>
                            <IconButton onClick={() => setOpenDrawer(false)}>
                                <CloseIcon/>
                            </IconButton>
                        </Stack>
                        <hr/>
                    </Stack>

                    <Stack rowGap={3}>
                        <Typography fontWeight="bold" fontSize={22}>
                            Date
                        </Typography>
                        <DatePicker
                            format="DD/MM/YYYY"
                            label="Start date"
                            value={selectedDate}
                            onChange={(newValue) => {
                                setSelectedDate(newValue);
                                initEditingSlots(newValue);
                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel required>Repeats</InputLabel>
                            <Select
                                label="Repeats"
                                value={repeatOption}
                                onChange={handleRepeatOptionChange}
                                fullWidth
                            >
                                <MenuItem value="Once">Once</MenuItem>
                                <MenuItem value="Daily">Daily</MenuItem>
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Custom">Custom</MenuItem>
                            </Select>
                        </FormControl>
                        <RenderRepeatOption/>
                        {repeatOption !== "Once" && (
                            <DatePicker
                                format="DD/MM/YYYY"
                                label="End date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                            />
                        )}
                    </Stack>

                    <Stack rowGap={2}>
                        <Typography fontWeight="bold" fontSize={22}>
                            Time
                        </Typography>
                        <ToggleButtonGroup
                            color="primary"
                            exclusive
                            fullWidth
                            value={timeType}
                            onChange={handleTimeTypeChange}
                        >
                            <ToggleButton value="single">Single time</ToggleButton>
                            <ToggleButton value="multiple">Multiple times</ToggleButton>
                        </ToggleButtonGroup>

                        <Stack rowGap={2}>
                            {timeType === "multiple" && (
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <Stack direction="row" columnGap={2}>
                                            <DynamicFeedIcon/>{" "}
                                            <p style={{fontFamily: "Nunito", color: "gray"}}>
                                                Generate time slots
                                            </p>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack paddingBottom={2} rowGap={4}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TimePicker
                                                    label="Start time"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={timeSlot.startTime}
                                                    onChange={(newValue) =>
                                                        setTimeSlot((prev) => ({...prev, startTime: newValue}))
                                                    }
                                                />
                                                <TimePicker
                                                    label="End time"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={timeSlot.endTime}
                                                    onChange={(newValue) =>
                                                        setTimeSlot((prev) => ({...prev, endTime: newValue}))
                                                    }
                                                />
                                            </Stack>
                                            <Stack rowGap={2}>
                                                <p style={{fontWeight: "bold"}}>Time slots repeat every</p>
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
                                                                          sx={{borderRadius: 5}}
                                                            >
                                                                {time >= 60 ? time / 60 : time} {time >= 60 ? "hours" : "min"}
                                                            </ToggleButton>
                                                        ))}
                                                    </Stack>
                                                </ToggleButtonGroup>
                                                <Typography fontSize={16} color="#306adc">
                                                    Add a custom time
                                                </Typography>
                                            </Stack>
                                            <Stack rowGap={1}>
                                                <p style={{fontWeight: "bold"}}>Time slot duration</p>
                                                <Select
                                                    value={slotDuration}
                                                    onChange={(e) => setSlotDuration(e.target.value)}
                                                    fullWidth
                                                >
                                                    <MenuItem value="Until event ends">
                                                        Until event ends (10:00 PM)
                                                    </MenuItem>
                                                    <MenuItem value="Custom">Custom duration</MenuItem>
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
                                                Preview changes
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
                                        label="Start time"
                                        value={item.startTime}
                                        onChange={(newValue) => handleTimeChange(index, "startTime", newValue)}
                                    />
                                    <TimePicker
                                        format="HH:mm"
                                        label="End time"
                                        value={item.endTime}
                                        onChange={(newValue) => handleTimeChange(index, "endTime", newValue)}
                                    />
                                    {editingSlots.length > 1 && (
                                        <IconButton onClick={() => handleDeleteTimeSlot(index)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                        {timeType === "multiple" && (
                            <div className="link" onClick={handleAddTimeSlot}>
                                + Add a time slot
                            </div>
                        )}
                    </Stack>

                    <Stack direction="row" marginTop={3} columnGap={1}>
                        <Button fullWidth variant="outlined" onClick={() => setOpenDrawer(false)}>
                            Cancel
                        </Button>
                        <Button fullWidth variant="contained" color="error" onClick={handleSave}>
                            Save
                        </Button>
                    </Stack>
                </Stack>
            </Drawer>
            <Drawer anchor="right" open={openEditDrawer} onClose={() => setOpenEditDrawer(false)}>
                <Stack width="30rem" rowGap={2} sx={{fontFamily: "Nunito"}} paddingBlock="5rem 1rem" height={'100%'}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" paddingInline={3}>
                        {editDateKey && (
                            <Typography fontSize={17} fontWeight="bold">Edit time slots</Typography>
                        )}
                        <IconButton onClick={() => setOpenEditDrawer(false)}>
                            <CloseIcon/>
                        </IconButton>
                    </Stack>
                    <Stack rowGap={3} paddingInline={3} flexGrow={1}>
                        <hr/>
                        <Typography fontWeight="bold" fontSize={22}>
                            {dayjs(editDateKey).format("dddd, MMMM D, YYYY")}
                        </Typography>
                        {editSlots.map((slot, index) => (
                            <Stack direction="row" columnGap={1} key={index} alignItems="center">
                                <TimePicker
                                    label="Time slot start"
                                    value={slot.startTime}
                                    onChange={(newValue) => handleEditTimeChange(index, "startTime", newValue)}
                                />
                                <TimePicker
                                    label="Time slot end"
                                    value={slot.endTime}
                                    onChange={(newValue) => handleEditTimeChange(index, "endTime", newValue)}
                                />
                                <IconButton onClick={() => handleDeleteEditTimeSlot(index)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Stack>
                        ))}
                        <div
                            className="link"
                            style={{ color: "#306adc", cursor: "pointer" }}
                            onClick={handleAddEditTimeSlot}
                        >
                            + Add a time slot
                        </div>
                    </Stack>

                    <Stack paddingInline={3} rowGap={1}>
                        <hr/>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={applyToMultipleDates}
                                    onChange={(e) => setApplyToMultipleDates(e.target.checked)}
                                />
                            }
                            label="Apply changes to multiple dates"
                        />
                        <Stack direction="row" marginTop="auto" columnGap={1}>
                            <Button variant="outlined" fullWidth onClick={() => setOpenEditDrawer(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="error" fullWidth onClick={handleSaveEditTimes}>
                                Save
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" paddingInline={3}>
                        <Typography fontSize={17} fontWeight="bold">
                            Tickets
                        </Typography>
                        <IconButton onClick={() => setOpenEditTicketDrawer(false)}>
                            <CloseIcon/>
                        </IconButton>
                    </Stack>
                    <Stack rowGap={3} paddingInline={3} flexGrow={1}>
                        <hr/>
                        <Typography fontWeight="bold" fontSize={22}>
                            {dayjs(editDateKey).format("dddd, MMMM D, YYYY")}
                        </Typography>
                        <FormControl>
                            <InputLabel>Select a time slot</InputLabel>
                            <Select
                                label="Select a time slot"
                                fullWidth
                                value={selectedTicketSlotKey}
                                onChange={(e) => {
                                    const newSlotKey = e.target.value;
                                    setSelectedTicketSlotKey(newSlotKey);
                                    if (
                                        occurrenceTickets[editDateKey] &&
                                        occurrenceTickets[editDateKey][newSlotKey]
                                    ) {
                                        setEditingTickets(occurrenceTickets[editDateKey][newSlotKey]);
                                    } else {
                                        const defaultTickets = data.tickets.map((ticket) => ({
                                            ...ticket,
                                            enabled: true,
                                        }));
                                        setEditingTickets(defaultTickets);
                                    }
                                }}
                            >
                                {editSlots.map((slot, index) => {
                                    const slotKey = slot.startTime.toString();
                                    return (
                                        <MenuItem key={index} value={slotKey}>
                                            {dayjs(slot.startTime).format("h:mm A")} - {dayjs(slot.endTime).format("h:mm A")}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <Stack rowGap={2}>
                            {data?.tickets?.map((item, index) => {
                                const editedTicket = editingTickets.find((t) => t.id === item.id) || { ...item, enabled: true };
                                return (
                                    <Stack key={index} sx={{border: '1px solid', padding: '.75rem 1rem'}}>
                                        <Stack direction={'row'} justifyContent={'space-between'}>
                                            <Stack alignItems={'center'} direction={'row'} columnGap={1}>
                                                {editedTicket.enabled ?
                                                    <>
                                                        <VisibilityIcon sx={{ fontSize: 16 }} /> Visible
                                                    </>
                                                    :
                                                    <>
                                                        <VisibilityOffIcon sx={{ fontSize: 16 }} /> Hidden
                                                    </>
                                                }
                                            </Stack>
                                            <Switch
                                                checked={editedTicket.enabled}
                                                onChange={(e) => {
                                                    const newValue = e.target.checked;
                                                    setEditingTickets((prev) =>
                                                        prev.map((t) =>
                                                            t.id === item.id ? { ...t, enabled: newValue } : t
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
                                                <TextField
                                                    label={'Price'}
                                                    value={editedTicket.price}
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
                                                    label={'Quantity'}
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
                                <InfoOutlinedIcon sx={{ fontSize: 16 }} /> Create new tickets on the Add tickets page
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack paddingInline={3} rowGap={1} sx={{ overflowY: 'auto' }}>
                        <hr />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={applyToMultipleDates}
                                    onChange={(e) => setApplyToMultipleDates(e.target.checked)}
                                />
                            }
                            label="Apply changes to multiple dates"
                        />
                        <Stack direction={'row'} marginTop="auto" columnGap={1}>
                            <Button variant="outlined" fullWidth onClick={() => setOpenEditTicketDrawer(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="error" fullWidth onClick={handleSaveTickets}>
                                Save
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Drawer>
        </Stack>
    );
}

export default RecurringEventSchedule;
