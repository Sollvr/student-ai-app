import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { storeQuiz } from '@/lib/supabase/quiz-utils'
import { supabase } from '@/lib/supabase/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const topic = formData.get('topic') as string
    const file = formData.get('file') as File | null

    let contextContent = ''
    if (file) {
      const fileText = await file.text()
      contextContent = `\nReference Material:\n${fileText}`
    }

    const prompt = `Create a quiz about ${topic}.${contextContent} 
      The quiz should have exactly 5 questions.
      Each question should have 4 multiple choice options.
      Format your response as a valid JSON object with this exact structure:
      {
        "quiz": [
          {
            "question": "Question text here",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct_answer": "The exact text of the correct option",
            "explanation": "Explanation for why this answer is correct"
          }
        ]
      }`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a quiz generator that responds only with valid JSON objects."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const quizData = JSON.parse(content.trim())

    // Store quiz in database
    const storageResult = await storeQuiz({
      topic,
      file: file || undefined,
      quiz: quizData.quiz
    })

    if (!storageResult.success) {
      throw new Error('Failed to store quiz')
    }

    // Get the stored questions with their IDs
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        correct_answer,
        explanation,
        options (
          id,
          option_text,
          is_correct
        )
      `)
      .eq('quiz_id', storageResult.quizId)
      .order('question_order', { ascending: true })

    if (questionsError) throw questionsError

    // Format the response to include all necessary IDs
    const formattedQuiz = questions.map(q => ({
      id: q.id,
      quiz_id: storageResult.quizId,
      question: q.question_text,
      options: q.options.map((o: any) => o.option_text),
      correct_answer: q.correct_answer,
      explanation: q.explanation
    }))

    return NextResponse.json({
      quiz: formattedQuiz,
      dbId: storageResult.quizId
    })
    
  } catch (error) {
    console.error('Error in generate-quiz:', error)
    return NextResponse.json(
      { error: 'Failed to generate or store quiz' },
      { status: 500 }
    )
  }
}






