import { BookOpen, Calendar, FileText, PieChart, Plus, User } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-full flex-col">
          {/* Profile Section */}
          <div className="flex flex-col items-center gap-2 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Account Name</h2>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <Link href="/schedule">
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
            </Link>
            <Link href="/quiz">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Quiz
              </Button>
            </Link>
            <Link href="/summary">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Summarize
              </Button>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Welcome, Student!</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Button>
          </div>

          {/* Content */}
          <div className="mt-8 grid gap-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <div className="relative h-48 w-48">
                  <PieChart className="h-full w-full text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold">75%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Past Schedules */}
            <Card>
              <CardHeader>
                <CardTitle>Past Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
                  All past generated schedules will appear here
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}