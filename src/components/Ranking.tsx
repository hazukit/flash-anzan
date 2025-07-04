import React, { useState, useEffect } from 'react';
import { getWeeklyRanking } from '../utils/database';
import type { WeeklyRanking } from '../types';

interface RankingProps {
  onBack: () => void;
}

const Ranking: React.FC<RankingProps> = ({ onBack }) => {
  const [rankings, setRankings] = useState<WeeklyRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      const weeklyRankings = await getWeeklyRanking();
      setRankings(weeklyRankings);
    } catch (err) {
      setError('ランキングの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getRankingIcon = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getRankingColor = (position: number): string => {
    switch (position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#007AFF';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">ランキングを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">週間ランキング</h1>
        
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          color: '#8e8e93',
          fontSize: '0.9rem'
        }}>
          1日1回のベストスコアの合計（月曜日にリセット）
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {rankings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#8e8e93'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              まだランキングがありません
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              ゲームをプレイしてランキングに参加しましょう！
            </div>
          </div>
        ) : (
          <ul className="ranking-list">
            {rankings.map((ranking, index) => {
              const position = index + 1;
              return (
                <li key={ranking.userId} className="ranking-item">
                  <div className="ranking-position" style={{ color: getRankingColor(position) }}>
                    {getRankingIcon(position) || position}
                  </div>
                  <div className="ranking-name">{ranking.userName}</div>
                  <div className="ranking-score">
                    {ranking.totalCorrectAnswers}問
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div style={{ marginTop: '2rem' }}>
          <button className="button secondary" onClick={onBack}>
            ホームに戻る
          </button>
          <button 
            className="button secondary" 
            onClick={loadRankings}
            disabled={loading}
          >
            {loading ? '更新中...' : 'ランキング更新'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ranking;