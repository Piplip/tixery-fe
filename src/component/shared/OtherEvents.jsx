import {Stack, Typography} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function OtherEvents(){
    return (
        <Stack>
            <Stack direction={'row'} justifyContent={'space-between'}>
                <Typography variant={'h5'}>
                    Other events you may like
                </Typography>
                <Stack direction={'row'} columnGap={2}>
                    <ArrowBackIcon />
                    <ArrowForwardIcon />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default OtherEvents