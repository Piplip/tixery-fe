import Carousel from "../shared/Carousel.jsx";
import {Stack} from "@mui/material";
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import SportsGymnasticsOutlinedIcon from '@mui/icons-material/SportsGymnasticsOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import "../../styles/attendee-hero.css"
import {useTranslation} from "react-i18next";

const images = [
    {
        imgURL: "https://cdn.evbstatic.com/s3-build/fe/build/images/427ab8dca801f117ae14301b994842b2-nye_citybrowse_desktop.webp",
        imgAlt: "img-1"
    },
    {
        imgURL: "https://cdn.evbstatic.com/s3-build/fe/build/images/38704ac58762310b375e6fed15bef2f5-nye_category_desktop.webp",
        imgAlt: "img-2"
    },
    {
        imgURL: "https://cdn.evbstatic.com/s3-build/fe/build/images/f55095eaf945235b290443c5c0827da1-nye_nightlife_desktop.webp",
        imgAlt: "img-3"
    },
    {
        imgURL: "https://cdn.evbstatic.com/s3-build/fe/build/images/389ece7b7e2dc7ff8d28524bad30d52c-dsrp_desktop.webp",
        imgAlt: "img-4"
    },
    {
        imgURL: "https://cdn.evbstatic.com/s3-build/fe/build/images/69483a6795b18c6d44143f9a6399142c-valentine_dating_desktop.webp",
        imgAlt: "img-5"
    },
];

function AttendeeHero() {
    const {t} = useTranslation()

    const eventGenres = [
        { labelKey: 'attendeeHero.music', icon: <MusicNoteOutlinedIcon sx={{ fontSize: '3rem' }} /> },
        { labelKey: 'attendeeHero.foodAndDrink', icon: <FastfoodOutlinedIcon sx={{ fontSize: '3rem' }} /> },
        { labelKey: 'attendeeHero.business', icon: <BusinessOutlinedIcon sx={{ fontSize: '3rem' }} /> },
        { labelKey: 'attendeeHero.health', icon: <HealthAndSafetyOutlinedIcon sx={{ fontSize: '3rem' }} /> },
        { labelKey: 'attendeeHero.fashion', icon: <DiamondOutlinedIcon sx={{ fontSize: '3rem' }} /> },
        { labelKey: 'attendeeHero.filmAndMedia', icon: <VideoCallOutlinedIcon sx={{ fontSize: '3rem' }} /> },
        { labelKey: 'attendeeHero.hobbies', icon: <SportsGymnasticsOutlinedIcon sx={{ fontSize: '3rem' }} /> },
        { labelKey: 'attendeeHero.travelAndOutdoor', icon: <BeachAccessOutlinedIcon sx={{ fontSize: '3rem' }} /> }
    ];

    return (
        <Stack className={'attendee-hero'} rowGap={'2rem'}>
            <Carousel>
                {images.map((image, index) => {
                    return <img key={index} src={image.imgURL} alt={image.imgAlt} />;
                })}
            </Carousel>
            <Stack direction={'row'} justifyContent={'space-between'} flexGrow={1} alignItems={'center'}>
                {eventGenres.map((genre, index) => {
                    return (
                        <Stack key={index} className={'attendee-hero__event-genre'}>
                            <div className={'attendee-hero__event-genre__icon-wrapper'}>
                                {genre.icon}
                            </div>
                            <p>{t(genre.labelKey)}</p>
                        </Stack>
                    )
                })}
            </Stack>
        </Stack>
    );
}

export default AttendeeHero;