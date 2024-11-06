import OpenAI from 'openai'

import { NextResponse } from 'next/server'



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

      // Convert file to text

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

}



Ensure your response is ONLY the JSON object, with no additional text or formatting.`



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



    try {

      const quizData = JSON.parse(content.trim())

      return NextResponse.json(quizData)

    } catch (parseError) {

      console.error('JSON Parse Error:', parseError)

      throw new Error('Failed to parse OpenAI response as JSON')

    }

  } catch (error) {

    console.error('Error in generate-quiz:', error)

    return NextResponse.json(

      { error: 'Failed to generate quiz' },

      { status: 500 }

    )

  }

}






