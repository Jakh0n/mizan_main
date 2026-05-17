import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date: string | Date, format = 'MMM D, YYYY'): string =>
  dayjs(date).format(format);

export const formatDateTime = (date: string | Date): string =>
  dayjs(date).format('MMM D, YYYY HH:mm');

export const formatRelative = (date: string | Date): string => dayjs(date).fromNow();
