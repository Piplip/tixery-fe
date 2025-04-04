import PropTypes from "prop-types";
import { useEffect, useState, useMemo } from "react";
import { eventAxiosWithToken } from "../../config/axiosConfig.js";
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import { Button } from '@mui/material';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TextField, InputAdornment, Typography, Box, FormControl, InputLabel, Select,
    MenuItem, Pagination, CircularProgress, TableSortLabel, Chip, Checkbox
} from "@mui/material";
import AttendeeEmailDialog from "./AttendeeEmailDialog.jsx";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';
import AttendeeAnalytics from "./AttendeeAnalytics.jsx";

EventAttendee.propTypes = {
    eventID: PropTypes.string,
}

function EventAttendee({ eventID }) {
    const { t } = useTranslation();
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [ticketFilter, setTicketFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [orderBy, setOrderBy] = useState("registration_date");
    const [order, setOrder] = useState("desc");
    const [selectedAttendees, setSelectedAttendees] = useState([])
    const [showAnalytics, setShowAnalytics] = useState(false);
    const rowsPerPage = 10;

    useEffect(() => {
        if(!eventID) return;

        setLoading(true);
        eventAxiosWithToken.get(`/event/attendees?eid=${eventID}`)
            .then(r => {
                console.log(r.data)
                setAttendees(r.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [eventID]);

    const uniqueAttendees = useMemo(() => {
        if(attendees.length === 0) return [];

        const uniqueMap = new Map();

        attendees.forEach(attendee => {
            const key = `${attendee.profile_id}-${attendee.ticket_type_id}`;
            if (uniqueMap.has(key)) {
                uniqueMap.get(key).ticket_count += attendee.ticket_count;
            } else {
                uniqueMap.set(key, {...attendee});
            }
        });

        return Array.from(uniqueMap.values());
    }, [attendees]);

    const ticketTypes = useMemo(() => {
        const types = new Set(uniqueAttendees.map(a => a.ticket_name));
        return Array.from(types);
    }, [uniqueAttendees]);

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const filteredAttendees = useMemo(() => {
        return uniqueAttendees
            .filter(attendee => {
                const searchMatch = searchTerm === "" ||
                    attendee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendee.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendee.phoneNumber.includes(searchTerm);

                const ticketMatch = ticketFilter === "all" || attendee.ticket_name === ticketFilter;

                return searchMatch && ticketMatch;
            })
            .sort((a, b) => {
                if (orderBy === "registration_date") {
                    return order === "asc"
                        ? new Date(a[orderBy]) - new Date(b[orderBy])
                        : new Date(b[orderBy]) - new Date(a[orderBy]);
                }

                if (order === "asc") {
                    return a[orderBy] < b[orderBy] ? -1 : 1;
                } else {
                    return a[orderBy] > b[orderBy] ? -1 : 1;
                }
            });
    }, [uniqueAttendees, searchTerm, ticketFilter, orderBy, order]);

    const paginatedAttendees = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredAttendees.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredAttendees, page]);

    const handleSelectAttendee = (profileId) => {
        if (selectedAttendees.includes(profileId)) {
            setSelectedAttendees(selectedAttendees.filter(id => id !== profileId));
        } else {
            setSelectedAttendees([...selectedAttendees, profileId]);
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = paginatedAttendees.map(a => a.profile_id);
            setSelectedAttendees([...new Set([...selectedAttendees, ...newSelected])]);
        } else {
            const pageIds = paginatedAttendees.map(a => a.profile_id);
            setSelectedAttendees(selectedAttendees.filter(id => !pageIds.includes(id)));
        }
    };

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">{t('eventAttendee.title')}</Typography>
                <Button
                    variant="outlined"
                    startIcon={showAnalytics ? <PeopleIcon /> : <BarChartIcon />}
                    onClick={() => setShowAnalytics(!showAnalytics)}
                >
                    {showAnalytics ? t('eventAttendee.viewAttendees') : t('eventAttendee.viewAnalytics')}
                </Button>
            </Box>

            {showAnalytics ?
                <AttendeeAnalytics attendees={attendees} />
                :
                <>
                    <Box sx={{ display: "flex", mb: 3, gap: 2, flexWrap: "wrap" }}>
                        <TextField
                            placeholder={t('eventAttendee.searchPlaceholder')}
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flexGrow: 1, minWidth: "250px" }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: "200px" }}>
                            <InputLabel>{t('eventAttendee.ticketType')}</InputLabel>
                            <Select
                                value={ticketFilter}
                                onChange={(e) => setTicketFilter(e.target.value)}
                                label={t('eventAttendee.ticketType')}
                            >
                                <MenuItem value="all">{t('eventAttendee.allTicketTypes')}</MenuItem>
                                {ticketTypes.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "flex", ml: "auto" }}>
                            <AttendeeEmailDialog
                                attendees={uniqueAttendees}
                                ticketTypes={ticketTypes}
                                ticketFilter={ticketFilter}
                                selectedAttendees={selectedAttendees}
                                eventID={eventID}
                            />
                        </Box>
                    </Box>

                    <Box mb={2}>
                        <Chip
                            label={`${filteredAttendees.length} ${t('eventAttendee.attendeesFound')}`}
                            variant="outlined"
                        />
                    </Box>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredAttendees.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography>{t('eventAttendee.noAttendeesFound')}</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    indeterminate={
                                                        paginatedAttendees.some(a => selectedAttendees.includes(a.profile_id)) &&
                                                        !paginatedAttendees.every(a => selectedAttendees.includes(a.profile_id))
                                                    }
                                                    checked={
                                                        paginatedAttendees.length > 0 &&
                                                        paginatedAttendees.every(a => selectedAttendees.includes(a.profile_id))
                                                    }
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={orderBy === "fullName"}
                                                    direction={orderBy === "fullName" ? order : "asc"}
                                                    onClick={() => handleSort("fullName")}
                                                >
                                                    {t('eventAttendee.fullName')}
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>{t('eventAttendee.email')}</TableCell>
                                            <TableCell>{t('eventAttendee.phone')}</TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={orderBy === "ticket_name"}
                                                    direction={orderBy === "ticket_name" ? order : "asc"}
                                                    onClick={() => handleSort("ticket_name")}
                                                >
                                                    {t('eventAttendee.ticketType')}
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell align="center">
                                                <TableSortLabel
                                                    active={orderBy === "ticket_count"}
                                                    direction={orderBy === "ticket_count" ? order : "asc"}
                                                    onClick={() => handleSort("ticket_count")}
                                                >
                                                    {t('eventAttendee.quantity')}
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={orderBy === "registration_date"}
                                                    direction={orderBy === "registration_date" ? order : "asc"}
                                                    onClick={() => handleSort("registration_date")}
                                                >
                                                    {t('eventAttendee.registrationDate')}
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedAttendees.map((attendee, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedAttendees.includes(attendee.profile_id)}
                                                        onChange={() => handleSelectAttendee(attendee.profile_id)}
                                                    />
                                                </TableCell>
                                                <TableCell>{attendee.fullName}</TableCell>
                                                <TableCell>{attendee.email}</TableCell>
                                                <TableCell>{attendee.phoneNumber}</TableCell>
                                                <TableCell>{attendee.ticket_name}</TableCell>
                                                <TableCell align="center">{attendee.ticket_count}</TableCell>
                                                <TableCell>{dayjs(attendee.registration_date).format("DD MMM YYYY, HH:mm")}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Pagination
                                    count={Math.ceil(filteredAttendees.length / rowsPerPage)}
                                    page={page}
                                    onChange={(_, newPage) => setPage(newPage)}
                                    color="primary"
                                />
                            </Box>
                        </>
                    )}
                </>
            }
        </Box>
    );
}

export default EventAttendee;