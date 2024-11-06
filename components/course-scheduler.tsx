'use client'
import { useState, useRef } from 'react'
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

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
  scheduleId: string;
  schedule: {
    overview: {
      courseSummary: string;
      totalSessions: number;
      totalHours: number;
    };
    sessions: Session[];
  };
}

export default function Component() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    courseName: '',
    startDate: '',
    endDate: '',
    weeklyHours: '',
    sessionLength: '',
    courseContent: ''
  })
  const [apiResponse, setApiResponse] = useState<ScheduleResponse | null>(null)
  const [activeTab, setActiveTab] = useState('text')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        courseContent: `File uploaded: ${file.name}`
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate schedule')
      }

      const data: ScheduleResponse = await response.json()
      setApiResponse(data)
      console.log('API Response:', data)
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Failed to generate schedule. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl bg-white">
        <CardContent className="p-6">
          <Tabs defaultValue="form">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="form">Course Input</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weeklyHours">Weekly Study Hours</Label>
                    <Input
                      id="weeklyHours"
                      name="weeklyHours"
                      type="number"
                      min="1"
                      value={formData.weeklyHours}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionLength">Preferred Session Length (minutes)</Label>
                    <Input
                      id="sessionLength"
                      name="sessionLength"
                      type="number"
                      min="1"
                      value={formData.sessionLength}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Course Content</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Enter Text</TabsTrigger>
                      <TabsTrigger value="upload">Upload File</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <Textarea
                        name="courseContent"
                        value={formData.courseContent}
                        onChange={handleInputChange}
                        className="w-full h-32 mt-2"
                        placeholder="Enter your course content here..."
                      />
                    </TabsContent>
                    <TabsContent value="upload">
                      <div className="mt-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload PDF or DOC file
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'GENERATE SCHEDULE'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="calendar">
              {apiResponse ? (
                <CustomCalendar sessions={apiResponse.schedule.sessions} />
              ) : (
                <p className="text-center text-gray-500">Generate a schedule to view the calendar.</p>
              )}
            </TabsContent>

            <TabsContent value="timeline">
              {apiResponse ? (
                <Timeline sessions={apiResponse.schedule.sessions} />
              ) : (
                <p className="text-center text-gray-500">Generate a schedule to view the timeline.</p>
              )}
            </TabsContent>
          </Tabs>

          {apiResponse && (
            <div className="mt-6 p-4 border border-gray-200 rounded">
              <h3 className="text-lg font-semibold mb-2">Course Overview:</h3>
              <p className="text-gray-700">{apiResponse.schedule.overview.courseSummary}</p>
              <p className="mt-2 text-sm text-gray-600">
                Total Sessions: {apiResponse.schedule.overview.totalSessions} | 
                Total Hours: {apiResponse.schedule.overview.totalHours}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface CustomCalendarProps {
  sessions: Session[];
}

function CustomCalendar({ sessions }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const sessionsInMonth = sessions.filter(session => {
    const sessionDate = new Date(session.date)
    return sessionDate.getMonth() === currentDate.getMonth() && sessionDate.getFullYear() === currentDate.getFullYear()
  })

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={prevMonth} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <Button onClick={nextMonth} variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-medium mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const sessionForDay = sessionsInMonth.find(session => new Date(session.date).getDate() === day)
          return (
            <div
              key={day}
              className={`p-2 border rounded ${sessionForDay ? 'bg-blue-100' : ''}`}
            >
              <div className="font-medium">{day}</div>
              {sessionForDay && (
                <div className="text-xs mt-1">Session {sessionForDay.sessionNumber}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface TimelineProps {
  sessions: Session[];
}

function Timeline({ sessions }: TimelineProps) {
  return (
    <div className="relative">
      {sessions.map((session, index) => (
        <div key={index} className="mb-8 flex items-center">
          <div className="flex flex-col items-center mr-4">
            <div className="rounded-full h-8 w-8 bg-blue-500 text-white flex items-center justify-center">
              {session.sessionNumber}
            </div>
            <div className="h-full w-0.5 bg-blue-200"></div>
          </div>
          <div className="bg-white p-4 rounded shadow-md flex-grow">
            <h3 className="font-bold">{new Date(session.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <p className="text-sm text-gray-600">Duration: {session.duration} minutes</p>
            <h4 className="font-semibold mt-2">Topics:</h4>
            <ul className="list-disc list-inside">
              {session.topics.map((topic, i) => (
                <li key={i} className="text-sm">{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}




























