import Anthropic from '@anthropic-ai/sdk';



const anthropic = new Anthropic({

  apiKey: process.env.ANTHROPIC_API_KEY

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



Return ONLY the JSON data without any markdown formatting or additional text, in this exact format:

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



    const completion = await anthropic.messages.create({

      model: "claude-3-sonnet-20240229",

      max_tokens: 4096,

      messages: [

        {

          role: "user",

          content: prompt

        }

      ],

      system: "You are a helpful educational planner. Return ONLY valid JSON data without any markdown formatting or explanation."

    });



    const scheduleId = generateScheduleId();

    

    // Extract and clean the response

    let jsonContent = completion.content[0].type === 'text' ? completion.content[0].text : '{}';

    

    // Remove any markdown code block indicators if present

    jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    

    const scheduleData = JSON.parse(jsonContent);



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












