import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getTodaysBestScore } from '../utils/database';

interface ResultProps {
  onBackToHome: () => void;
}

const Result: React.FC<ResultProps> = ({ onBackToHome }) => {
  const { state } = useApp();
  const [isNewBestRecord, setIsNewBestRecord] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBestRecord = async () => {
      if (state.gameResult && state.currentUser) {
        try {
          const todaysBest = await getTodaysBestScore(state.currentUser.id);
          const currentScore = state.gameResult.correctAnswers;
          setIsNewBestRecord(currentScore >= todaysBest);
        } catch (error) {
          console.error('ベストスコアチェックエラー:', error);
        }
      }
      setLoading(false);
    };

    checkBestRecord();
  }, [state.gameResult, state.currentUser]);

  console.log('Result画面 - state:', state);
  console.log('Result画面 - gameResult:', state.gameResult);
  console.log('Result画面 - currentUser:', state.currentUser);

  if (!state.gameResult || !state.currentUser) {
    console.log('結果データがありません - gameResult:', !!state.gameResult, 'currentUser:', !!state.currentUser);
    return (
      <div className="container">
        <div className="card">
          <div className="error-message">結果データがありません</div>
          <button className="button" onClick={onBackToHome}>
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const { correctAnswers, totalProblems, timeSpent } = state.gameResult;
  const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  const getPerformanceMessage = (): string => {
    if (accuracy >= 90) return '素晴らしい成績です！';
    if (accuracy >= 80) return 'とても良い成績です！';
    if (accuracy >= 70) return '良い成績です！';
    if (accuracy >= 60) return 'もう少し頑張りましょう！';
    return '継続して練習しましょう！';
  };

  const getPerformanceColor = (): string => {
    if (accuracy >= 90) return '#34C759';
    if (accuracy >= 80) return '#007AFF';
    if (accuracy >= 70) return '#FF9500';
    if (accuracy >= 60) return '#FF3B30';
    return '#8E8E93';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">結果を確認中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card result-screen">
        <h1 className="title">ゲーム結果</h1>
        
        {isNewBestRecord && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1rem',
            color: '#FF9500',
            fontSize: '1.1rem',
            fontWeight: '600',
            background: '#FFF3E0',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #FF9500'
          }}>
            🎉 今日のベストレコード！
          </div>
        )}
        
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: getPerformanceColor(),
          fontSize: '1.2rem',
          fontWeight: '600'
        }}>
          {getPerformanceMessage()}
        </div>

        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-label">正解数</div>
            <div className="stat-value">{correctAnswers}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">出題数</div>
            <div className="stat-value">{totalProblems}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">正答率</div>
            <div className="stat-value" style={{ color: getPerformanceColor() }}>
              {accuracy}%
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">プレイ時間</div>
            <div className="stat-value">{formatTime(timeSpent)}</div>
          </div>
        </div>

        {totalProblems > 0 && (
          <div style={{ 
            background: '#f2f2f7',
            padding: '20px',
            borderRadius: '12px',
            margin: '20px 0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#8e8e93', marginBottom: '8px' }}>
              1問あたりの平均時間
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#007AFF' }}>
              {Math.round(timeSpent / totalProblems)}秒
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <button className="button" onClick={onBackToHome}>
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;