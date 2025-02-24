import {IconButton, Stack, Typography, useMediaQuery} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {useEffect, useRef, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";
import EventCard from "./EventCard.jsx";
import {useTranslation} from "react-i18next";
import {checkLoggedIn, getCookie, getUserData} from "../../common/Utilities.js";

function OtherEvents() {
    const [events, setEvents] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = useRef(null);
    const { t } = useTranslation();

    const isSmallScreen = useMediaQuery('(max-width: 600px)');
    const isMediumScreen = useMediaQuery('(max-width: 960px)');

    const cardWidth = isSmallScreen ? 400 : isMediumScreen ? 300 : 350;
    const scrollAmount = cardWidth * (isSmallScreen ? 1 : isMediumScreen ? 2 : 3);

    useEffect(() => {
        const params = new URLSearchParams({
            lat: getCookie('user-location').lat,
            lon: getCookie('user-location').lon,
            limit: 12
        })

        if(checkLoggedIn()){
            params.append('pid', getUserData('profileID'));
        }

        eventAxios.get(`/get/suggested?${params.toString()}`)
            .then(r => {
                setEvents(r.data);
            })
            .catch(err => console.log(err));
    }, []);

    const handleNext = () => {
        if (containerRef.current) {
            const newPosition = scrollPosition + scrollAmount;
            containerRef.current.scrollTo({
                left: newPosition,
                behavior: 'smooth',
            });
            setScrollPosition(newPosition);
        }
    };

    const handlePrev = () => {
        if (containerRef.current) {
            const newPosition = Math.max(0, scrollPosition - scrollAmount);
            containerRef.current.scrollTo({
                left: newPosition,
                behavior: 'smooth',
            });
            setScrollPosition(newPosition);
        }
    };

    const isScrollable = events?.length * cardWidth > (containerRef.current?.offsetWidth || 0);

    return (
        <Stack rowGap={{ xs: 2, md: 3 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1}
            >
                <Typography variant="h5" fontWeight="bold" fontSize={{ xs: '1.25rem', md: '1.5rem' }}>
                    {t('otherEvents')}
                </Typography>
                <Stack direction="row" gap={1}>
                    <IconButton
                        onClick={handlePrev}
                        disabled={scrollPosition === 0}
                        size={isSmallScreen ? 'small' : 'medium'}
                    >
                        <ArrowBackIcon fontSize={isSmallScreen ? 'small' : 'medium'} />
                    </IconButton>
                    <IconButton
                        onClick={handleNext}
                        disabled={!isScrollable || (containerRef.current && scrollPosition >= containerRef.current.scrollWidth - containerRef.current.offsetWidth)}
                        size={isSmallScreen ? 'small' : 'medium'}
                    >
                        <ArrowForwardIcon fontSize={isSmallScreen ? 'small' : 'medium'} />
                    </IconButton>
                </Stack>
            </Stack>

            <div
                ref={containerRef}
                style={{
                    display: 'flex',
                    paddingTop: '1.25rem',
                    overflowX: 'auto',
                    columnGap: '.5rem',
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}
            >
                {events?.map((event, index) => (
                    <div
                        key={index}
                        style={{
                            width: `${cardWidth}px`,
                            marginRight: '10px',
                            flexShrink: 0,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <EventCard
                            event={event}
                            organizer={event.profileName}
                            id={event.profile_id}
                            sx={{ width: '100%', maxWidth: { xs: 400, sm: 'none' } }}
                        />
                    </div>
                ))}
            </div>
        </Stack>
    );
}
export default OtherEvents;