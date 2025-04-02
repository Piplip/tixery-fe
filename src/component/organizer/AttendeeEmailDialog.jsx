import { useState } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, FormControlLabel, Checkbox, Box, TextField, Chip,
    IconButton, CircularProgress, Snackbar, Alert
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
import CustomEditor from "../shared/CustomEditor";
import { eventAxiosWithToken } from "../../config/axiosConfig.js";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

AttendeeEmailDialog.propTypes = {
    attendees: PropTypes.array.isRequired,
    ticketTypes: PropTypes.array.isRequired,
    ticketFilter: PropTypes.string.isRequired,
    selectedAttendees: PropTypes.array.isRequired,
}

function AttendeeEmailDialog({ attendees, ticketTypes, selectedAttendees }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [selectionMode, setSelectionMode] = useState("all");
    const [selectedTicketTypes, setSelectedTicketTypes] = useState([]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleTicketTypeSelection = (ticketType) => {
        if (selectedTicketTypes.includes(ticketType)) {
            setSelectedTicketTypes(selectedTicketTypes.filter(type => type !== ticketType));
        } else {
            setSelectedTicketTypes([...selectedTicketTypes, ticketType]);
        }
    };

    const handleSendEmail = () => {
        if (!subject.trim()) {
            setSnackbar({ open: true, message: t('attendeeEmail.subjectRequired'), severity: "error" });
            return;
        }

        if (!emailContent.trim()) {
            setSnackbar({ open: true, message: t('attendeeEmail.contentRequired'), severity: "error" });
            return;
        }

        setLoading(true);

        let recipientEmails = [];

        switch(selectionMode) {
            case "all":
                recipientEmails = attendees.map(a => a.email);
                break;
            case "byticket":
                if (selectedTicketTypes.length > 0) {
                    recipientEmails = attendees
                        .filter(a => selectedTicketTypes.includes(a.ticket_name))
                        .map(a => a.email);
                }
                break;
            case "selected":
                recipientEmails = attendees
                    .filter(a => selectedAttendees.includes(a.profile_id))
                    .map(a => a.email);
                break;
        }

        recipientEmails = [...new Set(recipientEmails)];

        eventAxiosWithToken.post(`/attendees/email`, {
            recipients: recipientEmails,
            subject: subject,
            content: emailContent
        })
            .then(() => {
                setSnackbar({
                    open: true,
                    message: t('attendeeEmail.emailSent', { count: recipientEmails.length }),
                    severity: "success"
                });
                handleClose();
                setSubject("");
                setEmailContent("");
            })
            .catch(() => {
                setSnackbar({
                    open: true,
                    message: t('attendeeEmail.emailSent', { count: recipientEmails.length }),
                    severity: "success"
                });
                handleClose();
                setSubject("");
                setEmailContent("");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const getRecipientCount = () => {
        switch(selectionMode) {
            case "all":
                return new Set(attendees.map(a => a.email)).size;
            case "byticket":
                if (selectedTicketTypes.length === 0) return 0;
                return new Set(attendees
                    .filter(a => selectedTicketTypes.includes(a.ticket_name))
                    .map(a => a.email)).size;
            case "selected":
                return new Set(attendees
                    .filter(a => selectedAttendees.includes(a.profile_id))
                    .map(a => a.email)).size;
            default:
                return 0;
        }
    };

    return (
        <>
            <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={handleOpen}
                disabled={attendees.length === 0}
            >
                {t('attendeeEmail.sendEmail')}
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle sx={{ pb: 1 }}>
                    {t('attendeeEmail.composeEmail')}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <Box mb={3}>
                        <Typography variant="subtitle1" gutterBottom>
                            {t('attendeeEmail.recipients')}
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={1}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectionMode === "all"}
                                        onChange={() => setSelectionMode("all")}
                                    />
                                }
                                label={t('attendeeEmail.allAttendees')}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectionMode === "byticket"}
                                        onChange={() => setSelectionMode("byticket")}
                                    />
                                }
                                label={t('attendeeEmail.byTicketTypes')}
                            />

                            {selectionMode === "byticket" && (
                                <Box ml={4} mt={1} mb={1}>
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        {t('attendeeEmail.selectTicketTypes')}
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                        {ticketTypes.map(type => (
                                            <Chip
                                                key={type}
                                                label={type}
                                                clickable
                                                color={selectedTicketTypes.includes(type) ? "primary" : "default"}
                                                onClick={() => handleTicketTypeSelection(type)}
                                            />
                                        ))}
                                    </Box>
                                    {selectedTicketTypes.length === 0 && selectionMode === "byticket" && (
                                        <Typography variant="caption" color="error">
                                            {t('attendeeEmail.selectAtLeastOne')}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {selectedAttendees.length > 0 && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectionMode === "selected"}
                                            onChange={() => setSelectionMode("selected")}
                                        />
                                    }
                                    label={t('attendeeEmail.selectedAttendees', { count: selectedAttendees.length })}
                                />
                            )}
                        </Box>

                        <Box mt={2}>
                            <Chip
                                label={t('attendeeEmail.recipientCount', { count: getRecipientCount() })}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </Box>

                    <Box mb={3}>
                        <TextField
                            label={t('attendeeEmail.subject')}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            fullWidth
                            required
                        />
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                        {t('attendeeEmail.message')}
                    </Typography>

                    <CustomEditor
                        content={emailContent}
                        handleChange={(content) => setEmailContent(content)}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={loading}>
                        {t('attendeeEmail.cancel')}
                    </Button>
                    <Button
                        onClick={handleSendEmail}
                        variant="contained"
                        color="primary"
                        disabled={loading || getRecipientCount() === 0 || (selectionMode === "byticket" && selectedTicketTypes.length === 0)}
                        startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    >
                        {loading ? t('attendeeEmail.sending') : t('attendeeEmail.send')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
export default AttendeeEmailDialog