import "../../styles/root-footer-styles.css"
import Grid from "@mui/material/Grid2";
import {Typography} from "@mui/material";
import {Link} from "react-router-dom";

function RootFooter(){
    return (
        <footer className="footer">
            <div className="footer__container">
                <Grid container columns={{xs: 16}}>
                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            Use Tixery
                        </Typography>
                        <ul className="footer__list">
                            {[
                                "Create Events",
                                "Pricing",
                                "Event Marketing Platform",
                                "Tixery Mobile Ticket App",
                                "Tixery Check-In App",
                                "Tixery App Marketplace",
                                "Event Registration Software",
                                "Community Guidelines",
                                "FAQs",
                                "Sitemap",
                            ].map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            Plan Events
                        </Typography>
                        <ul className="footer__list">
                            {[
                                "Sell Tickets Online",
                                "Event Planning",
                                "Sell Concert Tickets Online",
                                "Event Payment System",
                                "Solutions for Professional Services",
                                "Event Management Software",
                                "Halloween Party Planning",
                                "Virtual Events Platform",
                                "QR Codes for Event Check-In",
                                "Post your event online",
                            ].map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            Find Events
                        </Typography>
                        <ul className="footer__list">
                            {[
                                "New Orleans Food & Drink Events",
                                "San Francisco Holiday Events",
                                "Tulum Music Events",
                                "Denver Hobby Events",
                                "Atlanta Pop Music Events",
                                "New York Events",
                                "Chicago Events",
                                "Events in Dallas Today",
                                "Los Angeles Events",
                                "Washington Events",
                            ].map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    <Grid size={4} className="footer__column">
                        <Typography variant="h6" className="footer__title">
                            Connect With Us
                        </Typography>
                        <ul className="footer__list">
                            {[
                                "Contact Support",
                                "Contact Sales",
                                "X",
                                "Facebook",
                                "LinkedIn",
                                "Instagram",
                                "TikTok",
                            ].map((item) => (
                                <li key={item} className="footer__list-item">
                                    <Link to="#" className="footer__link">
                                        {item}
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
                        {[
                            "About",
                            "Blog",
                            "Help",
                            "Careers",
                            "Press",
                            "Impact",
                            "Investors",
                            "Security",
                            "Developers",
                            "Status",
                            "Terms",
                            "Privacy",
                            "Accessibility",
                            "Cookies",
                            "Manage Cookie Preferences",
                        ].map((item) => (
                            <Link key={item} to="#" className="footer__bottom-link">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default RootFooter;