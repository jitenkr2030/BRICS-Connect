'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  Download,
  Volume2,
  Settings,
  Bookmark,
  MessageCircle,
  ThumbsUp,
  Award,
  Target
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  level: string;
  keyTopics: string[];
  modules: string[];
  outcomes: string[];
  thumbnail?: string;
  videoUrl?: string;
  materials?: string[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  contentType: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'DOWNLOAD';
  contentUrl?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
  isRequired: boolean;
  materials?: string[];
  quizQuestions?: any[];
  assignmentData?: any;
}

interface CourseProgress {
  id: string;
  progress: number;
  timeSpent: number;
  lastPosition?: number;
  notes?: string;
  isCompleted: boolean;
}

export default function CoursePlayer() {
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    // Load course data (in production, this would come from API)
    const mockCourse: Course = {
      id: 'course-1',
      title: 'BRICS for Normal People',
      description: 'What BRICS really means for your job, business, or future',
      instructor: 'Dr. Raj Kumar',
      duration: 180,
      level: 'LEVEL_1_FREE',
      keyTopics: ['BRICS Overview', 'Economic Impact', 'Business Opportunities', 'Future Trends'],
      modules: ['Introduction', 'What is BRICS', 'Why BRICS Exists', 'How BRICS Affects You', 'Myths vs Reality'],
      outcomes: ['Understand BRICS basics', 'Identify opportunities', 'Navigate challenges'],
      thumbnail: '/images/courses/brics-basics.jpg',
      videoUrl: '/videos/brics-intro.mp4',
      materials: ['/pdfs/brics-handbook.pdf', '/slides/brics-intro.pptx']
    };

    const mockChapters: Chapter[] = [
      {
        id: 'chapter-1',
        title: 'Introduction to BRICS',
        description: 'Learn the basics of what BRICS is and why it matters',
        contentType: 'VIDEO',
        contentUrl: '/videos/brics-intro.mp4',
        duration: 25,
        order: 1,
        isPreview: true,
        isRequired: true,
        materials: ['/pdfs/chapter1-notes.pdf']
      },
      {
        id: 'chapter-2',
        title: 'What is BRICS (Simple Explanation)',
        description: 'Understanding BRICS in simple, non-political terms',
        contentType: 'VIDEO',
        contentUrl: '/videos/what-is-brics.mp4',
        duration: 35,
        order: 2,
        isPreview: false,
        isRequired: true
      },
      {
        id: 'chapter-3',
        title: 'Why BRICS Exists',
        description: 'The problems BRICS aims to solve',
        contentType: 'TEXT',
        contentUrl: '/content/why-brics-exists.html',
        duration: 20,
        order: 3,
        isPreview: false,
        isRequired: true
      },
      {
        id: 'chapter-4',
        title: 'How BRICS Affects Prices',
        description: 'Understanding the economic impact on daily life',
        contentType: 'VIDEO',
        contentUrl: '/videos/brics-prices.mp4',
        duration: 30,
        order: 4,
        isPreview: false,
        isRequired: true
      },
      {
        id: 'chapter-5',
        title: 'BRICS and Jobs',
        description: 'Employment opportunities in the BRICS economy',
        contentType: 'VIDEO',
        contentUrl: '/videos/brics-jobs.mp4',
        duration: 25,
        order: 5,
        isPreview: false,
        isRequired: true
      },
      {
        id: 'chapter-6',
        title: 'Business Opportunities',
        description: 'How to leverage BRICS for business growth',
        contentType: 'VIDEO',
        contentUrl: '/videos/brics-business.mp4',
        duration: 30,
        order: 6,
        isPreview: false,
        isRequired: true
      },
      {
        id: 'chapter-7',
        title: 'Myths vs Reality',
        description: 'Debunking common misconceptions about BRICS',
        contentType: 'QUIZ',
        contentUrl: '/quizzes/brics-myths.html',
        duration: 15,
        order: 7,
        isPreview: false,
        isRequired: true,
        quizQuestions: [
          {
            question: 'BRICS is a political organization',
            options: ['True', 'False'],
            correct: 1
          }
        ]
      }
    ];

    const mockProgress: CourseProgress = {
      id: 'progress-1',
      progress: 45,
      timeSpent: 82,
      lastPosition: 450,
      notes: 'Interesting points about economic cooperation',
      isCompleted: false
    };

    setCourse(mockCourse);
    setChapters(mockChapters);
    setCurrentChapter(mockChapters[0]);
    setProgress(mockProgress);
  }, []);

  const handleChapterSelect = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
  };

  const handleBookmark = () => {
    const bookmark = {
      id: Date.now().toString(),
      timestamp: progress?.lastPosition || 0,
      chapter: currentChapter?.title,
      note: userNotes
    };
    setBookmarks([...bookmarks, bookmark]);
  };

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(prev => prev ? {...prev, progress: newProgress} : null);
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'VIDEO': return <Play className="h-4 w-4" />;
      case 'TEXT': return <BookOpen className="h-4 w-4" />;
      case 'QUIZ': return <CheckCircle className="h-4 w-4" />;
      case 'ASSIGNMENT': return <Target className="h-4 w-4" />;
      case 'DOWNLOAD': return <Download className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!course) {
    return <div className="flex items-center justify-center h-64">Loading course...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{course.instructor}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {formatTime(course.duration)}
            </div>
            <Badge variant="outline">{course.level}</Badge>
          </div>
        </div>
        <Button variant="outline">
          <Award className="h-4 w-4 mr-2" />
          Certificate
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-gray-500">{progress?.progress || 0}% Complete</span>
          </div>
          <Progress value={progress?.progress || 0} className="h-2" />
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>{chapters.filter(c => c.isRequired).length} chapters</span>
            <span>{formatTime(progress?.timeSpent || 0)} completed</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Player */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              {/* Video Player Area */}
              <div className="relative bg-black aspect-video rounded-t-lg">
                {currentChapter?.contentType === 'VIDEO' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg">{currentChapter.title}</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {getContentTypeIcon(currentChapter?.contentType || 'TEXT')}
                      <p className="text-lg mt-2">{currentChapter?.title}</p>
                    </div>
                  </div>
                )}

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4 text-white">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:text-white"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm">Speed:</span>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                        className="bg-black/50 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={handleBookmark}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{currentChapter?.title}</h3>
                <p className="text-gray-600 mb-4">{currentChapter?.description}</p>
                
                {currentChapter?.materials && currentChapter.materials.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Chapter Materials:</h4>
                    <div className="space-y-2">
                      {currentChapter.materials.map((material, index) => (
                        <Button key={index} variant="outline" size="sm" className="w-full justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          {material.split('/').pop()}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Features */}
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Take notes while watching..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button>Save Notes</Button>
                    <Button variant="outline">Export Notes</Button>
                  </div>
                  
                  {bookmarks.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Bookmarks</h4>
                      <div className="space-y-2">
                        {bookmarks.map((bookmark) => (
                          <div key={bookmark.id} className="flex items-center gap-2 text-sm">
                            <Bookmark className="h-4 w-4 text-blue-500" />
                            <span>{bookmark.timestamp}s - {bookmark.chapter}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chapter Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No discussion yet. Be the first to ask a question!</p>
                    <Button className="mt-4">Ask Question</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Transcript not available for this chapter.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Course Content Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentChapter?.id === chapter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChapterSelect(chapter)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getContentTypeIcon(chapter.contentType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{chapter.title}</h4>
                        {chapter.isPreview && (
                          <Badge variant="outline" className="text-xs">Preview</Badge>
                        )}
                        {progress && progress.progress > (index + 1) * (100 / chapters.length) && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Chapter {index + 1}</span>
                        {chapter.duration && <span>• {formatTime(chapter.duration)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About This Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">What you'll learn</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {course.outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Key Topics</h4>
                <div className="flex flex-wrap gap-1">
                  {course.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Course Materials</h4>
                <div className="space-y-2">
                  {course.materials?.map((material, index) => (
                    <Button key={index} variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      {material.split('/').pop()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}