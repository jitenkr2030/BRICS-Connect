'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Pin, 
  Star, 
  Users, 
  BookOpen, 
  HelpCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  type: 'DISCUSSION' | 'QUESTION' | 'RESOURCE' | 'ANNOUNCEMENT';
  tags: string[];
  upvotes: number;
  downvotes: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  course?: {
    id: string;
    title: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
}

export default function CommunityForum() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'DISCUSSION' as const,
    tags: [] as string[],
  });

  useEffect(() => {
    fetchPosts();
  }, [filterType]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      
      const response = await fetch(`/api/community/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.title || !newPost.content) return;
    
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      
      if (response.ok) {
        setNewPost({ title: '', content: '', type: 'DISCUSSION', tags: [] });
        setShowCreatePost(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'DISCUSSION': return <MessageCircle className="h-4 w-4" />;
      case 'QUESTION': return <HelpCircle className="h-4 w-4" />;
      case 'RESOURCE': return <BookOpen className="h-4 w-4" />;
      case 'ANNOUNCEMENT': return <Star className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'DISCUSSION': return 'bg-blue-100 text-blue-800';
      case 'QUESTION': return 'bg-green-100 text-green-800';
      case 'RESOURCE': return 'bg-purple-100 text-purple-800';
      case 'ANNOUNCEMENT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">BRICS Community</h1>
        <Button onClick={() => setShowCreatePost(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Community Posts</TabsTrigger>
          <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="qna">Q&A</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="DISCUSSION">Discussions</SelectItem>
                      <SelectItem value="QUESTION">Questions</SelectItem>
                      <SelectItem value="RESOURCE">Resources</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Post Modal */}
          {showCreatePost && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Post Type</label>
                  <Select value={newPost.type} onValueChange={(value: any) => setNewPost({...newPost, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISCUSSION">Discussion</SelectItem>
                      <SelectItem value="QUESTION">Question</SelectItem>
                      <SelectItem value="RESOURCE">Resource</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    placeholder="Enter post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    placeholder="Write your post content..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createPost}>Create Post</Button>
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No posts found. Be the first to create one!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.user.avatar} />
                          <AvatarFallback>{post.user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{post.user.name}</p>
                            {post.isPinned && <Pin className="h-4 w-4 text-red-500" />}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                            {post.course && ` • ${post.course.title}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={getPostTypeColor(post.type)}>
                        <div className="flex items-center gap-1">
                          {getPostTypeIcon(post.type)}
                          {post.type}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <p className="text-gray-700 line-clamp-3">{post.content}</p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {post.upvotes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post._count.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {post.viewCount} views
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="study-groups" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Study Groups</h3>
              <p className="text-gray-500 mb-4">Join study groups to learn together with other BRICS community members.</p>
              <Button>Create Study Group</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community Contributions</h3>
              <p className="text-gray-500 mb-4">Contribute to the BRICS course content and help improve the learning experience.</p>
              <Button>Submit Contribution</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qna" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Questions & Answers</h3>
              <p className="text-gray-500 mb-4">Ask questions and get answers from the BRICS community.</p>
              <Button>Ask Question</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}