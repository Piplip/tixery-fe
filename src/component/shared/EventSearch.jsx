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
import {Categories} from "../../common/Data.js";
import EventFetching from "./EventFetching.jsx";
import {useTranslation} from "react-i18next";

function EventSearch() {
    const location = useLocation()
    const navigate = useNavigate()
    const {t} = useTranslation()

    const dates = [
        { value: 'today', label: t('eventSearch.today') },
        { value: 'tomorrow', label: t('eventSearch.tomorrow') },
        { value: 'weekend', label: t('eventSearch.thisWeekend') },
        { value: 'week', label: t('eventSearch.thisWeek') },
        { value: 'next-week', label: t('eventSearch.nextWeek') },
        { value: 'month', label: t('eventSearch.thisMonth') },
        { value: 'next-month', label: t('eventSearch.nextMonth') }
    ];

    const [filters, setFilters] = useState({
        category: '',
        "sub_category": '',
        date: '',
        price: '',
        followed: false,
        online: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [viewMore, setViewMore] = useState({
        categories: false,
        date: false,
        language: false
    });

    useEffect(() => {
        setIsLoading(true)
        let isCancelled = false;
        const params = new URLSearchParams(location.search);
        const payload = Object.fromEntries(params.entries());
        eventAxios.post(`/search?${new URLSearchParams(payload)}`,
            filters.followed ? sessionStorage.getItem('followed-organizer') : null)
            .then(r => {
                if (!isCancelled) {
                    setTimeout(() => {
                        setIsLoading(false)
                        setEvents(r.data);
                    }, 500)
                }
            })
            .catch(err => console.log(err));

        return () => {
            isCancelled = true;
        };
    }, [location.search]);

    const handleCheckboxChange = (type) => {
        setFilters(prev => ({...prev, [type]: !prev[type]}));
        const searchParams = new URLSearchParams(location.search);
        searchParams.set(type, !filters[type]);
        navigate({ search: searchParams.toString().toLowerCase() });
    };

    const handleFilterChange = (type, value) => {
        setFilters(prev => {
            let newFilters = {...prev, [type]: value}

            const validFilters = Object.fromEntries(
                Object.entries(newFilters).filter(([key, val]) => (key === 'category' || key === 'sub_category' ? val.length > 0 : val !== null && val !== '' && val !== undefined))
            );

            const searchParams = new URLSearchParams(location.search);
            Object.entries(validFilters).forEach(([key, val]) => {
                searchParams.set(key, val);
            });

            navigate({ search: searchParams.toString().toLowerCase() });
            return newFilters;
        });
    };

    const clearFilter = (type) => {
        setFilters(prev => {
            const newFilters = {...prev};
            if(type === 'followed' || type === 'online') newFilters[type] = false;
            else if(type === 'category'){
                newFilters[type] = '';
                newFilters["sub_category"] = '';
            }
            else newFilters[type] = '';

            const validFilters = Object.fromEntries(
                Object.entries(newFilters).filter(([key, val]) => (key === 'categories' || key === 'subCategories' ? val.length > 0 : key !== 'online' && key !== 'followed' && val !== null && val !== '' && val !== undefined))
            );

            const searchParams = new URLSearchParams(location.search);
            searchParams.delete(type);

            Object.entries(validFilters).forEach(([key, val]) => {
                searchParams.set(key, val);
            });

            navigate({ search: searchParams.toString().toLowerCase() });
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setFilters({
            categories: '',
            subCategories: '',
            date: '',
            price: '',
            followed: false,
            online: false
        });

        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('categories');
        searchParams.delete('subCategories');
        searchParams.delete('date');
        searchParams.delete('price');
        searchParams.delete('followed');
        searchParams.delete('online');

        navigate({ search: searchParams.toString().toLowerCase() });
    };

    return (
        <Stack className={'event-search'} direction={'row'}>
            <Stack className={'event-search__filter'} rowGap={1}>
                <p>{t('eventSearch.filters')}</p>
                <AccordionGroup sx={{ maxWidth: 375, maxHeight: 'fit-content' }}>
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary>
                            {filters.category === '' ? t('eventSearch.category') : filters.category + t('eventSearch.categories')}
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack className={"event-search__options"}>
                                {filters.category === '' ? (
                                    Object.keys(Categories).slice(0, viewMore.categories ? undefined : 4).map((category, index) => (
                                        <FormControlLabel
                                            key={index}
                                            control={<Checkbox checked={filters.categories === category} onChange={() => handleFilterChange('category', category)} />}
                                            label={category}
                                        />
                                    ))
                                ) : (
                                    Categories[filters.category].slice(0, viewMore.categories ? undefined : 4).map((subCategory, index) => (
                                        <FormControlLabel
                                            key={index}
                                            control={<Checkbox checked={filters["sub_category"] === subCategory}
                                                               onChange={() => handleFilterChange('sub_category', subCategory)} />}
                                            label={subCategory}
                                        />
                                    ))
                                )}
                                <button className={'event-search-filter__view-more'} onClick={() => setViewMore(prev => ({ ...prev, categories: !viewMore.categories }))}>
                                    {t('eventSearch.view')} {viewMore.categories ? t('eventSearch.less') : t('eventSearch.more')}
                                </button>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary>{t('eventSearch.date')}</AccordionSummary>
                        <AccordionDetails>
                            <Stack className={"event-search__options"}>
                                <RadioGroup value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)}>
                                    {dates.map((date, index) => {
                                        if (index < 4)
                                            return <FormControlLabel value={date.value} control={<Radio />} label={date.label} key={index} />;
                                        else
                                            return viewMore.date && (<FormControlLabel value={date.value} control={<Radio />} label={date.label} key={index} />);
                                    })}
                                </RadioGroup>
                                <button className={'event-search-filter__view-more'}
                                        onClick={() => setViewMore(prev => ({ ...prev, date: !viewMore.date }))}
                                >{t('eventSearch.view')} {viewMore.date ? t('eventSearch.less') : t('eventSearch.more')}</button>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary>{t('eventSearch.price')}</AccordionSummary>
                        <AccordionDetails>
                            <RadioGroup value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)}>
                                <FormControlLabel value={"Paid"} control={<Radio />} label={t('eventSearch.paid')} />
                                <FormControlLabel value={"Free"} control={<Radio />} label={t('eventSearch.free')} />
                            </RadioGroup>
                        </AccordionDetails>
                    </Accordion>
                </AccordionGroup>
                <Stack>
                    <Stack direction={'row'} alignItems={'center'}>
                        <Checkbox checked={filters.followed} onChange={() => handleCheckboxChange('followed')} />
                        <p>{t('eventSearch.followedOrganizers')}</p>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'}>
                        <Checkbox checked={filters.online} onChange={() => handleCheckboxChange('online')} />
                        <p>{t('eventSearch.onlineEvents')}</p>
                    </Stack>
                </Stack>
            </Stack>
            <Stack className={'event-search__result'} rowGap={2}>
                <p className={'event-search-result__tittle'}>{t('eventSearch.searchResult')} ({events?.length})</p>
                {(filters.category.length > 0 || filters.date || filters.price || filters.language) && (
                    <Stack direction={'row'}>
                        <Stack direction={'row'} spacing={1} mb={2} alignItems={'center'} style={{ textTransform: 'capitalize' }}>
                            <Typography style={{ textTransform: 'none' }} variant={'body1'}>{t('eventSearch.filtersApplied')}</Typography>
                            {filters.category !== '' && <Chip label={filters.category} onDelete={() => clearFilter("category")} />}
                            {filters["sub_category"] !== '' && <Chip label={filters["sub_category"]} onDelete={() => clearFilter("sub_category")} />}
                            {filters.date && <Chip label={filters.date} onDelete={() => clearFilter('date')} />}
                            {filters.price && <Chip label={filters.price} onDelete={() => clearFilter('price')} />}
                            <button className={'clear-all-filter'} onClick={clearAllFilters}>{t('eventSearch.clearAll')}</button>
                        </Stack>
                    </Stack>
                )}
                {isLoading ?
                    <EventFetching rows={2} cols={3} />
                    :
                    <>
                        {events.length === 0 && <div className={'event-search__no-event'}>
                            {t('eventSearch.noMatches')}
                        </div>}
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{ width: '100%' }}>
                            {events.map((event, index) => (
                                <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
                                    <EventCard event={event} showAction={true} renderAddress={true} organizer={event.profileName} id={event.profile_id} />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                }
                <Stack marginBlock={5} rowGap={5} sx={{ width: '100%' }}>
                    <TrendingSearches />
                    <PopularEvents />
                </Stack>
            </Stack>
        </Stack>
    );
}

export default EventSearch