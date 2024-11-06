import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ProcessCoursePlanParams {
  courseContent: string
  courseName: string
  startDate: string
  endDate: string
  weeklyHours: string
  sessionLength: string
}

interface Session {
  date: string;
  duration: number;
  sessionNumber: number;
  learningObjectives: string[];
  topics: string[];
  materials: string[];
  preparation: string;
  notes: string;
}

interface ScheduleResponse {
  id: string
  data: {
    overview: {
      totalSessions: number;
      totalHours: number;
      courseSummary: string;
    };
    sessions: Session[];
  }
}

export async function processCoursePlan(params: ProcessCoursePlanParams): Promise<ScheduleResponse> {
  try {
    const prompt = `Create a detailed study schedule for the following course:

Course Name: ${params.courseName}
Start Date: ${params.startDate}
End Date: ${params.endDate}
Weekly Study Hours: ${params.weeklyHours}
Session Length: ${params.sessionLength}

Course Content:
${params.courseContent}

Please provide the schedule in the following JSON format:
{
  "overview": {
    "totalSessions": number,
    "totalHours": number,
    "courseSummary": "string"
  },
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "duration": number,
      "sessionNumber": number,
      "learningObjectives": ["string"],
      "topics": ["string"],
      "materials": ["string"],
      "preparation": "string",
      "notes": "string"
    }
  ]
}

Ensure the schedule is practical, easy to follow, and topics build upon each other logically.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful educational planner who creates detailed, well-structured study schedules in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const scheduleId = generateScheduleId();
    const scheduleData = JSON.parse(completion.choices[0].message.content || '{}');

    if (!validateSchedule(scheduleData)) {
      throw new Error('Generated schedule data is invalid');
    }

    return {
      id: scheduleId,
      data: scheduleData
    };

  } catch (error) {
    console.error('Error in processCoursePlan:', error);
    throw new Error('Failed to process course plan');
  }
}

function generateScheduleId(): string {
  return 'sch_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function validateSchedule(schedule: unknown): schedule is ScheduleResponse['data'] {
  // Implement validation logic here
  // This is a basic validation, you may want to add more checks
  if (typeof schedule !== 'object' || schedule === null) return false;
  
  const { overview, sessions } = schedule as ScheduleResponse['data'];
  
  if (typeof overview !== 'object' || !Array.isArray(sessions)) return false;
  
  if (typeof overview.totalSessions !== 'number' ||
      typeof overview.totalHours !== 'number' ||
      typeof overview.courseSummary !== 'string') return false;
  
  if (!sessions.every(session => 
    typeof session.date === 'string' &&
    typeof session.duration === 'number' &&
    typeof session.sessionNumber === 'number' &&
    Array.isArray(session.learningObjectives) &&
    Array.isArray(session.topics) &&
    Array.isArray(session.materials) &&
    typeof session.preparation === 'string' &&
    typeof session.notes === 'string'
  )) return false;

  return true;
}





