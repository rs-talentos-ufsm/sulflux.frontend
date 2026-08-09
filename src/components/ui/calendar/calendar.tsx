import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import styles from './Calendar.module.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={[styles.calendar, className].filter(Boolean).join(' ')}
      classNames={{
        months: styles.months,
        month: styles.month,
        month_caption: styles.caption,
        caption_label: styles.captionLabel,
        nav: styles.nav,
        button_previous: [styles.navButton, styles.navButtonPrevious].join(' '),
        button_next: [styles.navButton, styles.navButtonNext].join(' '),
        month_grid: styles.table,
        weekdays: styles.headRow,
        weekday: styles.headCell,
        week: styles.row,
        day: styles.cell,
        day_button: styles.day,
        range_end: 'day-range-end',
        selected: styles.daySelected,
        today: styles.dayToday,
        outside: [styles.dayOutside, 'day-outside'].join(' '),
        disabled: styles.dayDisabled,
        range_middle: styles.dayRangeMiddle,
        hidden: styles.dayHidden,
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className={styles.icon} />;
          }
          return <ChevronRight className={styles.icon} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';
