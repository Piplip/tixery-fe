import {useLocation, useNavigate} from "react-router-dom";
import "../../styles/event-search-styles.css"
import EventCard from "./EventCard.jsx";
import {Checkbox, FormControlLabel, Stack, Typography} from "@mui/material";
import {Accordion, AccordionDetails, AccordionGroup, AccordionSummary} from "@mui/joy";
import RadioGroup from '@mui/material/RadioGroup';
import Chip from '@mui/material/Chip';
import {useEffect, useState} from "react";
import Radio from '@mui/material/Radio';
import TrendingSearches from "./TrendingSearches.jsx";
import Grid from "@mui/material/Grid2";
import PopularEvents from "./PopularEvents.jsx";
import {eventAxios} from "../../config/axiosConfig.js";

const categories = [
    'Music', 'Food & Drink', 'Business', 'Community', 'Arts', 'Film & Media', 'Health', 'Sports & Fitness', 'Science & Tech', 'Travel & Outdoor',
    'Charity & Causes', 'Spirituality', 'Family & Education', 'Seasonal & Holiday', 'Government', 'Fashion', 'Home & Lifestyle', 'Auto, Boat & Air',
    'Hobbies', 'School Activities', 'Other'
]
const dates = [
    {value: 'today', label: 'Today'}, {value: 'tomorrow', label: 'Tomorrow'}, {value: 'weekend', label: 'This Weekend'}, {value: 'week', label: 'This Week'},
    {value: 'next-week', label: 'Next Week'}, {value: 'month', label: 'This Month'}, {value: 'next-month', label: 'Next Month'}
];

function EventSearch() {
    const [events, setEvents] = useState([]);
    const location = useLocation()
    const navigate = useNavigate()

    const [viewMore, setViewMore] = useState({
        categories: false,
        date: false,
        language: false
    });

    const [filters, setFilters] = useState({
        categories: [],
        date: '',
        price: '',
        followed: false,
        online: false
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const payload = params.get('ref') === 'search' ?
            {eids: sessionStorage.getItem('search-ids')}
            :
            Object.fromEntries(params.entries());
        eventAxios.post(`/search?${new URLSearchParams(payload)}`,
            filters.followed ? sessionStorage.getItem('followed-organizer') : null)
            .then(r => {
                setEvents(r.data)
            })
            .catch(err => console.log(err))
    }, [filters, location.search]);

    const handleCheckboxChange = (type) => {
        setFilters(prev => ({...prev, [type]: !prev[type]}));
    };

    const handleFilterChange = (type, value) => {
        setFilters(prev => {
            let newFilters;
            if (type === 'categories') {
                const newCategories = prev.categories.includes(value) ? prev.categories.filter(cat => cat !== value) : [...prev.categories, value];
                newFilters = {...prev, categories: newCategories};
            } else {
                newFilters = {...prev, [type]: value};
            }

            const validFilters = Object.fromEntries(
                Object.entries(newFilters).filter(([key, val]) => (key === 'categories' ? val.length > 0 : val !== null && val !== '' && val !== undefined))
            );

            const searchParams = new URLSearchParams(location.search);
            searchParams.delete("ref")
            Object.entries(validFilters).forEach(([key, val]) => {
                if (key === 'categories') {
                    searchParams.delete(key);
                    val.forEach(category => searchParams.append(key, category));
                } else {
                    searchParams.set(key, val);
                }
            });

            navigate({ search: searchParams.toString().toLowerCase() });
            return newFilters;
        });
    };

    const clearFilter = (type) => {
        setFilters(prev => {
            const newFilters = {...prev};
            if (type === 'categories') {
                newFilters.categories = [];
            } else {
                delete newFilters[type];
            }

            const validFilters = Object.fromEntries(
                Object.entries(newFilters).filter(([key, val]) => (key === 'categories' ? val.length > 0 : key !== 'online' && key !== 'followed' && val !== null && val !== '' && val !== undefined))
            );

            const searchParams = new URLSearchParams(location.search);
            if (type === 'categories') {
                searchParams.delete(type);
            } else {
                searchParams.delete(type);
            }

            Object.entries(validFilters).forEach(([key, val]) => {
                if (key === 'categories') {
                    val.forEach(category => searchParams.append(key, category));
                } else {
                    searchParams.set(key, val);
                }
            });

            navigate({ search: searchParams.toString().toLowerCase() });
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setFilters({
            categories: [],
            date: '',
            price: '',
            followed: false,
            online: false
        });

        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('categories');
        searchParams.delete('date');
        searchParams.delete('price');
        searchParams.delete('followed');
        searchParams.delete('online');

        navigate({ search: searchParams.toString().toLowerCase() });
    };

    return (
        <Stack className={'event-search'} direction={'row'}>
            <Stack className={'event-search__filter'} rowGap={1}>
                <p>FILTERS</p>
                <AccordionGroup sx={{ maxWidth: 375, maxHeight: 'fit-content' }}>
                    <Accordion defaultExpanded={true}>
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
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary>Date</AccordionSummary>
                        <AccordionDetails>
                            <Stack className={"event-search__options"}>
                                <RadioGroup value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)}>
                                    {dates.map((date, index) => {
                                        if(index < 4)
                                            return <FormControlLabel value={date.value} control={<Radio />} label={date.label} key={index}/>
                                        else
                                            return viewMore.date && (<FormControlLabel value={date.value} control={<Radio />} label={date.label} key={index}/>)
                                    })}
                                </RadioGroup>
                                <button className={'event-search-filter__view-more'}
                                        onClick={() => setViewMore(prev => ({...prev, date: !viewMore.date}))}
                                >View {viewMore.date ? 'less' : 'more'}</button>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary>Price</AccordionSummary>
                        <AccordionDetails>
                            <RadioGroup value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)}>
                                <FormControlLabel value={"Paid"} control={<Radio />} label={"Paid"}/>
                                <FormControlLabel value={"Free"} control={<Radio />} label={"Free"}/>
                            </RadioGroup>
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
                <p className={'event-search-result__tittle'}>Search result ({events?.length})</p>
                {(filters.categories.length > 0 || filters.date || filters.price || filters.language) && (
                    <Stack direction={'row'}>
                        <Stack direction={'row'} spacing={1} mb={2} alignItems={'center'} style={{textTransform: 'capitalize'}}>
                            <Typography style={{textTransform: 'none'}} variant={'body1'}>Filters applied</Typography>
                            {filters.categories.map((category, index) => (
                                <Chip key={index} label={category} onDelete={() => handleFilterChange('categories', category)} />
                            ))}
                            {filters.date && <Chip label={filters.date} onDelete={() => clearFilter('date')} />}
                            {filters.price && <Chip label={filters.price} onDelete={() => clearFilter('price')} />}
                            <button className={'clear-all-filter'} onClick={clearAllFilters}>Clear all</button>
                        </Stack>
                    </Stack>
                )}
                {events.length === 0 && <div className={'event-search__no-event'}>
                    Nothing matched your search
                </div>}
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{width: '100%'}}>
                    {events.map((event, index) => (
                        <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
                            <EventCard event={event} showAction={true} renderAddress={true} organizer={event.profileName} id={event.profile_id}/>
                        </Grid>
                    ))}
                </Grid>
                <Stack marginBlock={5} rowGap={5} sx={{width: '100%'}}>
                    <TrendingSearches />
                    <PopularEvents />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default EventSearch