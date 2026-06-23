'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const WEND_LAUNCH = new Date('2026-06-09');
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ArchivePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completions, setCompletions] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('wend-completions') || '{}');
      setCompletions(data);
    } catch (e) {}
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isDateAvailable = (day) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date >= WEND_LAUNCH && date <= today;
  };

  const formatDateStr = (day) => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
  };

  const isToday = (day) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  const isCompleted = (day) => {
    const dateStr = formatDateStr(day);
    return Object.keys(completions).some(k => k.includes(dateStr));
  };

  return (
    <div className="container section">
      <div className="section-header">
        <h1>Puzzle Archive</h1>
        <p>Browse and replay every past daily Wend puzzle. Pick a date to play.</p>
      </div>

      <div className="archive-calendar">
        <div className="calendar-nav">
          <button className="btn btn-ghost" onClick={prevMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h3>{monthName}</h3>
          <button className="btn btn-ghost" onClick={nextMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <div className="calendar-grid">
          {DAY_NAMES.map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}

          {/* Empty cells for days before the first */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-day calendar-day--empty" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const available = isDateAvailable(day);
            const dateStr = formatDateStr(day);

            if (!available) {
              return (
                <div key={day} className="calendar-day calendar-day--disabled">{day}</div>
              );
            }

            return (
              <Link
                key={day}
                href={`/daily/${dateStr}`}
                className={`calendar-day ${isToday(day) ? 'calendar-day--today' : ''} ${isCompleted(day) ? 'calendar-day--completed' : ''}`}
              >
                {day}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Daily puzzles available from June 9, 2026 (Wend launch date) to today.
        </p>
      </div>
    </div>
  );
}
