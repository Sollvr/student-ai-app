// lib/supabase/summary-utils.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface StoreSummaryParams {
  originalContent: string;
  summaryText: string;
  file?: File;
}

export async function storeSummary({ 
  originalContent, 
  summaryText, 
  file 
}: StoreSummaryParams) {
  try {
    let filePath = null;
    let fileName = null;

    // 1. If there's a file, upload it to Supabase Storage
    if (file) {
      const fileExt = file.name.split('.').pop()
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('summary-files')
        .upload(uniqueFileName, file)

      if (uploadError) throw uploadError
      
      filePath = fileData.path
      fileName = file.name
    }

    // 2. Create summary entry
    const { data: summaryData, error: summaryError } = await supabase
      .from('summaries')
      .insert({
        original_content: originalContent,
        summary_text: summaryText,
        file_path: filePath,
        file_name: fileName
      })
      .select()
      .single()

    if (summaryError) throw summaryError

    return { success: true, summaryId: summaryData.id }
  } catch (error) {
    console.error('Error storing summary:', error)
    return { success: false, error }
  }
}

export async function getSummaryHistory() {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, summaries: data }
  } catch (error) {
    console.error('Error fetching summary history:', error)
    return { success: false, summaries: [] }
  }
}

export async function getSummaryById(id: string) {
  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching summary:', error)
    return { success: false, error }
  }

  return { success: true, summary: data }
}