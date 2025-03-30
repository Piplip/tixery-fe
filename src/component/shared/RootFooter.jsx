import "../../styles/root-footer-styles.css"
import {Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";

function RootFooter(){
    const {t} = useTranslation()

    const bottomLinks = [
        'footer.bottom.about',
        'footer.bottom.blog',
        'footer.bottom.help',
        'footer.bottom.impact',
        'footer.bottom.investors',
        'footer.bottom.security',
        'footer.bottom.developers',
        'footer.bottom.status',
        'footer.bottom.terms',
        'footer.bottom.privacy',
        'footer.bottom.manageCookiePreferences'
    ];

    return (
        <footer className="footer">
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
        </footer>
    );
}

export default RootFooter;