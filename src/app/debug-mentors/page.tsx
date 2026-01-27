"use client"
import { useEffect, useState } from 'react'

export default function DebugMentorsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/admin/mentors')
                const json = await response.json()
                setData(json)
                console.log('Mentors API Response:', json)
                
                // Check for mentors without IDs
                if (json.mentors) {
                    const withoutIds = json.mentors.filter((m: any) => !m.id)
                    console.log('Mentors without IDs:', withoutIds)
                    console.log('Total mentors:', json.mentors.length)
                    console.log('Sample mentor:', json.mentors[0])
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Mentors API</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}