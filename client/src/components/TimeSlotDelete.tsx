import { useState } from 'react';
import { deleteAvailability } from '../services/apiService';
import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { handleApiAction } from '../services/errorService';
import { removeAvailability, useAppDispatch } from '../store';
import { useUser } from '../contexts/UserContext';

interface TimeSlotDeleteProps {
  slotId: number
  managerId: number
  onDelete: () => void
}

export default function TimeSlotDelete({ slotId, managerId, onDelete }: TimeSlotDeleteProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const { setUser } = useUser();
  
  const handleDelete = async () => {
    const result = await handleApiAction(
      () =>  deleteAvailability(slotId, managerId),
      {
        successMessage: 'Slot deleted',
        errorMessage: 'Failed to delete slot',
        logLabel: 'Delete slot failed',
      },
    );

    if (result.ok) {
      dispatch(removeAvailability(slotId));
    }
  }
  
  return (<>
    <button type="button" 
      className="px-3 py-1 w-20 bg-red-600 text-white rounded" 
      onClick={() => setOpen(true)}
    >
      Delete
    </button>
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Delete slot</DialogTitle>
      <DialogContent>
        <DialogContentText>Do you really want to delete the slot?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleDelete} autoFocus>Delete</Button>
      </DialogActions>
    </Dialog>
  </>);
}
