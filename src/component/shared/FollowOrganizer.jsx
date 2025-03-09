import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {useCallback, useEffect, useState} from "react";
import {Avatar, Button, Dialog, DialogContent, IconButton, Stack, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {useTranslation} from "react-i18next";

FollowOrganizer.propTypes = {
    profileImage: PropTypes.string,
    organizerID: PropTypes.number,
    organizerName: PropTypes.string
}

function FollowOrganizer({profileImage, organizerID, organizerName}) {
    const [isFollow, setIsFollow] = useState(sessionStorage.getItem('followed-organizer')?.includes(organizerID?.toString()));
    const [open, setOpen] = useState(false);
    const {t} = useTranslation()

    useEffect(() => {
        setIsFollow(sessionStorage.getItem('followed-organizer')?.includes(organizerID?.toString()));
    }, [organizerID])

    useEffect(() => {
        let followedOrganizer = JSON.parse(sessionStorage.getItem('followed-organizer')) || [];
        if (isFollow) {
            if (!followedOrganizer.includes(organizerID.toString())) {
                followedOrganizer.push(organizerID.toString());
            }
        } else {
            followedOrganizer = followedOrganizer.filter(id => id !== organizerID.toString());
        }
        sessionStorage.setItem('followed-organizer', JSON.stringify(followedOrganizer));
    }, [isFollow, organizerID]);

    const handleClose = () => {
        setOpen(false);
    };

    const debounceFollow = useCallback(debounce((state) => {
        accountAxiosWithToken.post(`follow?upid=${getUserData("profileID")}&opid=${organizerID}&follow=${state}`)
            .catch(err => console.log(err));
    }, 500), [organizerID]);

    useEffect(() => {
        return () => debounceFollow.cancel();
    }, [debounceFollow]);

    function handleFollow() {
        if (checkLoggedIn()) {
            setIsFollow(prev => !prev);
            debounceFollow(!isFollow);
        } else {
            setOpen(true);
        }
    }

    return (
        <>
            <Dialog onClose={handleClose} open={open} fullWidth={true} maxWidth={'sm'}>
                <IconButton
                    onClick={handleClose}
                    sx={{ position: 'absolute', right: 8, top: 8, }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ marginTop: 2, fontFamily: 'Nunito' }}>
                    <Stack alignItems={'center'} rowGap={3}>
                        <Avatar src={profileImage} sx={{ width: 100, height: 100 }} />
                        <Typography variant={'h4'} fontWeight={'bold'} fontFamily={'Nunito'}>
                            {t('followOrganizer.signInToFollow')} {organizerName}
                        </Typography>
                        <Typography variant={'body2'}>
                            {t('followOrganizer.stayUpToDate')}
                        </Typography>
                        <Link to={'/login'}>
                            <Button
                                sx={{
                                    backgroundColor: '#e82727', marginBlock: '1rem', fontSize: '1.25rem',
                                    color: 'white', padding: '.4rem 3rem', textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#d50000'
                                    }
                                }}
                            >
                                {t('followOrganizer.signIn')}
                            </Button>
                        </Link>
                    </Stack>
                </DialogContent>
            </Dialog>
            <button className={isFollow ? `followed-btn` : 'follow-btn'} onClick={handleFollow}>
                {isFollow ? t('followOrganizer.following') : t('followOrganizer.follow')}
            </button>
        </>
    );
}

export default FollowOrganizer;