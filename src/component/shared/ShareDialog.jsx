import {Stack, Tooltip, Typography} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import {Divider, Modal, ModalClose, ModalDialog} from "@mui/joy";
import {useState} from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";
import {collectData} from "../../common/Utilities.js";
import {useAlert} from "../../custom-hooks/useAlert.js";

const basePath = 'https://tixery-fe.vercel.app/'

const ShareDialog = ({ eventID }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [copyTooltip, setCopyTooltip] = useState(t('shareDialog.copyToClipboard'));
    const {showInfo, showError} = useAlert()

    const handleCopy = () => {
        const eventURL = eventID ? basePath + eventID : basePath

        navigator.clipboard.writeText(eventURL)
            .then(() => {
                showInfo(t('shareDialog.copied'));
                setTimeout(() => setCopyTooltip(t('shareDialog.copyToClipboard')), 2000);
            })
            .catch(() => {
                showError(t('shareDialog.copyFailed'));
                setTimeout(() => setCopyTooltip(t('shareDialog.copyToClipboard')), 2000);
            });

        collectData(eventID, 'share')
    };

    return (
        <div>
            <Tooltip
                className={'event-view__action event-view__action--share'}
                title={t('shareDialog.shareEvent')}>
                <ShareIcon onClick={(e) => {
                    setOpen(true);
                    e.stopPropagation();
                }} />
            </Tooltip>
            <Modal open={open} onClick={e => e.stopPropagation()}
                   onClose={() => { setOpen(false) }}
                   sx={{ zIndex: 10000001 }}
            >
                <ModalDialog>
                    <ModalClose />
                    <Typography textAlign={'center'} variant={'h6'}>{t('shareDialog.shareEvents')}</Typography>
                    <Divider />
                    <Stack rowGap={5} margin={4}>
                        <Stack alignSelf={'center'} direction={'row'} columnGap={3}>
                            <FacebookRoundedIcon sx={{ fontSize: 30 }} />
                            <InstagramIcon sx={{ fontSize: 30 }} />
                            <XIcon sx={{ fontSize: 30 }} />
                        </Stack>
                        <Stack direction={'row'} columnGap={5} alignItems={'center'} style={{ border: '1px solid', padding: '.5rem 1rem' }}>
                            <Stack>
                                <Typography variant={'body2'} fontWeight={'bold'}>{t('shareDialog.eventURL')}</Typography>
                                <p>{eventID ? basePath + eventID : basePath}</p>
                            </Stack>
                            <Tooltip title={copyTooltip}>
                                <ContentCopyIcon onClick={handleCopy} style={{ cursor: 'pointer' }} />
                            </Tooltip>
                        </Stack>
                    </Stack>
                </ModalDialog>
            </Modal>
        </div>
    );
}

ShareDialog.propTypes = {
    eventID: PropTypes.string
}

export default ShareDialog;
