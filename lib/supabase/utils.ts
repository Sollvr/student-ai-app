import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface StoreCourseScheduleParams {
    courseName: string;
    file?: File;
    startDate: string;
    endDate: string;
    weeklyHours: number;
    sessionLength: number;
    scheduleData: {
        scheduleId: string;
        schedule: {
            overview: {
                totalSessions: number;
                totalHours: number;
                courseSummary: string;
            };
            sessions: Array<{
                date: string;
                duration: number;
                sessionNumber: number;
                learningObjectives: string[];
                topics: string[];
                materials: string[];
                preparation: string;
                notes: string;
            }>;
        };
    };
}

export async function storeCourseSchedule({
    courseName,
    file,
    startDate,
    endDate,
    weeklyHours,
    sessionLength,
    scheduleData
}: StoreCourseScheduleParams) {
    try {
        let filePath = null;

        // 1. If there's a file, upload it to Supabase Storage
        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            
            const { data: fileData, error: uploadError } = await supabase.storage
                .from('course-files')
                .upload(fileName, file)

            if (uploadError) throw uploadError
            filePath = fileData.path
        }

        // 2. Create course entry
        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .insert({
                name: courseName,
                file_path: filePath,
                start_date: startDate,
                end_date: endDate,
                weekly_hours: weeklyHours,
                session_length: sessionLength
            })
            .select()
            .single()

        if (courseError) throw courseError

        // 3. Create schedule entry
        const { data: scheduleData_, error: scheduleError } = await supabase
            .from('schedules')
            .insert({
                course_id: courseData.id,
                total_sessions: scheduleData.schedule.overview.totalSessions,
                total_hours: scheduleData.schedule.overview.totalHours,
                course_summary: scheduleData.schedule.overview.courseSummary
            })
            .select()
            .single()

        if (scheduleError) throw scheduleError

        // 4. Create sessions and related data
        for (const session of scheduleData.schedule.sessions) {
            // Create session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .insert({
                    schedule_id: scheduleData_.id,
                    session_number: session.sessionNumber,
                    date: session.date,
                    duration: session.duration,
                    preparation: session.preparation,
                    notes: session.notes
                })
                .select()
                .single()

            if (sessionError) throw sessionError

            // Insert learning objectives
            if (session.learningObjectives.length > 0) {
                const { error: objectivesError } = await supabase
                    .from('session_objectives')
                    .insert(
                        session.learningObjectives.map(objective => ({
                            session_id: sessionData.id,
                            objective
                        }))
                    )
                if (objectivesError) throw objectivesError
            }

            // Insert topics
            if (session.topics.length > 0) {
                const { error: topicsError } = await supabase
                    .from('session_topics')
                    .insert(
                        session.topics.map(topic => ({
                            session_id: sessionData.id,
                            topic
                        }))
                    )
                if (topicsError) throw topicsError
            }

            // Insert materials
            if (session.materials.length > 0) {
                const { error: materialsError } = await supabase
                    .from('session_materials')
                    .insert(
                        session.materials.map(material => ({
                            session_id: sessionData.id,
                            material
                        }))
                    )
                if (materialsError) throw materialsError
            }
        }

        return { success: true, courseId: courseData.id }
    } catch (error) {
        console.error('Error storing course schedule:', error)
        return { success: false, error }
    }
}