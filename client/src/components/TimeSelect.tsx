import React, {useEffect, useState} from "react";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { getTime } from "../utils/time";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

interface TimeSelectProps {
  start: string, 
  end: string,
  onChange: ({startTime, endTime}: {startTime: string, endTime: string}) => void
}

const style: any = { 
  textField: { 
    sx: { 
      width: '120px',
      '& .MuiInputAdornment-positionEnd': { margin: 0 },
      '& .MuiPickersOutlinedInput-root': { padding: '0 10px' }
    }, 
    size: 'small' 
  } 
}

export default function TimeSelect({start, end, onChange}: TimeSelectProps) {
  const [startValue, setStartValue] = useState<Dayjs | null>(dayjs(start, "DD/MM/YYYY HH:mm"));
  const [endValue, setEndValue] = useState<Dayjs | null>(dayjs(end, "DD/MM/YYYY HH:mm"));

  useEffect(() => {
    const startTime = startValue ? getTime(startValue) : start;
    const endTime = endValue ? getTime(endValue) : end;
    onChange({ startTime, endTime });
  }, [startValue, endValue]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <TimePicker
        label="Start"
        slotProps={style}
        value={startValue}
        onChange={(newValue) => setStartValue(newValue)}
      />
      <TimePicker
        label="End"
        slotProps={style}
        value={endValue}
        onChange={(newValue) => setEndValue(newValue)}
      />
    </div>
  );
}
