import { useState } from 'react'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Letter from './pages/Letter'
import Gifts from './pages/Gifts'

export default function App() {
  const [page, setPage] = useState('home')
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [completionGreetingPending, setCompletionGreetingPending] = useState(false)

  const handleQuizComplete = () => {
    setQuizCompleted(true)
    setCompletionGreetingPending(true)
  }

  if (page === 'quiz') {
    return (
      <Quiz onBack={() => setPage('home')} onComplete={handleQuizComplete} />
    )
  }

  if (page === 'letter') {
    return <Letter onBack={() => setPage('home')} />
  }

  if (page === 'gifts') {
    return <Gifts onBack={() => setPage('home')} />
  }

  return (
    <Home
      quizCompleted={quizCompleted}
      showCompletionGreeting={completionGreetingPending}
      onCompletionGreetingShown={() => setCompletionGreetingPending(false)}
      onStartQuiz={() => setPage('quiz')}
      onOpenLetter={() => setPage('letter')}
      onOpenGifts={() => setPage('gifts')}
    />
  )
}
