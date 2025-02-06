import {Stack, Typography} from "@mui/material";
import {Link} from "react-router-dom";

function AttendeePersonalInfo(){
    return (
        <Stack rowGap={3} marginTop={3}>
            <Typography variant={'h5'} fontWeight={'bold'} style={{borderBottom: '1px solid gray', paddingBottom: '.5rem'}}>
                Request a copy of your personal data
            </Typography>
            <Typography fontSize={15} color={'gray'}>
                If you want to request a copy of your personal data from Tixery, submit a request in our <Link to={'/privacy-center'} className={'link'}>{`privacy center`}</Link>
                . Once there, select &#34;Take Control&#34;.
            </Typography>
        </Stack>
    )
}

export default AttendeePersonalInfo