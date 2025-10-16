
import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

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
  daysOfWeek: Array<number>;
  disabled: boolean;
  onChange: (days: Array<number>) => void;
}

interface CheckWeekDaysItemProps { 
  name: string;
  selected: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

const SelectWeekDaysItem = ({name, selected, disabled, onChange}: CheckWeekDaysItemProps) => {
  return (
    <FormControlLabel
      label={name}
      labelPlacement="top"
      sx={{ margin: 0 }}
      disabled={disabled}
      control={
        <Checkbox
          size="small"
          sx={{ padding: '2px 0'}} 
          checked={selected}
          onChange={e => onChange(e.target.checked)}
        />
      }
    />
  );
};

export default function SelectWeekDays({ daysOfWeek, disabled, onChange }: CheckWeekDaysProps) {
  const [selectedDays, setSelectedDays] = useState(daysOfWeek);

  useEffect(() => {
    onChange(selectedDays);
  }, [selectedDays])

  return (
    <div className="flex flex-row gap-1.5">
      {week.map(day => 
        <div key={day.id}>
          <SelectWeekDaysItem 
            name={day.name} 
            selected={selectedDays.includes(day.id)}
            disabled={disabled}
            onChange={(checked) => {
              if (checked) {
                setSelectedDays(prevState => 
                  Array.from(new Set([...prevState, day.id]))
                );
              } else {
                setSelectedDays(prevState => 
                  prevState.filter(item => item !== day.id)
                );
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
