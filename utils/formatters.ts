/**
 * Formats a duration in minutes into a string like "Xh Ym" or "Ym".
 * @param totalMinutes - The total number of minutes.
 * @returns A formatted string representing the duration.
 */
export function formatMinutesToHoursMinutes(totalMinutes: number): string {
  if (totalMinutes < 0) return 'N/A'; // Or handle negative time appropriately
  if (totalMinutes === 0) return '0m';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60); // Round minutes

  let result = '';
  if (hours > 0) {
    result += `${hours}h`;
  }
  if (minutes > 0) {
    if (result.length > 0) result += ' '; // Add space if hours exist
    result += `${minutes}m`;
  }

  // Ensure something is returned even if rounding leads to 0m (e.g., 0.1 minutes)
  return result || '0m';
}
