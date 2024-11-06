'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SummaryPage() {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        </Card>
      )}
    </div>
  )
}