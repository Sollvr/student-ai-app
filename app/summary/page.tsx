'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSummaryHistory } from '@/lib/supabase/summary-utils'

interface SummaryRecord {
  id: string
  summary_text: string
  file_name: string | null
  created_at: string
}

export default function SummaryPage() {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [summaryHistory, setSummaryHistory] = useState<SummaryRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadSummaryHistory()
  }, [])

  const loadSummaryHistory = async () => {
    const result = await getSummaryHistory()
    if (result.success) {
      setSummaryHistory(result.summaries)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    if (text) {
      formData.append('text', text)
    } else if (file) {
      formData.append('file', file)
    }

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
      
      // Refresh history after new summary is generated
      await loadSummaryHistory()
    } catch (error) {
      console.error('Error:', error)
      setSummary('An error occurred while generating the summary.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Course Summary Generator</CardTitle>
          <CardDescription>Enter text or upload a file to generate a summary</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="text">Text Input</Label>
                <Textarea
                  id="text"
                  placeholder="Enter your course text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <Label htmlFor="file">Or Upload a File (PDF or DOC)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" onClick={handleSubmit} disabled={isLoading || (!text && !file)}>
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </CardFooter>
      </Card>

      {summary && (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{summary}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {showHistory && summaryHistory.length > 0 && (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Summary History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summaryHistory.map((record) => (
                <div 
                  key={record.id} 
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleString()}
                    </span>
                    {record.file_name && (
                      <span className="text-sm text-gray-500">
                        File: {record.file_name}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{record.summary_text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}