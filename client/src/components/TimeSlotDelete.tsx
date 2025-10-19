import React from 'react';
import { deleteAvailability } from '../api';
import toast from 'react-hot-toast';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface TimeSlotDeleteProps {
  slotId: number | undefined;
  onDelete: () => void;
}

export default function TimeSlotDelete({ slotId, onDelete }: TimeSlotDeleteProps) {
  const [open, setOpen] = React.useState(false);
  
  const handleDelete = () => {
    if (slotId) {
      deleteAvailability(slotId).then(() => {
        toast.success('Deleted'); 
        setOpen(false)
        onDelete(); 
      }).catch((e) => {
        toast.error(`Failed delete: ${e.response.data.error}`); 
      });
    }
  }
  
  return (<>
    <button className="px-3 py-1 w-20 bg-red-600 text-white rounded" onClick={() => setOpen(true)}>
      Delete
    </button>
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Slot deletion.
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you really want to delete the slot?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={() => handleDelete()} autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </>);
}
