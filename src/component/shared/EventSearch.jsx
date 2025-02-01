import {useLoaderData} from "react-router-dom";
import "../../styles/event-search-styles.css"
import EventCard from "./EventCard.jsx";
import {Checkbox, FormControlLabel, Stack, Typography} from "@mui/material";
import {Accordion, AccordionDetails, AccordionGroup, AccordionSummary} from "@mui/joy";
import RadioGroup from '@mui/material/RadioGroup';
import Chip from '@mui/material/Chip';
import {useState} from "react";
import Radio from '@mui/material/Radio';
import dayjs from "dayjs";
import TrendingSearches from "./TrendingSearches.jsx";
import Grid from "@mui/material/Grid2";
import PopularEvents from "./PopularEvents.jsx";

const categories = [
    'Music', 'Food & Drink', 'Business', 'Community', 'Arts', 'Film & Media', 'Health', 'Sports & Fitness', 'Science & Tech', 'Travel & Outdoor', 'Charity & Causes', 'Spirituality', 'Family & Education', 'Seasonal & Holiday', 'Government', 'Fashion', 'Home & Lifestyle', 'Auto, Boat & Air', 'Hobbies', 'School Activities', 'Other'
]
const dates = ['Today', 'Tomorrow', 'This weekend', 'Pick a date', 'This week', 'Next week', 'This month', 'Next month'];
const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi', 'Bengali', 'Urdu', 'Turkish', 'Vietnamese', 'Thai', 'Swedish', 'Dutch', 'Polish', 'Indonesian', 'Filipino', 'Greek', 'Hebrew', 'Persian', 'Malay', 'Romanian', 'Hungarian', 'Czech', 'Swahili', 'Finnish', 'Danish', 'Norwegian', 'Slovak', 'Bulgarian', 'Croatian', 'Lithuanian', 'Slovenian', 'Latvian', 'Estonian', 'Maltese', 'Icelandic', 'Albanian', 'Macedonian', 'Serbian', 'Ukrainian', 'Belarusian', 'Georgian', 'Armenian', 'Azerbaijani', 'Kazakh', 'Uzbek', 'Turkmen', 'Kyrgyz'];

function EventSearch() {
    const data = useLoaderData();

    const [viewMore, setViewMore] = useState({
        categories: false,
        date: false,
        language: false
    });

    const [filters, setFilters] = useState({
        categories: [],
        date: '',
        price: '',
        language: '',
        followed: false,
        online: false
    });

    const handleFilterChange = (type, value) => {
        setFilters(prev => {
            if (type === 'categories') {
                const newCategories = prev.categories.includes(value) ? prev.categories.filter(cat => cat !== value) : [...prev.categories, value];
                return {...prev, categories: newCategories};
            } else {
                return {...prev, [type]: value};
            }
        });
    };

    const handleCheckboxChange = (type) => {
        setFilters(prev => ({...prev, [type]: !prev[type]}));
    };

    const clearFilter = (type) => {
        setFilters(prev => {
            if (type === 'categories') {
                return {...prev, categories: []};
            } else {
                return {...prev, [type]: ''};
            }
        });
    };

    const clearAllFilters = () => {
        setFilters({
            categories: [],
            date: '',
            price: '',
            language: '',
            followed: false,
            online: false
        });
    };

    const filteredData = data.filter(event => {
        const categoryMatch = filters.categories.length === 0 || filters.categories.includes(event.event_type);
        const dateMatch = !filters.date || (() => {
            const eventDate = dayjs(event.start_time);
            switch (filters.date) {
                case 'Today':
                    return eventDate.isSame(dayjs(), 'day');
                case 'Tomorrow':
                    return eventDate.isSame(dayjs().add(1, 'day'), 'day');
                case 'This weekend':
                    return eventDate.isSame(dayjs().day(6), 'day') || eventDate.isSame(dayjs().day(7), 'day');
                case 'This week':
                    return eventDate.isSame(dayjs(), 'week');
                case 'Next week':
                    return eventDate.isSame(dayjs().add(1, 'week'), 'week');
                case 'This month':
                    return eventDate.isSame(dayjs(), 'month');
                case 'Next month':
                    return eventDate.isSame(dayjs().add(1, 'month'), 'month');
                default:
                    return false;
            }
        })();
        const priceMatch = !filters.price || (filters.price === 'Free' ? filters.price === event.price : event.price !== 'Free');
        const languageMatch = !filters.language || event.language === filters.language;
        const followedOrganizersMatch = !filters.followed || event.followed;
        const onlineEventsMatch = !filters.online || event.online;

        return categoryMatch && dateMatch && priceMatch && languageMatch && followedOrganizersMatch && onlineEventsMatch;
    });

    window.scrollTo(0, 0);

    return (
        <Stack className={'event-search'} direction={'row'}>
            <Stack className={'event-search__filter'} rowGap={1}>
                <p>FILTERS</p>
                <AccordionGroup sx={{ maxWidth: 375, maxHeight: 'fit-content' }}>
                    <Accordion>
                        <AccordionSummary>Category</AccordionSummary>
                        <AccordionDetails>
                            <Stack className={"event-search__options"}>
                                {categories.map((category, index) => {
                                    if(index < 4)
                                        return <FormControlLabel key={index} control={<Checkbox checked={filters.categories.includes(category)} onChange={() => handleFilterChange('categories', category)} />} label={category} />
                                    else
                                        return viewMore.categories && (<FormControlLabel key={index} control={<Checkbox checked={filters.categories.includes(category)} onChange={() => handleFilterChange('categories', category)} />} label={category} />)
                                })}
                                <button className={'event-search-filter__view-more'}
                                        onClick={() => setViewMore(prev => ({...prev, categories: !viewMore.categories}))}
                                >View {viewMore.categories ? 'less' : 'more'}</button>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>Date</AccordionSummary>
                        <AccordionDetails>
                            <Stack className={"event-search__options"}>
                                <RadioGroup value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)}>
                                    {dates.map((date, index) => {
                                        if(index < 4)
                                            return <FormControlLabel value={date} control={<Radio />} label={date} key={index}/>
                                        else
                                            return viewMore.date && (<FormControlLabel value={date} control={<Radio />} label={date} key={index}/>)
                                    })}
                                </RadioGroup>
                                <button className={'event-search-filter__view-more'}
                                        onClick={() => setViewMore(prev => ({...prev, date: !viewMore.date}))}
                                >View {viewMore.date ? 'less' : 'more'}</button>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>Price</AccordionSummary>
                        <AccordionDetails>
                            <RadioGroup value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)}>
                                <FormControlLabel value={"Paid"} control={<Radio />} label={"Paid"}/>
                                <FormControlLabel value={"Free"} control={<Radio />} label={"Free"}/>
                            </RadioGroup>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>Language</AccordionSummary>
                        <AccordionDetails>
                            <Stack className={"event-search__options"}>
                                {languages.map((language, index) => {
                                    if(index < 4)
                                        return <FormControlLabel key={index} control={<Checkbox checked={filters.language === language} onChange={() => handleFilterChange('language', language)} />} label={language} />
                                    else
                                        return viewMore.language && (<FormControlLabel key={index} control={<Checkbox checked={filters.language === language} onChange={() => handleFilterChange('language', language)} />} label={language} />)
                                })}
                                <button className={'event-search-filter__view-more'}
                                        onClick={() => setViewMore(prev => ({...prev, language: !viewMore.language}))}
                                >
                                    View {viewMore.language ? 'less' : 'more'}
                                </button>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </AccordionGroup>
                <Stack>
                    <Stack direction={'row'} alignItems={'center'}>
                        <Checkbox checked={filters.followedOrganizers} onChange={() => handleCheckboxChange('followed')} />
                        <p>Only show events from organizers I follow</p>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'}>
                        <Checkbox checked={filters.onlineEvents} onChange={() => handleCheckboxChange('online')} />
                        <p>Search for online events</p>
                    </Stack>
                </Stack>
            </Stack>
            <Stack className={'event-search__result'} rowGap={2}>
                <p className={'event-search-result__tittle'}>Search result ({filteredData?.length})</p>
                {(filters.categories.length > 0 || filters.date || filters.price || filters.language) && (
                    <Stack direction={'row'}>
                        <Stack direction={'row'} spacing={1} mb={2} alignItems={'center'}>
                            <Typography variant={'body1'}>Filters applied</Typography>
                            {filters.categories.map((category, index) => (
                                <Chip key={index} label={category} onDelete={() => handleFilterChange('categories', category)} />
                            ))}
                            {filters.date && <Chip label={filters.date} onDelete={() => clearFilter('date')} />}
                            {filters.price && <Chip label={filters.price} onDelete={() => clearFilter('price')} />}
                            {filters.language && <Chip label={filters.language} onDelete={() => clearFilter('language')} />}
                            <button className={'clear-all-filter'} onClick={clearAllFilters}>Clear all</button>
                        </Stack>
                    </Stack>
                )}
                {filteredData.length === 0 && <div className={'event-search__no-event'}>
                    Nothing matched your search
                </div>}
                <Grid container columns={{xs: 12}} spacing={4} rowGap={3}>
                    {filteredData.map((event, index) => (
                        <Grid key={index} item size={4}>
                            <EventCard  event={event} />
                        </Grid>
                    ))}
                </Grid>
                <TrendingSearches />
                <PopularEvents />
            </Stack>
        </Stack>
    )
}

export default EventSearch