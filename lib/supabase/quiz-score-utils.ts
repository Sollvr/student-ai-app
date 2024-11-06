// lib/supabase/quiz-score-utils.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface SaveQuizAttemptParams {
  quizId: string;
  responses: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

export async function saveQuizAttempt({ quizId, responses }: SaveQuizAttemptParams) {
  try {
    console.log('Saving attempt - Quiz ID:', quizId)
    console.log('Responses:', responses)

    // Calculate score
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const totalQuestions = responses.length;

    // Create attempt record
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        score: correctAnswers,
        total_questions: totalQuestions
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error creating attempt:', attemptError)
      throw attemptError
    }

    console.log('Created attempt:', attemptData)

    // Save individual question responses
    const questionResponses = responses.map(response => ({
      attempt_id: attemptData.id,
      question_id: response.questionId,
      selected_option_id: response.selectedOptionId,
      is_correct: response.isCorrect
    }));

    console.log('Saving responses:', questionResponses)

    const { data: responseData, error: responsesError } = await supabase
      .from('question_responses')
      .insert(questionResponses)
      .select();

    if (responsesError) {
      console.error('Error saving responses:', responsesError)
      throw responsesError
    }

    console.log('Saved responses:', responseData)

    return {
      success: true,
      attemptId: attemptData.id,
      score: correctAnswers,
      totalQuestions,
      responses: responseData
    };
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return { success: false, error };
  }
}

export async function getQuizAttempts(quizId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quiz:quizzes(topic),
      question_responses(*)
    `)
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching quiz attempts:', error);
    return { success: false, error };
  }

  return { success: true, attempts: data };
}

export async function getQuizStatistics(quizId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('score, total_questions')
    .eq('quiz_id', quizId);

  if (error) {
    console.error('Error fetching quiz statistics:', error);
    return { success: false, error };
  }

  const attempts = data || [];
  const totalAttempts = attempts.length;
  const averageScore = totalAttempts > 0
    ? attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions) * 100, 0) / totalAttempts
    : 0;

  return {
    success: true,
    statistics: {
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: Math.max(...attempts.map(a => (a.score / a.total_questions) * 100), 0)
    }
  };
}