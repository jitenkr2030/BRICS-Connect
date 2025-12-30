'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, Star, Users } from 'lucide-react'

interface EducationComponentProps {
  userId: string
}

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  level: string
  duration: number
  price: number
  currency: string
  rating: number
  reviewCount: number
  enrollmentCount: number
}

export default function EducationComponent({ userId }: EducationComponentProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Cross-Border Trade Management',
        description: 'Learn the fundamentals of international trade within BRICS nations',
        instructor: 'Dr. Maria Silva',
        level: 'INTERMEDIATE',
        duration: 240,
        price: 299,
        currency: 'CNY',
        rating: 4.8,
        reviewCount: 156,
        enrollmentCount: 1234
      },
      {
        id: '2',
        title: 'Digital Currency Integration',
        description: 'Understanding CBDCs and cryptocurrency in BRICS economies',
        instructor: 'Prof. Li Wei',
        level: 'ADVANCED',
        duration: 360,
        price: 499,
        currency: 'CBDC',
        rating: 4.9,
        reviewCount: 89,
        enrollmentCount: 567
      },
      {
        id: '3',
        title: 'Supply Chain Optimization',
        description: 'Modern supply chain strategies for global trade',
        instructor: 'Dr. Raj Patel',
        level: 'BEGINNER',
        duration: 180,
        price: 0,
        currency: 'CNY',
        rating: 4.6,
        reviewCount: 234,
        enrollmentCount: 2890
      }
    ]
    
    setCourses(mockCourses)
    setIsLoading(false)
  }, [userId])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">BRICS Learning Academy</h2>
        <p className="text-gray-600 mb-4">
          Upskill with courses designed for cross-border business success
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Available Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {course.instructor}
                    </CardDescription>
                  </div>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(course.duration)}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrollmentCount}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {course.price === 0 ? 'Free' : `${course.price} ${course.currency}`}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{course.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          {course.reviewCount} reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button size="sm" className="w-full">
                    {course.price === 0 ? 'Enroll for Free' : `Enroll for ${course.price} ${course.currency}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}