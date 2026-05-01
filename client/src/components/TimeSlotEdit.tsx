import React from 'react';
import { Avatar, FormControlLabel, Checkbox } from '@mui/material';
import type { AvailabilityDraft } from '../types';
import TimeSelect from './TimeSelect';
import SelectWeekDays from './SelectWeekDays';

interface TimeSlotEditProps {
  edit: boolean
  slot: AvailabilityDraft
  userName: string
  currentDateString: string
  onChange: (slot: AvailabilityDraft) => void
}

export default function TimeSlotEdit({
  edit, 
  slot, 
  userName, 
  currentDateString, 
  onChange 
}: TimeSlotEditProps) {
  const update = (partial: Partial<AvailabilityDraft>) =>
    onChange({ ...slot, ...partial });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-nowrap gap-4">
        <Avatar>{userName[0]}</Avatar>
        <div>
          <div className="font-medium">{userName}</div>
          {edit
            ? <TimeSelect 
                start={`${currentDateString} ${slot.startTime}`}
                end={`${currentDateString} ${slot.endTime}`}
                onChange={({startTime, endTime}) => update({ startTime, endTime })}
              />
            : <div className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</div>
          }
        </div>
      </div>
      <div className="flex gap-2 items-end">
          <SelectWeekDays 
            daysOfWeek={slot.daysOfWeek || []} 
            disabled={!edit} 
            onChange={daysOfWeek => update({ daysOfWeek })}
          />
          <div className="text-sm text-gray-500 mb-0.5">or</div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 text-right">Current date</div>
            <FormControlLabel
              label={currentDateString}
              sx={{ margin: 0 }}
              disabled={!edit}
              control={
                <Checkbox
                  size="small"
                  sx={{ padding: '0 4px 0 0' }} 
                  checked={slot.selectedDate === currentDateString} 
                  onChange={e => update({ selectedDate: e.target.checked ? currentDateString : '' })}
                />
              }
            />
          </div>
      </div>
    </div>
  );
}
