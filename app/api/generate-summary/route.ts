import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { storeSummary } from '../../../lib/supabase/summary-utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const text = formData.get('text') as string
    const file = formData.get('file') as File | null

    let content = text
    if (file) {
      // Convert file to text
      const fileText = await file.text()
      content = fileText
    }

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    const prompt = `Please provide a concise summary of the following text:\n\n${content}\n\nSummary:`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates concise summaries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const summary = completion.choices[0].message.content
    if (!summary) {
      throw new Error('No summary received from OpenAI')
    }

    // Store the summary in the database
    const storageResult = await storeSummary({
      originalContent: content,
      summaryText: summary,
      file: file || undefined
    })

    if (!storageResult.success) {
      throw new Error('Failed to store summary')
    }

    return NextResponse.json({ 
      summary,
      summaryId: storageResult.summaryId 
    })
  } catch (error) {
    console.error('Error in generate-summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate or store summary' },
      { status: 500 }
    )
  }
}