import {Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from "@mui/material";
import {useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import '../../styles/organizer-setting-profile-styles.css'
import {Link} from "react-router-dom";

function OrganizerSettingProfile() {
    const [dialogOpen, setDialogOpen] = useState(false);

    const profiles = [
        { id: 1, name: "John Doe", avatar: "https://via.placeholder.com/150" },
        { id: 2, name: "Jane Smith", avatar: "https://via.placeholder.com/150" },
    ];

    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => setDialogOpen(false);

    return (
        <section className="organizer-profile">
            <h1 className="organizer-profile__title">Organizer Profiles</h1>
            <p className="organizer-profile__description">
                Each profile describes a unique organizer and shows all of their events on one page. Having a complete profile can encourage attendees to follow you.
                <Link to={'/help'}> <div style={{display: 'inline', color: 'blue'}}>Learn more</div></Link>
            </p>

            <div className="organizer-profile__list">
                {profiles.map((profile) => (
                    <div key={profile.id} className="organizer-profile__card">
                        <Avatar src={profile.avatar} alt={profile.name} className="organizer-profile__avatar" />
                        <p className="organizer-profile__name">{profile.name}</p>
                        <div className="organizer-profile__actions">
                            <Button variant="outlined" size="small">View</Button>
                            <Button variant="contained" color="primary" size="small">Edit</Button>
                        </div>
                    </div>
                ))}
                <button className="organizer-profile__add-button"
                    onClick={handleDialogOpen}
                >
                    Add New Profile
                </button>
            </div>

            <Dialog open={dialogOpen} onClose={handleDialogClose} sx={{textAlign: 'center'}}>
                <IconButton
                    onClick={handleDialogClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogTitle sx={{m: 0, paddingTop: '3rem', paddingInline: '5rem'}}>
                    Are you sure you want to create a new <br/>organizer profile?</DialogTitle>
                <DialogContent sx={{paddingInline: '3rem'}}>
                    <Typography variant={'body2'} color={'gray'}>
                        We created an existing organizer profile for you so that you can easily edit it.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{alignSelf: 'center', marginBottom: '.5rem'}}>
                    <Button onClick={handleDialogClose} variant="outlined">
                        Edit Existing
                    </Button>
                    <Button onClick={handleDialogClose} variant="contained">
                        Create New
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    );
}

export default OrganizerSettingProfile