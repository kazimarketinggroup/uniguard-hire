/**
 * BS 7858 5-Year Vetting Timeline & Activity History Validator
 * 
 * Rules:
 * 1. Dynamic Window: Calculated dynamically from referenceDate (default: new Date()).
 *    Requires 60 continuous months (5 years) backwards from the present date.
 * 2. Recency: The most recent activity must reach "Present" or within 31 days of today.
 * 3. Start Threshold: Earliest activity must reach back to at least 5 years ago.
 * 4. Continuity: Gaps between activities > 31 days must be declared as a 'gap' activity.
 */

export interface VettingActivity {
  id?: string | number;
  type?: string;
  title?: string;
  from?: string;
  to?: string;
  evidence?: string;
  file?: any;
  evidencePath?: string;
  mobile?: string;
  email?: string;
}

export interface VettingWindow {
  referenceDate: Date;
  startDate: Date;
  endDate: Date;
  startFormatted: string;
  endFormatted: string;
  windowLabel: string;
}

export interface VettingValidationResult {
  isValid: boolean;
  error?: string;
  earliestDate?: Date;
  latestDate?: Date;
  reachesPresent: boolean;
  coversFiveYears: boolean;
  totalCoveredMonths: number;
  unexplainedGaps: Array<{ from: string; to: string; days: number; months: number }>;
  summaryText: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatMonthYear(date: Date): string {
  if (!date || isNaN(date.getTime())) return 'N/A';
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function parseVettingDate(dateStr?: string, isEnd = false): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  if (clean.toLowerCase() === 'present') {
    return new Date();
  }
  const parts = clean.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
      if (parts[2]) {
        const day = parseInt(parts[2], 10);
        if (!isNaN(day)) return new Date(year, month, day);
      }
      // If no day provided: start of month for start, end of month for end
      const day = isEnd ? new Date(year, month + 1, 0).getDate() : 1;
      return new Date(year, month, day);
    }
  }
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

export function getFiveYearVettingWindow(referenceDate: Date = new Date()): VettingWindow {
  const endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const startDate = new Date(referenceDate.getFullYear() - 5, referenceDate.getMonth(), referenceDate.getDate());
  
  return {
    referenceDate,
    startDate,
    endDate,
    startFormatted: formatMonthYear(startDate),
    endFormatted: formatMonthYear(endDate),
    windowLabel: `${formatMonthYear(startDate)} → Present (${formatMonthYear(endDate)})`
  };
}

export function isShortPermittedGap(a: VettingActivity): boolean {
  if (a.type !== 'gap') return false;
  if (!a.from || !a.to) return false;
  const from = parseVettingDate(a.from, false);
  const to = parseVettingDate(a.to, true);
  if (!from || !to || to < from) return false;
  const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  const diffMonths = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return diffDays <= 35 || (diffMonths <= 1 && diffDays <= 45);
}

export function validateFiveYearHistory(
  activities: VettingActivity[],
  referenceDate: Date = new Date()
): VettingValidationResult {
  const window = getFiveYearVettingWindow(referenceDate);

  // Filter started activities
  const started = (activities || []).filter(a => a.title || a.from || a.to || a.evidence || a.file);
  if (started.length === 0) {
    return {
      isValid: false,
      error: 'Add at least one activity — please provide your 5-year history details, dates, and evidence.',
      reachesPresent: false,
      coversFiveYears: false,
      totalCoveredMonths: 0,
      unexplainedGaps: [],
      summaryText: `Required timeline: ${window.windowLabel}`
    };
  }

  // Verify basic completeness of each entry
  for (let i = 0; i < started.length; i++) {
    const a = started[i];
    const num = i + 1;
    if (!a.from || !a.to) {
      return {
        isValid: false,
        error: `Activity #${num} is missing From or To date. Please specify both dates.`,
        reachesPresent: false,
        coversFiveYears: false,
        totalCoveredMonths: 0,
        unexplainedGaps: [],
        summaryText: `Activity #${num} incomplete`
      };
    }
    if (!a.title && a.type !== 'gap') {
      return {
        isValid: false,
        error: `Activity #${num} is missing Employer, School, or Course details.`,
        reachesPresent: false,
        coversFiveYears: false,
        totalCoveredMonths: 0,
        unexplainedGaps: [],
        summaryText: `Activity #${num} missing details`
      };
    }
  }

  // Parse date ranges
  interface ParsedInterval {
    start: Date;
    end: Date;
    isOngoing: boolean;
    type?: string;
    title?: string;
  }

  const intervals: ParsedInterval[] = [];
  for (const a of started) {
    const start = parseVettingDate(a.from, false);
    const isOngoing = (a.to || '').trim().toLowerCase() === 'present';
    const end = parseVettingDate(a.to, true);
    if (!start || !end) {
      return {
        isValid: false,
        error: `One of your entries has an invalid date format. Please select valid dates.`,
        reachesPresent: false,
        coversFiveYears: false,
        totalCoveredMonths: 0,
        unexplainedGaps: [],
        summaryText: 'Invalid date format'
      };
    }
    if (end < start) {
      return {
        isValid: false,
        error: `The end date cannot be earlier than the start date for "${a.title || 'your activity'}".`,
        reachesPresent: false,
        coversFiveYears: false,
        totalCoveredMonths: 0,
        unexplainedGaps: [],
        summaryText: 'End date before start date'
      };
    }
    intervals.push({ start, end, isOngoing, type: a.type, title: a.title });
  }

  // Check 1: Recency / End Date
  // Has 'Present' or max end date within 35 days of referenceDate
  const hasPresent = intervals.some(i => i.isOngoing);
  const maxEndTimestamp = Math.max(...intervals.map(i => i.end.getTime()));
  const latestDate = new Date(maxEndTimestamp);

  const daysSinceLatest = (window.endDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
  const reachesPresent = hasPresent || daysSinceLatest <= 35;

  if (!reachesPresent) {
    return {
      isValid: false,
      error: `Your 5-year history must be current up to Present (${window.endFormatted}). Your latest entry ends in ${formatMonthYear(latestDate)}. Please add your current role or declare a career break up to Present.`,
      earliestDate: new Date(Math.min(...intervals.map(i => i.start.getTime()))),
      latestDate,
      reachesPresent: false,
      coversFiveYears: false,
      totalCoveredMonths: 0,
      unexplainedGaps: [],
      summaryText: `Ends in ${formatMonthYear(latestDate)} (Missing up to Present)`
    };
  }

  // Check 2: Start Date (must cover back to 5 years ago)
  const minStartTimestamp = Math.min(...intervals.map(i => i.start.getTime()));
  const earliestDate = new Date(minStartTimestamp);

  // Allow up to 35 days grace at the start boundary
  const daysAfterWindowStart = (earliestDate.getTime() - window.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const coversFiveYears = daysAfterWindowStart <= 35;

  if (!coversFiveYears) {
    const coveredMonths = Math.max(1, Math.round(((window.endDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) / 30.4));
    return {
      isValid: false,
      error: `Your 5-year history must start on or before ${window.startFormatted}. Your earliest activity starts in ${formatMonthYear(earliestDate)} (covering only ${(coveredMonths / 12).toFixed(1)} of the required 5 years). Please add earlier activities or career breaks to reach ${window.startFormatted}.`,
      earliestDate,
      latestDate,
      reachesPresent,
      coversFiveYears: false,
      totalCoveredMonths: coveredMonths,
      unexplainedGaps: [],
      summaryText: `Starts in ${formatMonthYear(earliestDate)} (Requires ${window.startFormatted})`
    };
  }

  // Check 3: Check continuity & unexplained gaps between intervals
  // Sort by start date ascending
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Merge overlapping or adjacent intervals to find real timeline gaps
  const merged: Array<{ start: Date; end: Date }> = [];
  for (const interval of sorted) {
    if (merged.length === 0) {
      merged.push({ start: interval.start, end: interval.end });
    } else {
      const prev = merged[merged.length - 1];
      if (interval.start.getTime() <= prev.end.getTime() + (35 * 86400000)) {
        // Overlapping or within 35 days permitted transition: extend previous
        if (interval.end.getTime() > prev.end.getTime()) {
          prev.end = interval.end;
        }
      } else {
        merged.push({ start: interval.start, end: interval.end });
      }
    }
  }

  const unexplainedGaps: Array<{ from: string; to: string; days: number; months: number }> = [];
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = merged[i].end;
    const gapEnd = merged[i + 1].start;
    const diffDays = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 35) {
      const gapMonths = Math.max(1, Math.round(diffDays / 30.4));
      unexplainedGaps.push({
        from: formatMonthYear(gapStart),
        to: formatMonthYear(gapEnd),
        days: Math.round(diffDays),
        months: gapMonths
      });
    }
  }

  if (unexplainedGaps.length > 0) {
    const firstGap = unexplainedGaps[0];
    return {
      isValid: false,
      error: `Unexplained gap of ~${firstGap.months} month(s) detected between ${firstGap.from} and ${firstGap.to}. Under BS 7858 standards, all breaks over 31 days must be declared (add an activity with type "Career Break / Gap").`,
      earliestDate,
      latestDate,
      reachesPresent,
      coversFiveYears: true,
      totalCoveredMonths: 0,
      unexplainedGaps,
      summaryText: `Gap between ${firstGap.from} and ${firstGap.to}`
    };
  }

  // Check 4: Calculate total effective continuous coverage
  let totalEffectiveDays = 0;
  for (const range of merged) {
    const clampedStart = range.start < window.startDate ? window.startDate : range.start;
    const clampedEnd = range.end > window.endDate ? window.endDate : range.end;
    if (clampedEnd > clampedStart) {
      totalEffectiveDays += (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24);
    }
  }

  const totalCoveredMonths = Math.round(totalEffectiveDays / 30.4);
  if (totalCoveredMonths < 58) {
    return {
      isValid: false,
      error: `Your entries currently cover ${(totalCoveredMonths / 12).toFixed(1)} of the required 5 years (${window.startFormatted} → ${window.endFormatted}). Please add more activities or career breaks to complete the 5-year timeline.`,
      earliestDate,
      latestDate,
      reachesPresent,
      coversFiveYears: false,
      totalCoveredMonths,
      unexplainedGaps: [],
      summaryText: `Covers ${(totalCoveredMonths / 12).toFixed(1)} / 5.0 years`
    };
  }

  return {
    isValid: true,
    earliestDate,
    latestDate,
    reachesPresent: true,
    coversFiveYears: true,
    totalCoveredMonths,
    unexplainedGaps: [],
    summaryText: `Complete 5-Year History (${formatMonthYear(earliestDate)} → Present)`
  };
}
