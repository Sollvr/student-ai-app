import { NextResponse } from 'next/server'
import { processCoursePlan } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    const schedule = await processCoursePlan({
      courseContent: body.courseContent,
      courseName: body.courseName,
      startDate: body.startDate,
      endDate: body.endDate,
      weeklyHours: body.weeklyHours,
      sessionLength: body.sessionLength
    })

    console.log('Generated schedule:', schedule)

    return new NextResponse(JSON.stringify({ 
      scheduleId: schedule.id,
      schedule: schedule.data 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate schedule' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}