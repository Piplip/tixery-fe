import {useState} from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Stack, TextField,
    Typography, FormLabel, Radio, RadioGroup, Snackbar, Alert
} from "@mui/material";
import {eventAxios} from "../../config/axiosConfig.js";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

const REPORT_REASONS = [
    'Fraudulent Event Listings or Scams',
    'Harmful Content',
    'Regulated Content or Activities',
    'Spam',
    'Sexually Explicit Content',
    'Hateful Content',
    'Violence or Extremism',
    'Canceled Event',
    'Request a Refund',
    'Copyright or Trademark Infringement'
];

ReportEvent.propTypes = {
    eventID: PropTypes.string.isRequired
}

function ReportEvent({eventID}){
    const [step, setStep] = useState(1);
    const [open, setOpen] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [reason, setReason] = useState('');
    const [email, setEmail] = useState(getUserData('sub') || '');
    const [description, setDescription] = useState('');

    const {t} = useTranslation()

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleClose = () => {
        setStep(1);
        setReason('');
        setEmail('');
        setDescription('');
        setOpen(false)
    };

    const handleSubmit = () => {
        let payload = {
            detail: description,
            reason: reason,
            eventID,
        }

        if(checkLoggedIn()){
            payload = {...payload,
                reporterEmail: email,
                reporterProfileID: getUserData('profileID')
            }
        }
        else {
            payload = {
                ...payload,
                email: email
            }
        }

        eventAxios.post(`/event/report?tz=${Math.floor(new Date().getTimezoneOffset() / -60)}`, payload)
            .then((r) => {
                if(r.data.status === 'OK'){
                    handleClose();
                    setOpenSnackbar(true)
                }
            })
            .catch(err => {
                console.log(err)
                handleClose()
            })
    };

    return (
        <>
            <div onClick={() => setOpen(true)} className={'link'} style={{cursor: 'pointer'}}>
                {t('report_this_event')}
            </div>
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={openSnackbar} autoHideDuration={6000}
                      onClose={() => setOpenSnackbar(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    {t('report_submitted')}
                </Alert>
            </Snackbar>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{zIndex: 10000000}}>
                {step === 1 && (
                    <>
                        <DialogTitle>{t('report_this_event')}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <Typography variant="body1">
                                    {t('community_guidelines_description')}
                                </Typography>
                                <Typography variant="body1">
                                    {t('contact_organizer_first')}
                                </Typography>
                                <Typography variant="body1">
                                    {t('imminent_danger_contact_law_enforcement')}
                                </Typography>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                {t('cancel')}
                            </Button>
                            <Button onClick={handleNext} variant="contained" color="primary">
                                {t('start_report')}
                            </Button>
                        </DialogActions>
                    </>
                )}

                {step === 2 && (
                    <>
                        <DialogTitle>{t('report_this_event')}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">{t('reason_for_report')}</FormLabel>
                                    <RadioGroup
                                        name="reportReason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    >
                                        {REPORT_REASONS.map((r) => (
                                            <FormControlLabel
                                                key={r}
                                                value={r}
                                                control={<Radio />}
                                                label={t(r.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, ''))}
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>

                                <TextField
                                    label={t('your_email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                />

                                <TextField
                                    label={t('description')}
                                    multiline
                                    rows={4}
                                    placeholder={t('description_placeholder')}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    fullWidth
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleBack} color="primary">
                                {t('back')}
                            </Button>
                            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!reason}>
                                {t('submit')}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
}

export default ReportEvent;