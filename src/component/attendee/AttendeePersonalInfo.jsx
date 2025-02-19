import {Stack, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";

function AttendeePersonalInfo(){
    const {t} = useTranslation()

    return (
        <Stack rowGap={3} marginTop={3}>
            <Typography variant={'h5'} fontWeight={'bold'} style={{ borderBottom: '1px solid gray', paddingBottom: '.5rem' }}>
                {t('attendeePersonalInfo.requestDataCopy')}
            </Typography>
            <Typography fontSize={15} color={'gray'}>
                {t('attendeePersonalInfo.requestDataDescription')} <Link to={'/privacy-center'} className={'link'}>{t('attendeePersonalInfo.privacyCenter')}</Link>
                . {t('attendeePersonalInfo.selectTakeControl')}
            </Typography>
        </Stack>
    );
}

export default AttendeePersonalInfo