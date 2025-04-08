import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';

export default function Copyright(props: any) {
    const { t } = useTranslation();
    return (
        <Typography
            variant="body2"
            align="center"
            {...props}
            sx={[
                {
                    color: 'text.secondary',
                },
                ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
            ]}
        >
            {t('copyright.text', { year: new Date().getFullYear() })}
        </Typography>
    );
}