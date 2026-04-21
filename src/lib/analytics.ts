export interface FocusSessionRecord {
  created_at: string;
  duration: number | null;
  completed?: boolean | null;
}

export interface GoalRecord {
  created_at: string;
  completed: boolean;
  target_minutes?: number | null;
}

export interface WeeklyFocusPoint {
  day: string;
  dateKey: string;
  minutes: number;
  goal: number;
  count: number;
}

export interface UserAnalyticsSummary {
  totalMinutes: number;
  todayMinutes: number;
  totalSessions: number;
  completedGoals: number;
  totalGoals: number;
  goalCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  averageDailyMinutes: number;
  averageSessionLength: number;
  weekOverWeekChange: number;
  dailyGoalMinutes: number;
  weeklyData: WeeklyFocusPoint[];
  bestDay: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const toDateKey = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const local = startOfDay(date);
  const year = local.getFullYear();
  const month = `${local.getMonth() + 1}`.padStart(2, "0");
  const day = `${local.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getRecentDates = (days: number) => {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    return date;
  });
};

const countStreaks = (dayKeys: string[]) => {
  if (dayKeys.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sorted = [...new Set(dayKeys)].sort();
  let longestStreak = 1;
  let activeRun = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const previous = new Date(sorted[i - 1]).getTime();
    const current = new Date(sorted[i]).getTime();

    if ((current - previous) / DAY_MS === 1) {
      activeRun += 1;
      longestStreak = Math.max(longestStreak, activeRun);
    } else {
      activeRun = 1;
    }
  }

  const daySet = new Set(sorted);
  let currentStreak = 0;
  const cursor = startOfDay(new Date());

  while (daySet.has(toDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak, longestStreak };
};

export const formatMinutes = (minutes: number) => {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const createEmptyUserAnalytics = (dailyGoalMinutes = 240): UserAnalyticsSummary => ({
  totalMinutes: 0,
  todayMinutes: 0,
  totalSessions: 0,
  completedGoals: 0,
  totalGoals: 0,
  goalCompletionRate: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageDailyMinutes: 0,
  averageSessionLength: 0,
  weekOverWeekChange: 0,
  dailyGoalMinutes,
  weeklyData: getRecentDates(7).map((date) => ({
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    dateKey: toDateKey(date),
    minutes: 0,
    goal: dailyGoalMinutes,
    count: 0,
  })),
  bestDay: "No activity yet",
});

export const aggregateUserAnalytics = (
  sessions: FocusSessionRecord[],
  goals: GoalRecord[],
  dailyGoalMinutes = 240,
): UserAnalyticsSummary => {
  const empty = createEmptyUserAnalytics(dailyGoalMinutes);
  const weeklyData = empty.weeklyData.map((point) => ({ ...point }));
  const weeklyLookup = new Map(weeklyData.map((point) => [point.dateKey, point]));
  const todayKey = toDateKey(new Date());

  let totalMinutes = 0;
  let totalSessions = 0;
  let todayMinutes = 0;
  const sessionDayKeys: string[] = [];

  sessions.forEach((session) => {
    const minutes = Math.max(0, session.duration ?? 0);
    const dateKey = toDateKey(session.created_at);

    totalMinutes += minutes;
    totalSessions += 1;
    sessionDayKeys.push(dateKey);

    if (dateKey === todayKey) todayMinutes += minutes;

    const bucket = weeklyLookup.get(dateKey);
    if (bucket) {
      bucket.minutes += minutes;
      bucket.count += 1;
    }
  });

  const previousWeekKeys = new Set(getRecentDates(14).slice(0, 7).map(toDateKey));
  const currentWeekKeys = new Set(weeklyData.map((point) => point.dateKey));
  let previousWeekMinutes = 0;
  let currentWeekMinutes = 0;

  sessions.forEach((session) => {
    const minutes = Math.max(0, session.duration ?? 0);
    const dateKey = toDateKey(session.created_at);

    if (previousWeekKeys.has(dateKey)) previousWeekMinutes += minutes;
    if (currentWeekKeys.has(dateKey)) currentWeekMinutes += minutes;
  });

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const totalGoals = goals.length;
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const { currentStreak, longestStreak } = countStreaks(sessionDayKeys);
  const averageDailyMinutes = Math.round(currentWeekMinutes / 7);
  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const weekOverWeekChange = previousWeekMinutes > 0
    ? Math.round(((currentWeekMinutes - previousWeekMinutes) / previousWeekMinutes) * 100)
    : currentWeekMinutes > 0
      ? 100
      : 0;
  const bestDayEntry = [...weeklyData].sort((a, b) => b.minutes - a.minutes)[0];

  return {
    totalMinutes,
    todayMinutes,
    totalSessions,
    completedGoals,
    totalGoals,
    goalCompletionRate,
    currentStreak,
    longestStreak,
    averageDailyMinutes,
    averageSessionLength,
    weekOverWeekChange,
    dailyGoalMinutes,
    weeklyData,
    bestDay: bestDayEntry?.minutes ? bestDayEntry.day : empty.bestDay,
  };
};