'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, BookOpen, FileText, Download, CheckCircle, Clock, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface LanguageLesson {
  id: string;
  title: string;
  content: string;
  type: string;
  duration: number;
  order: number;
  vocabulary?: string;
  phrases?: string;
  culturalNotes?: string;
  businessScenarios?: string;
  audioUrl?: string;
  videoUrl?: string;
  transcript?: string;
  exercises?: any;
  isCompleted?: boolean;
  completionTime?: number;
}

interface LanguageCourse {
  id: string;
  title: string;
  description: string;
  targetLanguage: string;
  sourceLanguage: string;
  level: string;
  category: string;
  instructor: string;
  duration: number;
  price: number;
  thumbnail?: string;
  videoUrl?: string;
  focusAreas?: string;
  businessContext?: string;
  lessons: LanguageLesson[];
  assessments: any[];
  _count: {
    enrollments: number;
    certificates: number;
  };
}

interface LanguagePlayerProps {
  courseId: string;
  userId: string;
}

const LanguagePlayer: React.FC<LanguagePlayerProps> = ({ courseId, userId }) => {
  const [course, setCourse] = useState<LanguageCourse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LanguageLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/language-courses/${courseId}`);
      const data = await response.json();
      setCourse(data);
      
      // Set first lesson as current
      if (data.lessons && data.lessons.length > 0) {
        setCurrentLesson(data.lessons[0]);
      }
      
      // Fetch user progress
      await fetchProgress();
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/language-progress?userId=${userId}&courseId=${courseId}`);
      const progressData = await response.json();
      
      const completed = new Set<string>();
      progressData.forEach((p: any) => {
        if (p.completed) {
          completed.add(p.lessonId);
        }
      });
      setCompletedLessons(completed);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleLessonChange = (lesson: LanguageLesson) => {
    setCurrentLesson(lesson);
    setIsPlaying(false);
    setProgress(0);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (value: number) => {
    setProgress(value);
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;

    try {
      const response = await fetch('/api/language-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          lessonId: currentLesson.id,
          completed: true,
          completionTime: currentLesson.duration,
        }),
      });

      if (response.ok) {
        setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
        // Move to next lesson
        const currentIndex = course?.lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex !== undefined && course && currentIndex < course.lessons.length - 1) {
          setCurrentLesson(course.lessons[currentIndex + 1]);
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleBookmark = async () => {
    // Implement bookmark functionality
    setBookmarked(!bookmarked);
  };

  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      'Hindi': '🇮🇳',
      'Mandarin': '🇨🇳',
      'Portuguese': '🇧🇷',
      'Russian': '🇷🇺',
      'English': '🌍',
    };
    return flags[language] || '🌍';
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="h-4 w-4" />;
      case 'AUDIO':
        return <Volume2 className="h-4 w-4" />;
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'INTERACTIVE':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading language course...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Course not found</h3>
          <p className="text-gray-500">The language course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const courseProgress = (completedLessons.size / course.lessons.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">
              {getLanguageFlag(course.targetLanguage)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600">
                {course.sourceLanguage} → {course.targetLanguage} • {course.level} • {course.category}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(courseProgress)}%
            </div>
          </div>
        </div>
        
        <Progress value={courseProgress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getContentTypeIcon(currentLesson.type)}
                  <span>{currentLesson.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {currentLesson.type}
                  </Badge>
                  <Badge>
                    {currentLesson.duration} min
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                  <TabsTrigger value="practice">Practice</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {/* Video/Audio Player */}
                  {(currentLesson.videoUrl || currentLesson.audioUrl) && (
                    <div className="bg-black rounded-lg overflow-hidden">
                      {currentLesson.videoUrl ? (
                        <div className="aspect-video flex items-center justify-center">
                          <div className="text-white text-center">
                            <Play className="h-16 w-16 mx-auto mb-4" />
                            <p>Video Player</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-900 p-8">
                          <div className="flex items-center justify-center gap-4">
                            <Button
                              onClick={handlePlayPause}
                              variant="secondary"
                              size="lg"
                            >
                              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </Button>
                            <div className="text-white">
                              <Volume2 className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Content */}
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  </div>

                  {/* Cultural Notes */}
                  {currentLesson.culturalNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">🌍 Cultural Notes</h4>
                      <p className="text-blue-800">{currentLesson.culturalNotes}</p>
                    </div>
                  )}

                  {/* Business Scenarios */}
                  {currentLesson.businessScenarios && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">💼 Business Scenarios</h4>
                      <div className="space-y-2">
                        {JSON.parse(currentLesson.businessScenarios || '[]').map((scenario: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-800">{scenario}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleBookmark}
                        className={bookmarked ? 'bg-blue-100' : ''}
                      >
                        {bookmarked ? '✓ Bookmarked' : 'Bookmark'}
                      </Button>
                      {currentLesson.transcript && (
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Transcript
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={handleCompleteLesson}
                      disabled={completedLessons.has(currentLesson.id)}
                      className={completedLessons.has(currentLesson.id) ? 'bg-green-600' : ''}
                    >
                      {completedLessons.has(currentLesson.id) ? '✓ Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="vocabulary" className="space-y-4">
                  {currentLesson.vocabulary && (
                    <div>
                      <h4 className="font-semibold mb-4">📚 Key Vocabulary</h4>
                      <div className="grid gap-3">
                        {JSON.parse(currentLesson.vocabulary || '[]').map((word: string, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="font-medium">{word}</div>
                            <div className="text-sm text-gray-600">Definition and pronunciation</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentLesson.phrases && (
                    <div>
                      <h4 className="font-semibold mb-4">💬 Common Phrases</h4>
                      <div className="grid gap-3">
                        {JSON.parse(currentLesson.phrases || '[]').map((phrase: string, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="font-medium">{phrase}</div>
                            <div className="text-sm text-gray-600">Usage and context</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="practice" className="space-y-4">
                  {currentLesson.exercises ? (
                    <div>
                      <h4 className="font-semibold mb-4">🎯 Practice Exercises</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm">
                          {JSON.stringify(currentLesson.exercises, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No practice exercises available for this lesson</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-4">📝 Your Notes</h4>
                    <Textarea
                      placeholder="Take notes while learning..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <Button className="mt-2">Save Notes</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{course._count.enrollments} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{course.duration} hours total</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{course._count.certificates} certificates</span>
              </div>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentLesson.id === lesson.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    } ${completedLessons.has(lesson.id) ? 'bg-green-50 border-green-200' : ''}`}
                    onClick={() => handleLessonChange(lesson)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {completedLessons.has(lesson.id) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{lesson.title}</div>
                          <div className="text-xs text-gray-500">
                            {lesson.type} • {lesson.duration} min
                          </div>
                        </div>
                      </div>
                      {getContentTypeIcon(lesson.type)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LanguagePlayer;