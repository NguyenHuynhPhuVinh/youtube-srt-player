/**
 * Parses SRT string into an array of subtitle objects.
 * @param {string} data - The raw SRT string.
 * @returns {Array} - Array of { id, startTime, endTime, text }
 */
export const parseSRT = (data) => {
  if (!data) return [];

  // Chuẩn hóa dòng mới
  data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const regex =
    /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n([\s\S]*?)(?=\n\n|\n*$)/g;
  const items = [];
  let match;

  while ((match = regex.exec(data)) !== null) {
    items.push({
      id: match[1],
      startTime: timeToSeconds(match[2]),
      endTime: timeToSeconds(match[3]),
      text: match[4].trim(),
    });
  }

  return items;
};

/**
 * Converts SRT timestamp (00:00:00,000) to seconds.
 */
const timeToSeconds = (timeString) => {
  const parts = timeString.split(":");
  const secondsParts = parts[2].split(",");

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1], 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};
