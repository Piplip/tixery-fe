import {
    Box,
    Button,
    Chip,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    Dialog, TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useEffect, useState} from "react";
import PropTypes from "prop-types";

TierPerksModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    tier: PropTypes.object,
    onSave: PropTypes.func.isRequired
}

const predefinedPerks = {
    'Access': [
        'Priority entry',
        'Early access (30 min)',
        'VIP entrance',
        'Backstage access'
    ],
    'Seating': [
        'Premium view',
        'Reserved seating',
        'Front row position',
        'Extra legroom'
    ],
    'Food & Drink': [
        'Free drinks',
        'Complimentary food',
        'Dedicated bar access',
        'Welcome cocktail'
    ],
    'Merchandise': [
        'Event poster',
        'Commemorative t-shirt',
        'Artist signed item',
        'Event program'
    ],
    'Experience': [
        'Meet & greet',
        'Photo opportunity',
        'Sound check access',
        'Exclusive content'
    ]
};

function TierPerksModal({ open, onClose, tier, onSave }) {
    const [perks, setPerks] = useState(tier?.perks || []);
    const {t} = useTranslation()

    useEffect(() => {
        if (tier && tier.perks) {
            setPerks(Array.isArray(tier.perks) ? [...tier.perks] : []);
        } else {
            setPerks([]);
        }
    }, [tier])

    const handleAddPerk = (perk) => {
        if (!perks.includes(perk)) {
            setPerks([...perks, perk]);
        }
    };

    const handleRemovePerk = (perk) => {
        setPerks(perks.filter(p => p !== perk));
    };

    const [customPerk, setCustomPerk] = useState('');

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6" component="div">
                    {t('tierPerksModal.managePerks')} {tier?.name}
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Box mb={2}>
                    <Typography variant="subtitle1" gutterBottom>
                        {t('tierPerksModal.selectedPerks')}
                    </Typography>
                    <Box
                        sx={{
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            minHeight: '100px',
                            bgcolor: '#f5f5f5'
                        }}
                    >
                        {perks.length > 0 ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {perks.map((perk, index) => (
                                    <Chip
                                        key={index}
                                        label={perk}
                                        onDelete={() => handleRemovePerk(perk)}
                                        color="primary"
                                        sx={{ margin: '4px' }}
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                                {t('tierPerksModal.noPerksSelected')}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box mb={2}>
                    <Typography variant="subtitle1" gutterBottom>
                        {t('tierPerksModal.addCustomPerk')}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder={t('tierPerksModal.enterCustomPerk')}
                            value={customPerk}
                            onChange={(e) => setCustomPerk(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            disabled={!customPerk.trim()}
                            onClick={() => {
                                if (customPerk.trim()) {
                                    handleAddPerk(customPerk.trim());
                                    setCustomPerk('');
                                }
                            }}
                        >
                            {t('tierPerksModal.add')}
                        </Button>
                    </Stack>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                    {t('tierPerksModal.commonPerks')}
                </Typography>

                {Object.entries(predefinedPerks).map(([category, categoryPerks]) => (
                    <Box key={category} mb={2}>
                        <Typography variant="subtitle2" gutterBottom>{category}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {categoryPerks.map((perk, index) => (
                                <Chip
                                    key={index}
                                    label={perk}
                                    onClick={() => handleAddPerk(perk)}
                                    variant={perks.includes(perk) ? "filled" : "outlined"}
                                    color={perks.includes(perk) ? "primary" : "default"}
                                    sx={{ margin: '4px' }}
                                />
                            ))}
                        </Stack>
                    </Box>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('tierPerksModal.cancel')}</Button>
                <Button
                    variant="contained"
                    onClick={() => onSave(perks)}
                >
                    {t('tierPerksModal.savePerks')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TierPerksModal