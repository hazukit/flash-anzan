import React, { useState, useEffect } from 'react';

interface CountdownProps {
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // カウントダウン完了
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div className="container">
      <div className="card game-screen">
        <div className="countdown-container">
          <div className="countdown-text">ゲーム開始まで</div>
          <div className="countdown-number">{count || 'START!'}</div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;