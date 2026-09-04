"use client";

import { AdminSegmented } from "@/components/admin/admin-segmented";
import { RANGES, type RangeDays } from "@/lib/admin/insights";

/**
 * Which window every figure on the page is counting. One control for the
 * whole screen rather than one per panel: the point of a report is that the
 * tiles, the chart and the tables are all describing the same period.
 */
export function AdminRangeTabs({
  value,
  onChange,
}: {
  value: RangeDays;
  onChange: (days: RangeDays) => void;
}) {
  return (
    <AdminSegmented
      label="Period"
      value={value}
      onChange={(days) => onChange(days as RangeDays)}
      options={RANGES.map(({ days, short }) => ({ value: days, label: short }))}
    />
  );
}
