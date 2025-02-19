import {useState} from "react";
import "../../styles/top-destination-styles.scss"
import {Box, IconButton, Stack} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import {useTranslation} from "react-i18next";

const destinations = [
    {
        name: 'Japan',
        image: 'https://d1n9ior3u0lhlo.cloudfront.net/ny--new-york.webp'
    },
    {
        name: 'South Korea',
        image: 'https://d1n9ior3u0lhlo.cloudfront.net/ca--los-angeles.webp'
    },
    {
        name: 'China',
        image: 'https://d1n9ior3u0lhlo.cloudfront.net/il--chicago.webp'
    },
    {
        name: 'United States',
        image: 'https://d1n9ior3u0lhlo.cloudfront.net/dc--washington.webp'
    },
    {
        name: 'Thailand',
        image: 'https://d1n9ior3u0lhlo.cloudfront.net/ga--atlanta.webp'
    },
    {
        name: 'Vietnam',
        image: 'https://d1n9ior3u0lhlo.cloudfront.net/tx--dallas.webp'
    }

];
const cityList = [
    'Tokyo', 'Seoul', 'Beijing', 'New York', 'Bangkok', 'Hanoi', 'Los Angeles', 'Shanghai', 'Chicago', 'Washington', 'Atlanta', 'Dallas',
    'Paris', 'London', 'Berlin', 'Rome', 'Barcelona', 'Madrid', 'Lisbon', 'Amsterdam', 'Vienna', 'Prague', 'Budapest', 'Moscow',
]

const visibleCards = 4;

function TopDestination(){
    const [currentIndex, setCurrentIndex] = useState(0);
    const maxIndex = Math.max(destinations.length - visibleCards, 0);
    const {t} = useTranslation()

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === maxIndex ? maxIndex : prev + 1));
    };

    return (
        <Box className="top-destinations">
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <p className={'top-destinations__title'}>
                    {t('topDestination.topDestinationsAroundWorld')}
                </p>
                <Stack direction={'row'} columnGap={2}>
                    <IconButton
                        className="top-destinations__arrow top-destinations__arrow--left"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <IconButton
                        className="top-destinations__arrow top-destinations__arrow--right"
                        onClick={handleNext}
                        disabled={currentIndex === maxIndex}
                    >
                        <ArrowForwardIcon />
                    </IconButton>
                </Stack>
            </Stack>
            <Box className="top-destinations__carousel">
                <Box
                    className="top-destinations__cards-container"
                    sx={{
                        transform: `translateX(-${currentIndex * (105 / visibleCards)}%)`
                    }}
                >
                    {destinations.map((dest, idx) => (
                        <Box key={idx} className="top-destinations__card">
                            <img
                                src={dest.image}
                                alt={t(`topDestination.${dest.nameKey}`)}
                                className="top-destinations__card-image"
                            />
                            <Box className="top-destinations__card-overlay">
                                <p className="top-destinations__card-title">
                                    {t(`topDestination.${dest.name}`)}
                                </p>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Stack marginTop={3}>
                <p className={'top-destinations__title'} style={{ textAlign: 'left' }}>
                    {t('topDestination.popularCities')}
                </p>
                <Stack gap={2} className={'top-city'} direction={'row'}>
                    {cityList.map((city, index) => {
                        return (
                            <div className={'top-city__item'} key={index}>
                                {t('topDestination.thingsToDoIn')} {city} <ArrowOutwardIcon />
                            </div>
                        )
                    })}
                </Stack>
            </Stack>
        </Box>
    );
}

export default TopDestination