import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { updateUserSettings } from '../utils/database';
import type { DifficultySettings, OperationType } from '../types';
import { getOperationLabel } from '../utils/gameLogic';

interface SettingsProps {
  onStartGame: () => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onStartGame, onBack }) => {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState<DifficultySettings>({
    operations: ['addition'],
    maxDigits: 2,
    playTime: 2
  });

  useEffect(() => {
    if (state.currentUser) {
      setSettings(state.currentUser.settings);
    }
  }, [state.currentUser]);

  const operationTypes: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];

  const handleOperationChange = (operation: OperationType, checked: boolean) => {
    if (checked) {
      setSettings({
        ...settings,
        operations: [...settings.operations, operation]
      });
    } else {
      if (settings.operations.length > 1) {
        setSettings({
          ...settings,
          operations: settings.operations.filter(op => op !== operation)
        });
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!state.currentUser) return;

    if (settings.operations.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: '少なくとも1つの計算種別を選択してください' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await updateUserSettings(state.currentUser.id, settings);
      dispatch({ 
        type: 'UPDATE_USER_SETTINGS', 
        payload: { userId: state.currentUser.id, settings } 
      });
      dispatch({ type: 'SET_ERROR', payload: null });
      onStartGame();
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '設定の保存に失敗しました' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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
      <div className="card">
        <h1 className="title">{state.currentUser.name}の設定</h1>
        
        {state.error && (
          <div className="error-message">{state.error}</div>
        )}

        <div className="input-group">
          <label className="label">計算種別</label>
          <div className="checkbox-group">
            {operationTypes.map(operation => (
              <label key={operation} className="checkbox-item">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={settings.operations.includes(operation)}
                  onChange={(e) => handleOperationChange(operation, e.target.checked)}
                />
                <span>{getOperationLabel(operation)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="slider-group">
          <label className="label">最大桁数: {settings.maxDigits}桁</label>
          <input
            type="range"
            className="slider"
            min={1}
            max={3}
            value={settings.maxDigits}
            onChange={(e) => setSettings({
              ...settings,
              maxDigits: parseInt(e.target.value)
            })}
          />
          <div className="slider-value">{settings.maxDigits}桁</div>
        </div>


        <div className="slider-group">
          <label className="label">プレイ時間: {settings.playTime}分</label>
          <input
            type="range"
            className="slider"
            min={1}
            max={5}
            value={settings.playTime}
            onChange={(e) => setSettings({
              ...settings,
              playTime: parseInt(e.target.value)
            })}
          />
          <div className="slider-value">{settings.playTime}分</div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button 
            className="button" 
            onClick={handleSaveSettings}
            disabled={state.loading}
          >
            {state.loading ? '保存中...' : 'ゲーム開始'}
          </button>
          <button className="button secondary" onClick={onBack}>
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;