
import { Checkbox, FormControlLabel } from '@mui/material';
import { useCallback } from 'react';

const week = [
  { id: 1, name: 'M'},
  { id: 2, name: 'T'},
  { id: 3, name: 'W'},
  { id: 4, name: 'T'},
  { id: 5, name: 'F'},
  { id: 6, name: 'S'},
  { id: 7, name: 'S'},
];

interface CheckWeekDaysProps { 
  daysOfWeek: Array<number>
  disabled: boolean
  onChange: (days: Array<number>) => void
}

export default function SelectWeekDays({ daysOfWeek, disabled, onChange }: CheckWeekDaysProps) {
  
  const toggle = useCallback((id: number, checked: boolean) => {
    const next = checked
      ? [...new Set([...daysOfWeek, id])]
      : daysOfWeek.filter(d => d !== id);
    onChange(next);
  }, [daysOfWeek, onChange]);

  return (
    <div className="flex flex-row gap-1.5">
      {week.map(day => (
        <FormControlLabel
          key={day.id}
          label={day.name}
          labelPlacement="top"
          sx={{ margin: 0 }}
          disabled={disabled}
          control={
            <Checkbox
              size="small"
              sx={{ padding: '2px 0'}} 
              checked={daysOfWeek.includes(day.id)}
              onChange={e => toggle(day.id, e.target.checked)}
            />
          }
        />
      ))}
    </div>
  );
}
