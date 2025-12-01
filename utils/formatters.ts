/**
 * Formats a duration in minutes into a string like "Xh Ym" or "Ym".
 * @param totalMinutes - The total number of minutes.
 * @returns A formatted string representing the duration.
 */
export function formatMinutesToHoursMinutes(totalMinutes: number): string {
  if (totalMinutes < 0) return 'N/A';
  if (totalMinutes === 0) return '0m';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  let result = '';
  if (hours > 0) {
    result += `${hours}h`;
  }
  if (minutes > 0) {
    if (result.length > 0) result += ' ';
    result += `${minutes}m`;
  }

  // Ensure something is returned even if rounding leads to 0m (e.g., 0.1 minutes)
  return result || '0m';
}

/**
 * Formats a duration in minutes into a string like "Xd Yh Zm", "Yh Zm", or "Zm".
 * @param totalMinutes - The total number of minutes.
 * @returns A formatted string representing the duration.
 */
export function formatMinutesToDaysHoursMinutes(totalMinutes: number): string {
  if (totalMinutes < 0) return 'N/A';
  if (totalMinutes === 0) return '0m';

  const days = Math.floor(totalMinutes / (60 * 24));
  const remainingMinutesAfterDays = totalMinutes % (60 * 24);
  const hours = Math.floor(remainingMinutesAfterDays / 60);
  const minutes = Math.round(remainingMinutesAfterDays % 60);

  let result = '';
  if (days > 0) {
    result += `${days}d`;
  }
  if (hours > 0) {
    if (result.length > 0) result += ' ';
    result += `${hours}h`;
  }
  if (minutes > 0) {
    if (result.length > 0) result += ' ';
    result += `${minutes}m`;
  }

  // Ensure something is returned even if rounding leads to 0m (e.g., 0.1 minutes)
  return result || '0m';
}

/**
 * Formats a duration in minutes into an object with hours and minutes.
 * @param totalMinutes - The total number of minutes.
 * @returns An object containing the actual value, hours, and minutes.
 */
export function formatMinutesToHoursMinutesObject(totalMinutes: number): {
  actualValue: number;
  hours: number;
  minutes: number;
} {
  if (totalMinutes < 0) {
    return {
      actualValue: totalMinutes,
      hours: 0,
      minutes: 0,
    };
  }

  return {
    actualValue: totalMinutes,
    hours: Math.floor(totalMinutes / 60),
    minutes: Math.round(totalMinutes % 60),
  };
}

/**
 * Formats a duration in minutes into an object with days, hours, and minutes.
 * @param totalMinutes - The total number of minutes.
 * @returns An object containing the actual value, days, hours, and minutes.
 */
export function formatMinutesToDaysHoursMinutesObject(totalMinutes: number): {
  actualValue: number;
  days: number;
  hours: number;
  minutes: number;
} {
  if (totalMinutes < 0) {
    return {
      actualValue: totalMinutes,
      days: 0,
      hours: 0,
      minutes: 0,
    };
  }

  const days = Math.floor(totalMinutes / (60 * 24));
  const remainingMinutesAfterDays = totalMinutes % (60 * 24);
  const hours = Math.floor(remainingMinutesAfterDays / 60);
  const minutes = Math.round(remainingMinutesAfterDays % 60);

  return {
    actualValue: totalMinutes,
    days,
    hours,
    minutes,
  };
}

export function formatToOneDecimal(num: number) {
    return (parseFloat(num.toFixed(1)));
}
