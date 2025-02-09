import {Stack, Tooltip, Typography} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import {Divider, Modal, ModalClose, ModalDialog} from "@mui/joy";
import {useState} from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import PropTypes from "prop-types";

const prefix = "http://localhost:5173/events/"

ShareDialog.propTypes = {
    eventID: PropTypes.string
}

function ShareDialog({eventID}){
    const [open, setOpen] = useState(false);
    const [copyTooltip, setCopyTooltip] = useState('Copy to clipboard');

    const handleCopy = () => {
        const eventURL = eventID ? prefix + eventID : window.location.href;

        navigator.clipboard.writeText(eventURL)
            .then(() => {
                setCopyTooltip('Copied!');
                setTimeout(() => setCopyTooltip('Copy to clipboard'), 2000);
            })
            .catch(() => {
                setCopyTooltip('Failed to copy');
                setTimeout(() => setCopyTooltip('Copy to clipboard'), 2000);
            });
    };

    return (
        <div>
            <Tooltip
                className={'event-view__action event-view__action--share'}
                title={'Share event'}>
                <ShareIcon onClick={(e) => {
                    setOpen(true)
                    e.stopPropagation()
                }}/>
            </Tooltip>
            <Modal open={open} onClick={e => e.stopPropagation()}
                   onClose={() => {setOpen(false)}}
                   sx={{zIndex: 10000001}}
            >
                <ModalDialog>
                    <ModalClose />
                    <Typography textAlign={'center'} variant={'h6'}>Share events</Typography>
                    <Divider />
                    <Stack rowGap={5} margin={4}>
                        <Stack alignSelf={'center'} direction={'row'} columnGap={3}>
                            <FacebookRoundedIcon sx={{fontSize: 30}}/>
                            <InstagramIcon sx={{fontSize: 30}}/>
                            <XIcon sx={{fontSize: 30}}/>
                        </Stack>
                        <Stack direction={'row'} columnGap={5} alignItems={'center'} style={{border: '1px solid', padding: '.5rem 1rem'}}>
                            <Stack>
                                <Typography variant={'body2'} fontWeight={'bold'}>Event URL</Typography>
                                <p>{eventID ? prefix + eventID : window.location.href}</p>
                            </Stack>
                            <Tooltip title={copyTooltip}>
                                <ContentCopyIcon onClick={handleCopy} style={{cursor: 'pointer'}} />
                            </Tooltip>
                        </Stack>
                    </Stack>
                </ModalDialog>
            </Modal>
        </div>
    )
}

export default ShareDialog;