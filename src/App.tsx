import { useState } from 'react'
import { AppProvider } from './contexts/AppContext'
import Home from './components/Home'
import Settings from './components/Settings'
import Countdown from './components/Countdown'
import Game from './components/Game'
import Result from './components/Result'
import Ranking from './components/Ranking'
import './App.css'

type Screen = 'home' | 'settings' | 'countdown' | 'game' | 'result' | 'ranking'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')

  const navigateToSettings = () => {
    setCurrentScreen('settings')
  }

  const navigateToCountdown = () => {
    setCurrentScreen('countdown')
  }

  const navigateToGame = () => {
    setCurrentScreen('game')
  }

  const navigateToResult = () => {
    setCurrentScreen('result')
  }

  const navigateToRanking = () => {
    setCurrentScreen('ranking')
  }

  const navigateToHome = () => {
    setCurrentScreen('home')
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <Home
            onSelectUser={navigateToSettings}
            onShowRanking={navigateToRanking}
          />
        )
      case 'settings':
        return (
          <Settings
            onStartGame={navigateToCountdown}
            onBack={navigateToHome}
          />
        )
      case 'countdown':
        return (
          <Countdown
            onComplete={navigateToGame}
          />
        )
      case 'game':
        return (
          <Game
            onGameComplete={navigateToResult}
            onBack={navigateToHome}
          />
        )
      case 'result':
        return (
          <Result
            onBackToHome={navigateToHome}
          />
        )
      case 'ranking':
        return (
          <Ranking
            onBack={navigateToHome}
          />
        )
      default:
        return (
          <Home
            onSelectUser={navigateToSettings}
            onShowRanking={navigateToRanking}
          />
        )
    }
  }

  return (
    <AppProvider>
      {renderScreen()}
    </AppProvider>
  )
}

export default App
