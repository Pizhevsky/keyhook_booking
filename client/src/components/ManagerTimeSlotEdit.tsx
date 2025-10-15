import React, { useEffect, useState } from 'react';
import { Avatar, FormControlLabel, Checkbox } from '@mui/material';
import { Availability } from '../types';
import TimeSelect from './TimeSelect';
import CheckWeekDays from './CheckWeekDays';

interface ManagerTimeSlotEdit {
  edit: boolean;
  slot: Partial<Availability>; 
  userName: string;
  currentDateString: string;
  onChange: (slot: Partial<Availability>) => void;
}

export default function ManagerTimeSlotEdit({ edit, slot, userName, currentDateString, onChange }: ManagerTimeSlotEdit){
  const [newSlot, setNewSlot] = useState(slot);

  useEffect(() => {
    setNewSlot(slot);
  }, [slot]);

  useEffect(() => {
    onChange(newSlot);
  }, [newSlot]);

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex flex-nowrap gap-4">
        <Avatar>{userName[0]}</Avatar>
        <div>
          <div className="font-medium">{userName}</div>
          {edit
            ? <TimeSelect 
                start={`${currentDateString} ${newSlot.startTime}`}
                end={`${currentDateString} ${newSlot.endTime}`}
                onChange={({startTime, endTime}) => {
                  setNewSlot(prev => ({
                    ...prev,
                    startTime, 
                    endTime
                  }))
                }}
              />
            : <div className="text-sm text-gray-500">{newSlot.startTime} - {newSlot.endTime}</div>
          }
        </div>
      </div>
      <div className="flex flex-col gap-2 ml-2">
          <CheckWeekDays 
            daysOfWeek={slot.daysOfWeek || []} 
            disabled={!edit} 
            onChange={daysOfWeek => {
              setNewSlot(prev => ({
                ...prev,
                daysOfWeek
              }))
            }}
          />
          <FormControlLabel
            label={currentDateString}
            sx={{ margin: 0 }}
            disabled={!edit}
            control={
              <Checkbox
                size="small"
                sx={{ padding: '0 4px 0 0' }} 
                checked={newSlot.selectedDate === currentDateString} 
                onChange={(e) => {
                  setNewSlot(prev => ({
                    ...prev,
                    selectedDate: e.target.checked ? currentDateString : ''
                  }));
                }}
              />
            }
          />
      </div>
    </div>
  );
}
