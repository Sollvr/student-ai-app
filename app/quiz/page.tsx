'use client'

import { useState } from 'react'

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Label } from "@/components/ui/label"

import { saveQuizAttempt } from '@/lib/supabase/quiz-score-utils'

import { supabase } from '@/lib/supabase/client'



type QuizQuestion = {

  question: string

  options: string[]

  correct_answer: string

  explanation: string

  id?: string

}



export default function QuizApp() {

  const [topic, setTopic] = useState('')

  const [quiz, setQuiz] = useState<QuizQuestion[]>([])

  const [currentQuestion, setCurrentQuestion] = useState(0)

  const [selectedAnswer, setSelectedAnswer] = useState('')

  const [showExplanation, setShowExplanation] = useState(false)

  const [loading, setLoading] = useState(false)

  const [file, setFile] = useState<File | null>(null)

  const [quizId, setQuizId] = useState<string | null>(null)

  const [responses, setResponses] = useState<Array<{

    questionId: string;

    selectedOptionId: string;

    isCorrect: boolean;

  }>>([])

  const [quizCompleted, setQuizCompleted] = useState(false)

  const [finalScore, setFinalScore] = useState<number | null>(null)

  const [allResponses, setAllResponses] = useState<Array<{

    questionId: string;

    selectedOptionId: string;

    isCorrect: boolean;

  }>>([])



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {

      setFile(e.target.files[0])

    }

  }



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    setLoading(true)

    try {

      const formData = new FormData()

      formData.append('topic', topic)

      if (file) {

        formData.append('file', file)

      }



      const response = await fetch('/api/generate-quiz', {

        method: 'POST',

        body: formData,

      })

      const data = await response.json()

      setQuiz(data.quiz)

      setQuizId(data.dbId)

      setCurrentQuestion(0)

      setSelectedAnswer('')

      setShowExplanation(false)

      setResponses([])

      setQuizCompleted(false)

      setFinalScore(null)

    } catch (error) {

      console.error('Error generating quiz:', error)

    }

    setLoading(false)

  }



  const handleNextQuestion = () => {

    if (currentQuestion < quiz.length - 1) {

      setCurrentQuestion(currentQuestion + 1)

      setSelectedAnswer('')

      setShowExplanation(false)

    }

  }



  const handleAnswerSubmit = async () => {

    if (!selectedAnswer) return;
    
    const currentQ = quiz[currentQuestion]
    const isCorrect = selectedAnswer === currentQ.correct_answer

    try {
      const { data: optionData, error: optionError } = await supabase
        .from('options')
        .select('id')
        .eq('question_id', currentQ.id)
        .eq('option_text', selectedAnswer)
        .single()

      if (optionError) throw optionError
      if (!optionData) throw new Error('Option not found')

      const newResponse = {
        questionId: currentQ.id!,
        selectedOptionId: optionData.id,
        isCorrect
      }

      setAllResponses(prev => [...prev, newResponse])
      
      setShowExplanation(true)

      if (currentQuestion === quiz.length - 1) {
        const finalResponses = [...allResponses, newResponse]
        console.log('Saving quiz attempt with responses:', finalResponses)

        if (quizId) {
          const result = await saveQuizAttempt({
            quizId,
            responses: finalResponses
          })

          console.log('Save attempt result:', result)

          if (result.success) {
            setQuizCompleted(true)
            setFinalScore(result.score ?? null)
          } else {
            console.error('Failed to save quiz attempt:', result.error)
          }
        }
      }
    } catch (error) {
      console.error('Error handling answer submission:', error)
    }
  }



  return (

    <div className="container mx-auto p-4">

      <h1 className="text-3xl font-bold mb-6 text-center">AI Quiz Generator</h1>

      <form onSubmit={handleSubmit} className="mb-4">

        <div className="flex gap-2">

          <Input

            type="text"

            value={topic}

            onChange={(e) => setTopic(e.target.value)}

            placeholder="Enter a topic for the quiz"

            className="flex-grow bg-white text-black placeholder:text-gray-500"

            style={{ color: 'black' }}

          />

          <Input

            type="file"

            onChange={handleFileChange}

            className="hidden"

            id="file-upload"

            accept=".pdf,.txt,.doc,.docx"

          />

          <Label

            htmlFor="file-upload"

            className="cursor-pointer px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 flex items-center"

          >

            {file ? file.name.slice(0, 20) + '...' : 'Upload File'}

          </Label>

          <Button type="submit" disabled={loading}>

            {loading ? 'Generating...' : 'Generate Quiz'}

          </Button>

        </div>

      </form>



      {quiz && quiz.length > 0 && (

        <Card className="w-full">

          <CardHeader>

            <CardTitle>Question {currentQuestion + 1} of {quiz.length}</CardTitle>

            <CardDescription>{quiz[currentQuestion].question}</CardDescription>

          </CardHeader>

          <CardContent>

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>

              {quiz[currentQuestion].options.map((option, index) => (

                <div key={index} className="flex items-center space-x-2">

                  <RadioGroupItem value={option} id={`option-${index}`} />

                  <Label htmlFor={`option-${index}`}>{option}</Label>

                </div>

              ))}

            </RadioGroup>

          </CardContent>

          <CardFooter className="flex justify-between">

            <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer || showExplanation}>

              Submit Answer

            </Button>

            <Button onClick={handleNextQuestion} disabled={currentQuestion === quiz.length - 1}>

              Next Question

            </Button>

          </CardFooter>

          {showExplanation && (

            <CardContent>

              <p className={`font-bold ${selectedAnswer === quiz[currentQuestion].correct_answer ? 'text-green-600' : 'text-red-600'}`}>

                {selectedAnswer === quiz[currentQuestion].correct_answer ? 'Correct!' : 'Incorrect.'}

              </p>

              <p className="mt-2">{quiz[currentQuestion].explanation}</p>

            </CardContent>

          )}

        </Card>

      )}



      {quizCompleted && finalScore !== null && (

        <Card className="mt-4">

          <CardHeader>

            <CardTitle>Quiz Completed!</CardTitle>

            <CardDescription>

              You scored {finalScore} out of {quiz.length} questions correctly.

            </CardDescription>

          </CardHeader>

          <CardContent>

            <p className="text-lg">

              Score: {((finalScore / quiz.length) * 100).toFixed(1)}%

            </p>

          </CardContent>

          <CardFooter>

            <Button onClick={() => setTopic('')}>Start New Quiz</Button>

          </CardFooter>

        </Card>

      )}

    </div>

  )

}



















































