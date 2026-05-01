import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs, { type Dayjs } from '../lib/dayjs';
import { DATETIME_FORMAT, getTime } from '../utils/time';
import { showErrorToast } from '../services/errorService';

interface TimeSelectProps {
  start: string 
  end: string
  onChange: (times: {startTime: string, endTime: string}) => void
}

const slotProps = { 
  textField: { 
    sx: { 
      width: '120px',
      '& .MuiInputAdornment-positionEnd': { margin: 0 },
      '& .MuiPickersOutlinedInput-root': { padding: '0 10px' }
    }, 
    size: 'small' as const 
  } 
}

export default function TimeSelect({start, end, onChange}: TimeSelectProps) {
  const [startValue, setStartValue] = useState<Dayjs>(dayjs(start, DATETIME_FORMAT));
  const [endValue, setEndValue] = useState<Dayjs>(dayjs(end, DATETIME_FORMAT));

  const handleStartChange = (newValue: Dayjs | null) => {
    if (!newValue?.isValid()) return;

    if (!newValue.isBefore(endValue)) {
      showErrorToast('Start time must be before end time');
      return;
    }

    const startTime = getTime(newValue);
    const endTime = endValue ? getTime(endValue) : end;

    setStartValue(newValue);
    onChange({ startTime, endTime });
  };

  const handleEndChange = (newValue: Dayjs | null) => {
    if (!newValue?.isValid()) return;

    if (!startValue?.isBefore(newValue)) {
      showErrorToast('End time must be after start time');
      return;
    }

    const startTime = startValue ? getTime(startValue) : start;
    const endTime = getTime(newValue);

    setEndValue(newValue);
    onChange({ startTime, endTime });
  };

  return (
    <div className="flex flex-row gap-1 items-center mt-2 -ml-3">
      <TimePicker
        label="Start"
        slotProps={slotProps}
        value={startValue}
        onChange={handleStartChange}
      />
      -
      <TimePicker
        label="End"
        slotProps={slotProps}
        value={endValue}
        onChange={handleEndChange}
      />
    </div>
  );
}
