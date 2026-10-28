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

  /* Cada nuevo intento del cuestionario invalida el desbloqueo anterior:
     solo se queda desbloqueado si la nueva prueba acaba en 6/6. */
  const handleStartQuiz = () => {
    setCompletionGreetingPending(false)
    setPage('quiz')
  }

  let pageContent
  if (page === 'quiz') {
    pageContent = <Quiz onBack={() => setPage('home')} onComplete={handleQuizComplete} />
  } else if (page === 'letter') {
    pageContent = <Letter onBack={() => setPage('home')} />
  } else if (page === 'gifts') {
    pageContent = <Gifts onBack={() => setPage('home')} />
  } else {
    pageContent = (
      <Home
        quizCompleted={quizCompleted}
        showCompletionGreeting={completionGreetingPending}
        onCompletionGreetingShown={() => setCompletionGreetingPending(false)}
        onStartQuiz={handleStartQuiz}
        onOpenLetter={() => setPage('letter')}
        onOpenGifts={() => setPage('gifts')}
      />
    )
  }

  return pageContent
}
