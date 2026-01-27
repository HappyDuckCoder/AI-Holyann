"use client"
import { useState, useEffect } from 'react'

export default function TestAPIPage() {
    const [studentsData, setStudentsData] = useState(null)
    const [mentorsData, setMentorsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        const testAPIs = async () => {
            try {
                setLoading(true)
                
                // Test students API
                try {
                    const studentsResponse = await fetch('/api/admin/students')
                    if (studentsResponse.ok) {
                        const data = await studentsResponse.json()
                        setStudentsData(data)
                    } else {
                        const errorText = await studentsResponse.text()
                        setErrors(prev => ({...prev, students: `${studentsResponse.status}: ${errorText}`}))
                    }
                } catch (error) {
                    setErrors(prev => ({...prev, students: error.message}))
                }

                // Test mentors API
                try {
                    const mentorsResponse = await fetch('/api/admin/mentors')
                    if (mentorsResponse.ok) {
                        const data = await mentorsResponse.json()
                        setMentorsData(data)
                    } else {
                        const errorText = await mentorsResponse.text()
                        setErrors(prev => ({...prev, mentors: `${mentorsResponse.status}: ${errorText}`}))
                    }
                } catch (error) {
                    setErrors(prev => ({...prev, mentors: error.message}))
                }
                
            } catch (error) {
                console.error('Test error:', error)
            } finally {
                setLoading(false)
            }
        }

        testAPIs()
    }, [])

    if (loading) return <div className="p-8">Testing APIs...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">API Test Results</h1>
            
            {/* Students API */}
            <div className="mb-8 p-6 border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Students API (/api/admin/students)</h2>
                {errors.students ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded">
                        <strong>Error:</strong> {errors.students}
                    </div>
                ) : (
                    <div className="text-green-600 bg-green-50 p-4 rounded">
                        <strong>Success!</strong>
                        <pre className="mt-2 text-sm overflow-auto">
                            {JSON.stringify(studentsData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Mentors API */}
            <div className="mb-8 p-6 border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Mentors API (/api/admin/mentors)</h2>
                {errors.mentors ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded">
                        <strong>Error:</strong> {errors.mentors}
                    </div>
                ) : (
                    <div className="text-green-600 bg-green-50 p-4 rounded">
                        <strong>Success!</strong>
                        <pre className="mt-2 text-sm overflow-auto">
                            {JSON.stringify(mentorsData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}