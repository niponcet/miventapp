'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';
import styles from '@/app/(admin)/dashboard/dashboard.module.css';

interface DatePickerProps {
  initialDate: string;
}

export function DatePicker({ initialDate }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('date', newDate);
      router.push(`/dashboard?${params.toString()}`);
    }
  };

  return (
    <div className={styles.datepicker}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      <input
        type="date"
        value={initialDate}
        onChange={handleChange}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          outline: 'none',
          cursor: 'pointer',
          colorScheme: 'dark',
        }}
      />
    </div>
  );
}
