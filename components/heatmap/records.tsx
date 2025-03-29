// Import modules separately to reduce bundle size
// TODO: replace by dayjs
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import getMonth from "date-fns/getMonth";
import isAfter from "date-fns/isAfter";
import isSameYear from "date-fns/isSameYear";
import parseISO from "date-fns/parseISO";
import setDay from "date-fns/setDay";
import subYears from "date-fns/subYears";
import { ptBR } from "date-fns/locale";
import { DATE_FORMAT } from "./constants";

export interface DayInfo {
  count: number;
  intensity: number;
}

interface Record {
  date: string;
  count: number;
}

interface YearEntry {
  year: number;
  total: number;
}

interface HeatmapData {
  years: YearEntry[];
  records: Record[];
}

export interface GraphDataOptions {
  years: number[];
  data: HeatmapData;
  fullYear: boolean;
  locale: string;
}

interface MonthLabel {
  x: number;
  label: string;
}

interface Day {
  date: string;
  info?: DayInfo;
}

export interface GraphData {
  year: number;
  blocks: Day[][];
  monthLabels: MonthLabel[];
  totalCount: number;
}

function getRecordsForDate(data: HeatmapData, date: string): DayInfo | undefined {
  return data.records.find((record) => record.date === date) as unknown as DayInfo;
}

function getRecordCountForLastYear(data: HeatmapData): number {
  const { records } = data;
  const now = new Date();
  // Start date for accumulating the values
  const begin = records.findIndex(
    (record) => record.date === format(now, DATE_FORMAT)
  );
  // No data for today given
  if (begin === -1) {
    return 0;
  }
  // Check if there is data for the day one year past
  let end = records.findIndex((record) => {
    return record.date === format(subYears(now, 1), DATE_FORMAT);
  });
  // Take the oldest record otherwise, if not enough data exists
  if (end === -1) {
    end = records.length - 1;
  }
  return records.slice(begin, end).reduce((acc, cur) => acc + cur.count, 0);
}

function getRecordCountForYear(data: HeatmapData, year: number): number {
  const yearEntry = data.years.find((entry) => entry.year === year);
  return yearEntry ? yearEntry.total : 0;
}

function getBlocksForYear(year: number, data: HeatmapData, fullYear: boolean): Day[][] {
  const now = new Date();
  const firstDate = fullYear ? subYears(now, 1) : parseISO(`${year}-01-01`);
  const lastDate = fullYear ? now : parseISO(`${year}-12-31`);
  let weekStart = firstDate;
  // The week starts on Sunday - add days to get to next sunday if neccessary
  if (getDay(firstDate) !== 0) {
    weekStart = addDays(firstDate, getDay(firstDate));
  }
  // Fetch graph data for first row (Sundays)
  const firstRowDates: Day[] = [];
  while (weekStart <= lastDate) {
    const date = format(weekStart, DATE_FORMAT);
    firstRowDates.push({
      date,
      info: getRecordsForDate(data, date),
    });
    weekStart = setDay(weekStart, 7);
  }
  // Add the remainig days per week (column for column)
  return firstRowDates.map((dateObj) => {
    const dates: Day[] = [];
    for (let i = 0; i <= 6; i += 1) {
      const date = format(setDay(parseISO(dateObj.date), i), DATE_FORMAT);
      if (isAfter(parseISO(date), lastDate)) {
        break;
      }
      dates.push({
        date,
        info: getRecordsForDate(data, date),
      });
    }
    return dates;
  });
}

export const locales: Record<string, Locale> = {
  ptBR,
};

function getMonthLabels(blocks: Day[][], fullYear: boolean, locale: string): MonthLabel[] {
  const weeks = blocks.slice(0, fullYear ? blocks.length - 1 : blocks.length);
  let previousMonth = 0; // January
  return weeks.reduce<MonthLabel[]>((labels, week, x) => {
    const firstWeekDay = parseISO(week[0].date);
    const month = getMonth(firstWeekDay) + 1;
    const monthChanged = month !== previousMonth;
    const firstMonthIsDecember = x === 0 && month === 12;
    if (monthChanged && !firstMonthIsDecember) {
      labels.push({
        x,
        label: format(firstWeekDay, "MMM", { locale: locales[locale] }),
      });
      previousMonth = month;
    }
    return labels;
  }, []);
}

function getGraphDataForYear(year: number, data: HeatmapData, fullYear: boolean, locale: string): GraphData {
  const blocks = getBlocksForYear(year, data, fullYear);
  const monthLabels = getMonthLabels(blocks, fullYear, locale);
  const totalCount = fullYear
    ? getRecordCountForLastYear(data)
    : getRecordCountForYear(data, year);
  return {
    year,
    blocks,
    monthLabels,
    totalCount,
  };
}

export function getGraphData(options: GraphDataOptions): GraphData[] {
  const { fullYear, years, data, locale } = options;
  if (!data?.years) {
    throw Error("No data available");
  }
  return years.map((year) => {
    const isCurrentYear = isSameYear(parseISO(String(year)), new Date());
    return getGraphDataForYear(year, data, isCurrentYear && fullYear, locale);
  });
}