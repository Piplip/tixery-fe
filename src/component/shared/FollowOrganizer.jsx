import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {useCallback, useEffect, useState} from "react";
import {Avatar, Button, Dialog, DialogContent, IconButton, Stack, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";

FollowOrganizer.propTypes = {
    profileImage: PropTypes.string,
    organizerID: PropTypes.number,
    organizerName: PropTypes.string
}

function FollowOrganizer({profileImage, organizerID, organizerName}) {
    const [isFollow, setIsFollow] = useState(sessionStorage.getItem('followed-organizer')?.includes(organizerID?.toString()));
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setIsFollow(sessionStorage.getItem('followed-organizer')?.includes(organizerID));
    }, [organizerID])

    const handleClose = () => {
        setOpen(false);
    };

    const debounceFollow = useCallback(debounce((state) => {
        accountAxiosWithToken.post(`follow?upid=${getUserData("profileID")}&opid=${organizerID}&follow=${state}`)
            .then(r => {
                let followedOrganizer = sessionStorage.getItem('followed-organizer')?.split(',')
                if (state) {
                    followedOrganizer.push(organizerID.toString())
                } else {
                    followedOrganizer = followedOrganizer.filter(id => id !== organizerID.toString())
                }
                sessionStorage.setItem('followed-organizer', followedOrganizer)
            })
            .catch(err => console.log(err))
    }, 500), []);

    useEffect(() => {
        return () => debounceFollow.cancel();
    }, [debounceFollow]);


    function handleFollow(){
        if(checkLoggedIn()){
            setIsFollow(prev => !prev)
            debounceFollow(!isFollow)
        }
        else{
            setOpen(true)
        }
    }

    return (
        <>
            <Dialog onClose={handleClose} open={open} fullWidth={true} maxWidth={'sm'}>
                <IconButton
                    onClick={handleClose}
                    sx={{position: 'absolute', right: 8, top: 8,}}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{marginTop: 2, fontFamily: 'Nunito'}}>
                    <Stack alignItems={'center'} rowGap={3}>
                        <Avatar src={profileImage} sx={{width: 100, height: 100}}/>
                        <Typography variant={'h4'} fontWeight={'bold'} fontFamily={'Nunito'}>
                            Sign in to follow {organizerName}
                        </Typography>
                        <Typography variant={'body2'}>
                            Stay up on the latest from your favorite event organizers
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
                                Sign in
                            </Button>
                        </Link>
                    </Stack>
                </DialogContent>
            </Dialog>
            <button className={isFollow ? `followed-btn` : 'follow-btn'} onClick={handleFollow}>
                {isFollow ? 'Following' : 'Follow'}
            </button>
        </>
    )
}

export default FollowOrganizer;