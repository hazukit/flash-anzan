import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getUsers, createUser, deleteUser } from '../utils/database';

interface HomeProps {
  onSelectUser: (userId: string) => void;
  onShowRanking: () => void;
}

const Home: React.FC<HomeProps> = ({ onSelectUser, onShowRanking }) => {
  const { state, dispatch } = useApp();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const users = await getUsers();
      dispatch({ type: 'SET_USERS', payload: users });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'ユーザーの読み込みに失敗しました' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'ユーザー名を入力してください' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await createUser(newUserName.trim());
      dispatch({ type: 'ADD_USER', payload: user });
      setNewUserName('');
      setShowCreateUser(false);
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'ユーザーの作成に失敗しました' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDeleteUser = async (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('このユーザーを削除しますか？')) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await deleteUser(userId);
        dispatch({ type: 'DELETE_USER', payload: userId });
        setSelectedUserId(null);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'ユーザーの削除に失敗しました' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const user = state.users.find(u => u.id === userId);
    if (user) {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
    }
  };

  const handleStartGame = () => {
    if (selectedUserId) {
      onSelectUser(selectedUserId);
    }
  };

  if (state.loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">フラッシュ暗算</h1>
        
        {state.isEditMode && (
          <div className="edit-mode-indicator">
            🛠️ 編集モード
          </div>
        )}
        
        {state.error && (
          <div className="error-message">{state.error}</div>
        )}

        {showCreateUser ? (
          <div>
            <div className="input-group">
              <label className="label">ユーザー名</label>
              <input
                type="text"
                className="input"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="ユーザー名を入力"
                maxLength={20}
              />
            </div>
            <button className="button" onClick={handleCreateUser}>
              作成
            </button>
            <button 
              className="button secondary" 
              onClick={() => {
                setShowCreateUser(false);
                setNewUserName('');
                dispatch({ type: 'SET_ERROR', payload: null });
              }}
            >
              キャンセル
            </button>
          </div>
        ) : (
          <div>
            {state.users.length > 0 ? (
              <div>
                <h2 className="label">ユーザーを選択</h2>
                <ul className="user-list">
                  {state.users.map((user) => (
                    <li 
                      key={user.id}
                      className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <span className="user-name">{user.name}</span>
                      {state.isEditMode && (
                        <button
                          className="delete-btn"
                          onClick={(e) => handleDeleteUser(user.id, e)}
                          title="ユーザーを削除"
                        >
                          削除
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                
                {selectedUserId && (
                  <button className="button" onClick={handleStartGame}>
                    ゲームを始める
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <p style={{ marginBottom: '20px', color: '#8e8e93' }}>
                  ユーザーが登録されていません
                </p>
              </div>
            )}
            
            {state.isEditMode && (
              <button 
                className="button secondary" 
                onClick={() => setShowCreateUser(true)}
              >
                新しいユーザーを追加
              </button>
            )}
          </div>
        )}
        
        <div style={{ marginTop: 'auto' }}>
          <button className="button secondary" onClick={onShowRanking}>
            ランキングを見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;