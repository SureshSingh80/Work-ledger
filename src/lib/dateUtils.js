/**
 * Returns the UTC start and end Date for an IST calendar day.
 *
 * Example:
 * Input: "2026-07-10"
 *
 * startDate = 2026-07-09T18:30:00.000Z
 * endDate   = 2026-07-10T18:30:00.000Z
 */
export function getISTDayRange(dateString) {
  let year, month, day;

  if (dateString) {
    [year, month, day] = dateString.split("-").map(Number);
  } else {
    const now = new Date();

    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
  }

  // 00:00 IST converted to UTC
  const startDate = new Date(
    Date.UTC(year, month - 1, day, -5, -30)
  );

  // Next day 00:00 IST converted to UTC
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);

  return {
    startDate,
    endDate,
  };
}

/**
 * Returns the UTC Date representing 00:00 IST.
 * Use this when storing attendance.
 *
 * Example:
 * Input: "2026-07-10"
 *
 * Returns:
 * 2026-07-09T18:30:00.000Z
 */
export function getISTStartDate(dateString) {
  return getISTDayRange(dateString).startDate;
}