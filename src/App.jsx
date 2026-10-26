import { useState } from 'react'
import Home from './pages/Home'
import Quiz from './pages/Quiz'

export default function App() {
  const [page, setPage] = useState('home')
  const [quizCompleted, setQuizCompleted] = useState(false)

  if (page === 'quiz') {
    return (
      <Quiz
        onBack={() => setPage('home')}
        onComplete={() => setQuizCompleted(true)}
      />
    )
  }

  return (
    <Home
      quizCompleted={quizCompleted}
      onStartQuiz={() => setPage('quiz')}
    />
  )
}
