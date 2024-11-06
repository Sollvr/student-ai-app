import { NextResponse } from 'next/server'
import { processCoursePlan } from '@/lib/ai'
import { storeCourseSchedule } from '@/lib/supabase/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    // Get schedule from AI
    const schedule = await processCoursePlan({
      courseContent: body.courseContent,
      courseName: body.courseName,
      startDate: body.startDate,
      endDate: body.endDate,
      weeklyHours: body.weeklyHours,
      sessionLength: body.sessionLength
    })

    // Store in Supabase
    const storageResult = await storeCourseSchedule({
      courseName: body.courseName,
      startDate: body.startDate,
      endDate: body.endDate,
      weeklyHours: parseInt(body.weeklyHours),
      sessionLength: parseInt(body.sessionLength),
      scheduleData: {
        scheduleId: schedule.id,
        schedule: schedule.data
      }
    })

    if (!storageResult.success) {
      throw new Error('Failed to store schedule')
    }

    return new NextResponse(JSON.stringify({ 
      scheduleId: schedule.id,
      schedule: schedule.data,
      dbId: storageResult.courseId // You can use this to fetch the data later
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate or store schedule' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}