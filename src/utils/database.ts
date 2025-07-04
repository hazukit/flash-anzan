import { get, set, keys, del } from 'idb-keyval';
import type { User, GameSession, DifficultySettings, WeeklyRanking, DailyBestScore } from '../types';

const USERS_PREFIX = 'user_';
const SESSIONS_PREFIX = 'session_';
const DAILY_BEST_PREFIX = 'daily_best_';

export const createUser = async (name: string): Promise<User> => {
  const id = crypto.randomUUID();
  const defaultSettings: DifficultySettings = {
    operations: ['addition'],
    maxDigits: 2,
    playTime: 2
  };
  
  const user: User = {
    id,
    name,
    settings: defaultSettings,
    createdAt: Date.now()
  };
  
  await set(`${USERS_PREFIX}${id}`, user);
  return user;
};

export const getUsers = async (): Promise<User[]> => {
  const allKeys = await keys();
  const userKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith(USERS_PREFIX));
  const users = await Promise.all(
    userKeys.map(key => get(key))
  );
  return users.filter(Boolean);
};

export const updateUserSettings = async (userId: string, settings: DifficultySettings): Promise<void> => {
  const user = await get(`${USERS_PREFIX}${userId}`);
  if (user) {
    user.settings = settings;
    await set(`${USERS_PREFIX}${userId}`, user);
  }
};

export const saveGameSession = async (session: GameSession): Promise<void> => {
  await set(`${SESSIONS_PREFIX}${session.id}`, session);
  
  // Update daily best score
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dailyBestKey = `${DAILY_BEST_PREFIX}${session.userId}_${today}`;
  
  const existingDailyBest = await get(dailyBestKey);
  
  if (!existingDailyBest || session.correctAnswers > existingDailyBest.bestScore) {
    const dailyBest: DailyBestScore = {
      userId: session.userId,
      date: today,
      bestScore: session.correctAnswers,
      sessionId: session.id
    };
    await set(dailyBestKey, dailyBest);
  }
};

export const getWeeklyRanking = async (): Promise<WeeklyRanking[]> => {
  // Check if it's Monday and clear data if needed
  await clearDataIfMonday();
  
  const allKeys = await keys();
  const dailyBestKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith(DAILY_BEST_PREFIX));
  
  const dailyBestScores: DailyBestScore[] = await Promise.all(
    dailyBestKeys.map(key => get(key))
  );
  
  const validDailyBests = dailyBestScores.filter(Boolean);
  const users = await getUsers();
  
  const userScores = new Map<string, number>();
  
  validDailyBests.forEach(dailyBest => {
    const currentScore = userScores.get(dailyBest.userId) || 0;
    userScores.set(dailyBest.userId, currentScore + dailyBest.bestScore);
  });
  
  const rankings: WeeklyRanking[] = [];
  for (const [userId, totalCorrectAnswers] of userScores) {
    const user = users.find(u => u.id === userId);
    if (user) {
      rankings.push({
        userId,
        userName: user.name,
        totalCorrectAnswers
      });
    }
  }
  
  return rankings.sort((a, b) => b.totalCorrectAnswers - a.totalCorrectAnswers).slice(0, 5);
};

const getLastMondayDate = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysToLastMonday);
  return lastMonday.toISOString().split('T')[0];
};

const clearDataIfMonday = async (): Promise<void> => {
  const lastClearKey = 'last_clear_date';
  const lastClearDate = await get(lastClearKey);
  const thisMonday = getLastMondayDate();
  
  if (lastClearDate !== thisMonday) {
    const allKeys = await keys();
    const dailyBestKeys = allKeys.filter(key => 
      typeof key === 'string' && key.startsWith(DAILY_BEST_PREFIX)
    );
    
    await Promise.all(dailyBestKeys.map(key => del(key)));
    await set(lastClearKey, thisMonday);
  }
};

export const getTodaysBestScore = async (userId: string): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const dailyBestKey = `${DAILY_BEST_PREFIX}${userId}_${today}`;
  
  const dailyBest = await get(dailyBestKey);
  return dailyBest ? dailyBest.bestScore : 0;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await del(`${USERS_PREFIX}${userId}`);
  
  const allKeys = await keys();
  const sessionKeys = allKeys.filter(key => 
    typeof key === 'string' && 
    key.startsWith(SESSIONS_PREFIX)
  );
  
  const sessions: GameSession[] = await Promise.all(
    sessionKeys.map(key => get(key))
  );
  
  const userSessions = sessions.filter(session => session && session.userId === userId);
  
  await Promise.all(
    userSessions.map(session => del(`${SESSIONS_PREFIX}${session.id}`))
  );
  
  // Delete daily best scores for this user
  const dailyBestKeys = allKeys.filter(key => 
    typeof key === 'string' && 
    key.startsWith(DAILY_BEST_PREFIX) && 
    key.includes(userId)
  );
  
  await Promise.all(dailyBestKeys.map(key => del(key)));
};