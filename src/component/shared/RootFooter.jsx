import "../../styles/root-footer-styles.css"
import Grid from "@mui/material/Grid2";
import {Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";

function RootFooter(){
    const {t} = useTranslation()

    const useTixeryLinks = [
        'footer.useTixery.createEvents',
        'footer.useTixery.pricing',
        'footer.useTixery.eventMarketingPlatform',
        'footer.useTixery.tixeryMobileApp',
        'footer.useTixery.tixeryCheckInApp',
        'footer.useTixery.tixeryAppMarketplace',
        'footer.useTixery.eventRegistrationSoftware',
        'footer.useTixery.communityGuidelines',
        'footer.useTixery.faqs',
        'footer.useTixery.sitemap'
    ];

    const planEventsLinks = [
        'footer.planEvents.sellTicketsOnline',
        'footer.planEvents.eventPlanning',
        'footer.planEvents.sellConcertTickets',
        'footer.planEvents.eventPaymentSystem',
        'footer.planEvents.solutionsForProfessionals',
        'footer.planEvents.eventManagementSoftware',
        'footer.planEvents.halloweenPartyPlanning',
        'footer.planEvents.virtualEventsPlatform',
        'footer.planEvents.qrCodesForCheckIn',
        'footer.planEvents.postYourEventOnline'
    ];

    const findEventsLinks = [
        'footer.findEvents.newOrleansFoodDrink',
        'footer.findEvents.sanFranciscoHoliday',
        'footer.findEvents.tulumMusic',
        'footer.findEvents.denverHobby',
        'footer.findEvents.atlantaPopMusic',
        'footer.findEvents.newYorkEvents',
        'footer.findEvents.chicagoEvents',
        'footer.findEvents.dallasEventsToday',
        'footer.findEvents.losAngelesEvents',
        'footer.findEvents.washingtonEvents'
    ];

    const connectWithUsLinks = [
        'footer.connectWithUs.contactSupport',
        'footer.connectWithUs.contactSales',
        'footer.connectWithUs.x',
        'footer.connectWithUs.facebook',
        'footer.connectWithUs.linkedIn',
        'footer.connectWithUs.instagram',
        'footer.connectWithUs.tiktok'
    ];

    const bottomLinks = [
        'footer.bottom.about',
        'footer.bottom.blog',
        'footer.bottom.help',
        'footer.bottom.careers',
        'footer.bottom.press',
        'footer.bottom.impact',
        'footer.bottom.investors',
        'footer.bottom.security',
        'footer.bottom.developers',
        'footer.bottom.status',
        'footer.bottom.terms',
        'footer.bottom.privacy',
        'footer.bottom.accessibility',
        'footer.bottom.cookies',
        'footer.bottom.manageCookiePreferences'
    ];

    return (
        <footer className="footer">
            <div className="footer__container">
                <Grid container columns={{ xs: 16 }}>
                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            {t('footer.useTixeryTitle')}
                        </Typography>
                        <ul className="footer__list">
                            {useTixeryLinks.map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            {t('footer.planEventsTitle')}
                        </Typography>
                        <ul className="footer__list">
                            {planEventsLinks.map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            {t('footer.findEventsTitle')}
                        </Typography>
                        <ul className="footer__list">
                            {findEventsLinks.map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            {t('footer.connectWithUsTitle')}
                        </Typography>
                        <ul className="footer__list">
                            {connectWithUsLinks.map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>
                </Grid>

                <div className="footer__bottom">
                    <Typography variant="body2" className="footer__copyright">
                        © 2025 Tixery
                    </Typography>
                    <div className="footer__links">
                        {bottomLinks.map((item) => (
                            <Link key={item} to="#" className="footer__bottom-link">
                                {t(item)}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default RootFooter;