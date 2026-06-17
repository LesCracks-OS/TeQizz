/**
 * QCM Game Context
 * 
 * Provides global state management for QCM game sessions including:
 * - Game configuration
 * - Game mode (BLITZ, RUSH, CLASSIC)
 * - Current question state
 * - Score and lives tracking
 * - Timer management with max time cap
 */

import { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  // Game session
  sessionId: null,
  sessionState: null,
  globalTimerDuration: null, // Initial timer duration from session
  maxTimerDuration: null,    // Maximum time cap from session
  gameMode: null,            // Game mode: BLITZ, RUSH, CLASSIC
  
  // Configuration
  config: null,
  
  // Current question
  currentQuestion: null,
  questionIndex: 0,
  
  // Game state
  score: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  livesRemaining: 3,
  totalQuestions: 0,
  
  // Status
  isLoading: false,
  isGameOver: false,
  hasCompleted: false,
  error: null,
  
  // Timer
  timeRemaining: null,
  timerActive: false,
  
  // Last answer result
  lastAnswerResult: null,
};

// Action types
const ActionTypes = {
  SET_SESSION: 'SET_SESSION',
  SET_CONFIG: 'SET_CONFIG',
  SET_QUESTION: 'SET_QUESTION',
  UPDATE_GAME_STATE: 'UPDATE_GAME_STATE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TIMER: 'SET_TIMER',
  SET_LAST_ANSWER: 'SET_LAST_ANSWER',
  RESET_GAME: 'RESET_GAME',
  GAME_OVER: 'GAME_OVER',
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        sessionState: action.payload,
        totalQuestions: action.payload.totalQuestions,
        livesRemaining: action.payload.livesRemaining,
        globalTimerDuration: action.payload.globalTimerDuration,
        maxTimerDuration: action.payload.maxTimerDuration || action.payload.globalTimerDuration,
        gameMode: action.payload.gameMode,
        isLoading: false,
        error: null,
      };
      
    case ActionTypes.SET_CONFIG:
      return {
        ...state,
        config: action.payload,
      };
      
    case ActionTypes.SET_QUESTION:
      return {
        ...state,
        currentQuestion: action.payload,
        questionIndex: action.payload.questionIndex,
        timeRemaining: action.payload.timeLimitSeconds,
        timerActive: true,
        isLoading: false,
        lastAnswerResult: null,
      };
      
    case ActionTypes.UPDATE_GAME_STATE:
      return {
        ...state,
        score: action.payload.currentScore,
        correctAnswers: action.payload.correctAnswers,
        wrongAnswers: action.payload.wrongAnswers,
        livesRemaining: action.payload.livesRemaining,
        isGameOver: action.payload.isGameOver,
        hasCompleted: action.payload.hasCompleted,
        lastAnswerResult: action.payload,
        timerActive: false,
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
      
    case ActionTypes.SET_TIMER:
      return {
        ...state,
        timeRemaining: action.payload,
      };
      
    case ActionTypes.SET_LAST_ANSWER:
      return {
        ...state,
        lastAnswerResult: action.payload,
      };
      
    case ActionTypes.GAME_OVER:
      return {
        ...state,
        isGameOver: true,
        timerActive: false,
      };
      
    case ActionTypes.RESET_GAME:
      return {
        ...initialState,
      };
      
    default:
      return state;
  }
}

// Create context
const QcmGameContext = createContext(null);

// Provider component
export function QcmGameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setSession = useCallback((sessionData) => {
    dispatch({ type: ActionTypes.SET_SESSION, payload: sessionData });
  }, []);

  const setConfig = useCallback((config) => {
    dispatch({ type: ActionTypes.SET_CONFIG, payload: config });
  }, []);

  const setQuestion = useCallback((questionData) => {
    dispatch({ type: ActionTypes.SET_QUESTION, payload: questionData });
  }, []);

  const updateGameState = useCallback((gameState) => {
    dispatch({ type: ActionTypes.UPDATE_GAME_STATE, payload: gameState });
  }, []);

  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const setTimer = useCallback((time) => {
    dispatch({ type: ActionTypes.SET_TIMER, payload: time });
  }, []);

  const gameOver = useCallback(() => {
    dispatch({ type: ActionTypes.GAME_OVER });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_GAME });
  }, []);

  const value = {
    ...state,
    setSession,
    setConfig,
    setQuestion,
    updateGameState,
    setLoading,
    setError,
    setTimer,
    gameOver,
    resetGame,
  };

  return (
    <QcmGameContext.Provider value={value}>
      {children}
    </QcmGameContext.Provider>
  );
}

// Custom hook to use the game context
export function useQcmGame() {
  const context = useContext(QcmGameContext);
  if (!context) {
    throw new Error('useQcmGame must be used within a QcmGameProvider');
  }
  return context;
}

export default QcmGameContext;
