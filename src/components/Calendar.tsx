
import { DayCell } from './DayCell';
import { MonthNav } from './MonthNav';
import { DaysMap } from '../types';

interface Props {
  year: number;
  month: number;
  days: DaysMap;
  today: string;
  onToggle: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function pad(n: number) { return String(n).padStart(2, '0'); }

export function Calendar({ year, month, days, today, onToggle, onPrevMonth, onNextMonth }: Props) {
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <MonthNav year={year} month={month} onPrev={onPrevMonth} onNext={onNextMonth} />

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '5px' }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-faint)',
            fontWeight: 600,
            padding: '3px 0',
            letterSpacing: '0.04em',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
          return (
            <DayCell
              key={dateStr}
              day={day}
              dateStr={dateStr}
              status={days[dateStr]}
              isToday={dateStr === today}
              isFuture={dateStr > today}
              onClick={onToggle}
            />
          );
        })}
      </div>
    </div>
  );
}
