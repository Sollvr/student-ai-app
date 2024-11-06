// lib/supabase/quiz-utils.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface StoreQuizParams {
  topic: string;
  file?: File;
  quiz: QuizQuestion[];
}

export async function storeQuiz({ topic, file, quiz }: StoreQuizParams) {
  try {
    let filePath = null;

    // 1. If there's a file, upload it to Supabase Storage
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('quiz-files')
        .upload(fileName, file)

      if (uploadError) throw uploadError
      filePath = fileData.path
    }

    // 2. Create quiz entry
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        topic,
        file_path: filePath
      })
      .select()
      .single()

    if (quizError) throw quizError

    // 3. Store questions and options
    for (let i = 0; i < quiz.length; i++) {
      const question = quiz[i]
      
      // Create question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          quiz_id: quizData.id,
          question_text: question.question,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          question_order: i + 1
        })
        .select()
        .single()

      if (questionError) throw questionError

      // Create options
      const optionsData = question.options.map((option, index) => ({
        question_id: questionData.id,
        option_text: option,
        is_correct: option === question.correct_answer,
        option_order: index + 1
      }))

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsData)

      if (optionsError) throw optionsError
    }

    return { success: true, quizId: quizData.id }
  } catch (error) {
    console.error('Error storing quiz:', error)
    return { success: false, error }
  }
}