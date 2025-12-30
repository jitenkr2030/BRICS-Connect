'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, Users, Clock, Star, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

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
  originalPrice?: number;
  thumbnail?: string;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  isFeatured: boolean;
  tags?: string[];
  focusAreas?: string[];
  businessContext?: string[];
  _count: {
    enrollments: number;
    lessons: number;
  };
}

const LanguageLearningCatalog: React.FC = () => {
  const [courses, setCourses] = useState<LanguageCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<LanguageCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState('');
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Language options
  const languages = [
    { value: 'Hindi', label: 'हिन्दी (Hindi)' },
    { value: 'Mandarin', label: '中文 (Mandarin)' },
    { value: 'Portuguese', label: 'Português' },
    { value: 'Russian', label: 'Русский (Russian)' },
    { value: 'English', label: 'English' },
  ];

  const categories = [
    { value: 'Business', label: 'Business' },
    { value: 'Culture', label: 'Culture' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Technical', label: 'Technical' },
  ];

  const levels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedTargetLanguage, selectedSourceLanguage, selectedLevel, selectedCategory, priceRange, showFeaturedOnly, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/language-courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching language courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses.filter(course => {
      // Search filter
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !course.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !course.instructor.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Target language filter
      if (selectedTargetLanguage && course.targetLanguage !== selectedTargetLanguage) {
        return false;
      }

      // Source language filter
      if (selectedSourceLanguage && course.sourceLanguage !== selectedSourceLanguage) {
        return false;
      }

      // Level filter
      if (selectedLevel && course.level !== selectedLevel) {
        return false;
      }

      // Category filter
      if (selectedCategory && course.category !== selectedCategory) {
        return false;
      }

      // Price range filter
      if (course.price < priceRange[0] || course.price > priceRange[1]) {
        return false;
      }

      // Featured filter
      if (showFeaturedOnly && !course.isFeatured) {
        return false;
      }

      return true;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return b.studentCount - a.studentCount;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch('/api/language-enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user', // Replace with actual user ID
          courseId,
        }),
      });

      if (response.ok) {
        alert('Successfully enrolled in course!');
        fetchCourses(); // Refresh courses to update enrollment counts
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
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

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'INTERMEDIATE': 'bg-blue-100 text-blue-800',
      'ADVANCED': 'bg-purple-100 text-purple-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading language courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Globe className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">BRICS Language Learning</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Master languages for business success across BRICS nations. Learn Hindi, Mandarin, Portuguese, Russian, and Business English.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Target Language */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Language</label>
                <Select value={selectedTargetLanguage} onValueChange={setSelectedTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Languages</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source Language */}
              <div>
                <label className="block text-sm font-medium mb-2">Source Language</label>
                <Select value={selectedSourceLanguage} onValueChange={setSelectedSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Languages</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Featured Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={showFeaturedOnly}
                  onCheckedChange={setShowFeaturedOnly}
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured courses only
                </label>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Grid */}
        <div className="lg:w-3/4">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {filteredCourses.length} Language Courses Found
            </h2>
          </div>

          {/* Course Cards */}
          <div className="grid gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Course Image */}
                  <div className="md:w-1/3">
                    <div className="h-48 md:h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <div className="text-4xl mb-2">
                          {getLanguageFlag(course.targetLanguage)}
                        </div>
                        <div className="text-lg font-semibold">
                          {course.sourceLanguage} → {course.targetLanguage}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {course.isFeatured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                          <Badge variant="outline">
                            {course.category}
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.studentCount} students
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration} hours
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {course._count.lessons} lessons
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {course.rating.toFixed(1)} ({course.reviewCount})
                          </div>
                        </div>

                        {/* Focus Areas */}
                        {course.focusAreas && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Focus Areas:</div>
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(course.focusAreas || '[]').map((area: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Business Context */}
                        {course.businessContext && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Business Context:</div>
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(course.businessContext || '[]').map((context: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {context}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="text-right ml-6">
                        <div className="mb-2">
                          {course.originalPrice && (
                            <span className="text-gray-400 line-through text-sm">
                              ₹{course.originalPrice}
                            </span>
                          )}
                          <div className="text-2xl font-bold text-blue-600">
                            ₹{course.price}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-3">
                          by {course.instructor}
                        </div>
                        <Button
                          onClick={() => handleEnroll(course.id)}
                          className="w-full md:w-auto"
                        >
                          Enroll Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageLearningCatalog;