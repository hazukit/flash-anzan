import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { User, GameResult, DifficultySettings } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  gameResult: GameResult | null;
  loading: boolean;
  error: string | null;
  isEditMode: boolean;
}

type AppAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER_SETTINGS'; payload: { userId: string; settings: DifficultySettings } }
  | { type: 'SET_GAME_RESULT'; payload: GameResult | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_EDIT_MODE'; payload: boolean };

const initialState: AppState = {
  currentUser: null,
  users: [],
  gameResult: null,
  loading: false,
  error: null,
  isEditMode: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload],
        currentUser: action.payload 
      };
    case 'UPDATE_USER_SETTINGS': {
      const updatedUsers = state.users.map(user =>
        user.id === action.payload.userId
          ? { ...user, settings: action.payload.settings }
          : user
      );
      const updatedCurrentUser = state.currentUser?.id === action.payload.userId
        ? { ...state.currentUser, settings: action.payload.settings }
        : state.currentUser;
      return { 
        ...state, 
        users: updatedUsers,
        currentUser: updatedCurrentUser
      };
    }
    case 'SET_GAME_RESULT':
      return { ...state, gameResult: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'DELETE_USER':
      const filteredUsers = state.users.filter(user => user.id !== action.payload);
      const newCurrentUser = state.currentUser?.id === action.payload ? null : state.currentUser;
      return {
        ...state,
        users: filteredUsers,
        currentUser: newCurrentUser
      };
    case 'SET_EDIT_MODE':
      return { ...state, isEditMode: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('mode') === 'edit';
    dispatch({ type: 'SET_EDIT_MODE', payload: isEditMode });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};