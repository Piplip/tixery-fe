import * as React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { Languages } from '../../../common/Data.js';

export default function LanguageSelector() {
    const { t, i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('locale', lang);
        handleClose();
    };

    return (
        <>
            <Button
                id="language-button"
                aria-controls={open ? 'language-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ textTransform: 'none' }}
            >
                {t(`lang.${i18n.resolvedLanguage}`)}
            </Button>
            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'language-button',
                }}
            >
                {Languages.map((lang) => (
                    <MenuItem
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        selected={i18n.resolvedLanguage === lang}
                    >
                        {t(`lang.${lang}`)}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}