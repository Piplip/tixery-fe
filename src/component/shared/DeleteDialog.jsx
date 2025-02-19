import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

DeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
}

function DeleteDialog({ open, onClose, handleDelete }) {
    const {t} = useTranslation()

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle id="alert-dialog-title">
                {t('deleteDialog.title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {t('deleteDialog.confirmation')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('deleteDialog.cancel')}</Button>
                <Button onClick={handleDelete} variant="contained" color="error" endIcon={<DeleteIcon />}>
                    {t('deleteDialog.delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteDialog