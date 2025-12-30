'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, Users, Star, ChevronRight, Globe, Award, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorBio?: string;
  instructorAvatar?: string;
  instructorTitle?: string;
  category: string;
  subcategory?: string;
  level: string;
  courseLevel: string;
  language: string;
  languages: string[];
  duration: number;
  estimatedHours?: number;
  price: number;
  currency: string;
  originalPrice?: number | null;
  priceTier: string;
  thumbnail?: string;
  previewUrl?: string;
  targetAudience: string[];
  keyTopics: string[];
  outcomes: string[];
  isFeatured: boolean;
  isCertificate: boolean;
  certificateType?: string;
  tags: string[];
  difficulty: string;
  accessType: string;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  completionRate: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  _count: {
    enrollments: number;
    reviews: number;
    chapters: number;
  };
}

interface CourseCatalogProps {
  onCourseSelect?: (course: Course) => void;
  onEnroll?: (courseId: string) => void;
  userId?: string;
}

export default function CourseCatalog({ onCourseSelect, onEnroll, userId }: CourseCatalogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showCertifiedOnly, setShowCertifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'all',
    'BRICS Fundamentals',
    'Business Skills',
    'Financial Skills',
    'Practical Skills',
    'Advanced Skills',
    'Country Playbooks'
  ];

  const levels = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const courseLevels = ['all', 'LEVEL_1_FREE', 'LEVEL_2_FOUNDATION', 'LEVEL_3_PRACTICAL', 'LEVEL_4_ADVANCED', 'COMMUNITY'];
  const languages = ['all', 'en', 'hi', 'pt', 'zh', 'ru'];
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  useEffect(() => {
    fetchCourses();
  }, [currentPage, sortBy]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel, selectedCourseLevel, selectedLanguage, priceRange, showFreeOnly, showCertifiedOnly]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy
      });

      const response = await fetch(`/api/courses?${params}`);
      const data = await response.json();
      
      if (data.courses) {
        setCourses(data.courses);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.keyTopics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Course level filter
    if (selectedCourseLevel !== 'all') {
      filtered = filtered.filter(course => course.courseLevel === selectedCourseLevel);
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(course => 
        course.language === selectedLanguage || course.languages.includes(selectedLanguage)
      );
    }

    // Price range filter
    filtered = filtered.filter(course => 
      course.price >= priceRange[0] && course.price <= priceRange[1]
    );

    // Free only filter
    if (showFreeOnly) {
      filtered = filtered.filter(course => course.price === 0);
    }

    // Certified only filter
    if (showCertifiedOnly) {
      filtered = filtered.filter(course => course.isCertificate);
    }

    setFilteredCourses(filtered);
  };

  const getCourseLevelColor = (level: string) => {
    switch (level) {
      case 'LEVEL_1_FREE': return 'bg-green-100 text-green-800';
      case 'LEVEL_2_FOUNDATION': return 'bg-blue-100 text-blue-800';
      case 'LEVEL_3_PRACTICAL': return 'bg-orange-100 text-orange-800';
      case 'LEVEL_4_ADVANCED': return 'bg-purple-100 text-purple-800';
      case 'COMMUNITY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCourseLevelLabel = (level: string) => {
    switch (level) {
      case 'LEVEL_1_FREE': return 'Level 1: Free';
      case 'LEVEL_2_FOUNDATION': return 'Level 2: Foundation';
      case 'LEVEL_3_PRACTICAL': return 'Level 3: Practical';
      case 'LEVEL_4_ADVANCED': return 'Level 4: Advanced';
      case 'COMMUNITY': return 'Community';
      default: return level;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleEnroll = async (courseId: string) => {
    if (onEnroll) {
      onEnroll(courseId);
    } else {
      // Default enrollment logic
      try {
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId || 'demo-user',
            courseId: courseId,
            paymentStatus: 'PAID',
            amountPaid: 0,
            currency: 'INR'
          })
        });

        if (response.ok) {
          alert('Enrolled successfully!');
          fetchCourses(); // Refresh courses
        } else {
          alert('Enrollment failed');
        }
      } catch (error) {
        console.error('Enrollment error:', error);
        alert('Enrollment failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BRICS Learning Academy</h1>
              <p className="text-gray-600 mt-2">Master cross-border business with BRICS countries</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {filteredCourses.length} Courses
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {courses.reduce((sum, course) => sum + course.enrollmentCount, 0)} Students
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Course Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Level
                  </label>
                  <Select value={selectedCourseLevel} onValueChange={setSelectedCourseLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courseLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level === 'all' ? 'All Levels' : getCourseLevelLabel(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level === 'all' ? 'All Levels' : level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language} value={language}>
                          {language === 'all' ? 'All Languages' : language.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    step={100}
                    className="mt-2"
                  />
                </div>

                {/* Additional Filters */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="free-only"
                      checked={showFreeOnly}
                      onCheckedChange={setShowFreeOnly}
                    />
                    <label htmlFor="free-only" className="text-sm text-gray-700">
                      Free courses only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certified-only"
                      checked={showCertifiedOnly}
                      onCheckedChange={setShowCertifiedOnly}
                    />
                    <label htmlFor="certified-only" className="text-sm text-gray-700">
                      Certificate courses only
                    </label>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      {course.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {course.isCertificate && (
                        <Badge className="absolute top-2 right-2 bg-purple-500">
                          <Award className="w-3 h-3 mr-1" />
                          Certificate
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge className={getCourseLevelColor(course.courseLevel)}>
                          {getCourseLevelLabel(course.courseLevel)}
                        </Badge>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Instructor:</span>
                          <span className="font-medium">{course.instructor}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.estimatedHours || Math.ceil(course.duration / 60)}h
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Students:</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.enrollmentCount}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rating:</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {course.rating.toFixed(1)} ({course.reviewCount})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Languages:</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {course.languages.length > 0 ? course.languages.join(', ') : course.language}
                          </span>
                        </div>

                        {course.keyTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.keyTopics.slice(0, 3).map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {course.keyTopics.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{course.keyTopics.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatPrice(course.price, course.currency)}
                          </div>
                          {course.originalPrice && course.originalPrice > course.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(course.originalPrice, course.currency)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {course.previewUrl && (
                            <Button variant="outline" size="sm">
                              Preview
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => onCourseSelect ? onCourseSelect(course) : console.log('View course:', course.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      {userId && (
                        <Button 
                          className="w-full"
                          onClick={() => handleEnroll(course.id)}
                        >
                          Enroll Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}