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
import {useTranslation} from "react-i18next";
import {predefinedPerks} from "../../common/Data.js";

TierPerksModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    tier: PropTypes.object,
    onSave: PropTypes.func.isRequired
}

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
                                {perks.map((perkKey, index) => (
                                    <Chip
                                        key={index}
                                        label={t(`predefinedPerks.${perkKey}`)}
                                        onDelete={() => handleRemovePerk(perkKey)}
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

                {Object.entries(predefinedPerks).map(([categoryKey, categoryPerks]) => {
                    const category = t(`predefinedPerks.${categoryKey}`);
                    return (
                        <Box key={categoryKey} mb={2}>
                            <Typography variant="subtitle2" gutterBottom>{category}</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {categoryPerks.map((perkKey, index) => {
                                    const perk = t(`predefinedPerks.${perkKey}`);
                                    return (
                                        <Chip
                                            key={index}
                                            label={perk}
                                            onClick={() => handleAddPerk(perkKey)}
                                            variant={perks.includes(perkKey) ? "filled" : "outlined"}
                                            color={perks.includes(perkKey) ? "primary" : "default"}
                                            sx={{ margin: '4px' }}
                                        />
                                    );
                                })}
                            </Stack>
                        </Box>
                    );
                })}
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