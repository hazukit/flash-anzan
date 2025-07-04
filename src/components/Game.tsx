import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { generateProblem, formatProblemDisplay } from '../utils/gameLogic';
import { saveGameSession } from '../utils/database';
import type { Problem, GameSession } from '../types';

interface GameProps {
  onGameComplete: () => void;
  onBack: () => void;
}

const Game: React.FC<GameProps> = ({ onGameComplete, onBack }) => {
  const { state, dispatch } = useApp();
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);

  const timerRef = useRef<number | null>(null);
  const numberTimerRef = useRef<number | null>(null);
  const endGameRef = useRef<(() => Promise<void>) | null>(null);

  const endGame = async () => {
    setIsGameActive(false);
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (numberTimerRef.current) clearTimeout(numberTimerRef.current);

    // 最新の値を取得するため、状態を直接参照
    const currentCorrectAnswers = correctAnswers;
    const currentTotalProblems = totalProblems;
    const currentTimeLeft = timeLeft;

    console.log('endGame実行:', {
      correctAnswers: currentCorrectAnswers,
      totalProblems: currentTotalProblems,
      timeLeft: currentTimeLeft
    });

    if (state.currentUser) {
      try {
        // 問題数が0より大きい場合のみセッションを保存
        if (currentTotalProblems > 0) {
          const session: GameSession = {
            id: crypto.randomUUID(),
            userId: state.currentUser.id,
            date: Date.now(),
            correctAnswers: currentCorrectAnswers,
            totalProblems: currentTotalProblems,
            settings: state.currentUser.settings
          };

          await saveGameSession(session);
        }

        const gameResult = {
          correctAnswers: currentCorrectAnswers,
          totalProblems: currentTotalProblems,
          timeSpent: (state.currentUser?.settings.playTime || 0) * 60 - currentTimeLeft
        };

        console.log('結果データ:', gameResult);

        setTimeout(() => {
          dispatch({
            type: 'SET_GAME_RESULT',
            payload: gameResult
          });
          onGameComplete();
        }, 0);
      } catch {
        setTimeout(() => {
          dispatch({ type: 'SET_ERROR', payload: 'ゲーム結果の保存に失敗しました' });
          onGameComplete();
        }, 0);
      }
    } else {
      setTimeout(() => onGameComplete(), 0);
    }
  };

  const generateNewProblem = useCallback(() => {
    if (!state.currentUser) return;

    const problem = generateProblem(state.currentUser.settings);
    setCurrentProblem(problem);
    setAnswer('');
  }, [state.currentUser]);

  // endGameの最新の参照を保持
  useEffect(() => {
    endGameRef.current = endGame;
  });

  useEffect(() => {
    if (!state.currentUser) return;

    const totalSeconds = state.currentUser.settings.playTime * 60;
    setTimeLeft(totalSeconds);
    generateNewProblem();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimeout(() => endGameRef.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // numberTimerRefの現在の値をクロージャでキャプチャ
    const currentNumberTimer = numberTimerRef.current;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (currentNumberTimer) clearTimeout(currentNumberTimer);
    };
  }, [state.currentUser, generateNewProblem]);


  const handleAnswerSubmit = () => {
    if (!currentProblem || !answer.trim() || !isGameActive || showResult) return;

    const userAnswer = parseInt(answer.trim());
    const isCorrect = userAnswer === currentProblem.correctAnswer;

    setTotalProblems(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowResult('correct');
    } else {
      setShowResult('incorrect');
    }

    // 1秒後に次の問題または同じ問題を表示
    setTimeout(() => {
      setShowResult(null);
      if (isCorrect) {
        generateNewProblem();
      } else {
        // 不正解の場合は同じ問題を再表示（答えをクリア）
        setAnswer('');
      }
    }, 1000);
  };

  const handleNumberClick = (number: number) => {
    if (!isGameActive) return;
    setAnswer(prev => prev + number.toString());
  };

  const handleClear = () => {
    if (!isGameActive) return;
    setAnswer('');
  };

  const handleBackspace = () => {
    if (!isGameActive) return;
    setAnswer(prev => prev.slice(0, -1));
  };

  const handleMinus = () => {
    if (!isGameActive) return;
    if (answer === '') {
      setAnswer('-');
    } else if (answer === '-') {
      setAnswer('');
    }
  };


  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDisplay = (): string => {
    if (!currentProblem) return '';
    
    // 常に問題を表示（例：25 + 47 = ?）
    return `${formatProblemDisplay(currentProblem)} = ?`;
  };

  if (!state.currentUser) {
    return (
      <div className="container">
        <div className="card">
          <div className="error-message">ユーザーが選択されていません</div>
          <button className="button" onClick={onBack}>
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="container">
      <div className="card game-screen">
        <div className="timer">残り時間: {formatTime(timeLeft)}</div>
        
        <div className="score-display">
          <div>正解: {correctAnswers}問</div>
          <div>出題: {totalProblems}問</div>
        </div>

        <div className="problem-display">
          {getCurrentDisplay()}
        </div>

        <div>
          <div className="answer-display">
            {answer || '答えを入力してください'}
          </div>
          
          <div className="keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                <button
                  key={number}
                  className="keypad-button number"
                  onClick={() => handleNumberClick(number)}
                  disabled={!isGameActive}
                >
                  {number}
                </button>
              ))}
              
              <button
                className="keypad-button number"
                onClick={handleMinus}
                disabled={!isGameActive}
              >
                ±
              </button>
              
              <button
                className="keypad-button number"
                onClick={() => handleNumberClick(0)}
                disabled={!isGameActive}
              >
                0
              </button>
              
              <button
                className="keypad-button clear"
                onClick={handleBackspace}
                disabled={!isGameActive}
              >
                ⌫
              </button>
              
              <button
                className="keypad-button clear clear-text"
                onClick={handleClear}
                disabled={!isGameActive}
              >
                クリア
              </button>
              
              <button 
                className="keypad-button submit" 
                onClick={handleAnswerSubmit}
                disabled={!answer.trim() || !isGameActive}
              >
                答える
              </button>
          </div>
        </div>

        <button className="button secondary" onClick={endGame}>
          ゲーム終了・結果を見る
        </button>

        {/* 結果表示オーバーレイ */}
        {showResult && (
          <div className="result-overlay">
            <div className="result-content">
              <div className={`result-icon ${showResult}`}>
                {showResult === 'correct' ? '⭕' : '❌'}
              </div>
              <div className={`result-text ${showResult}`}>
                {showResult === 'correct' ? '正解！' : '不正解'}
              </div>
              {currentProblem && (
                <div className="result-answer">
                  正解: {currentProblem.correctAnswer}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;