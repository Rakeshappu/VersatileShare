import { useState, useEffect } from 'react';
import { FileText, Video, Link as LinkIcon, Eye, Download, Clock, ExternalLink, ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { FacultyResource } from '../../types/faculty';
import { DocumentViewer } from '../document/DocumentViewer';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface ResourceItemProps {
  resource: FacultyResource;
}

export const ResourceItem = ({ resource }: ResourceItemProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(resource.stats?.likes || 0);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !resource.id) return;
      
      try {
        const response = await api.get(`/api/resources/${resource.id}/like-status`);
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error('Failed to check like status:', error);
      }
    };
    
    checkLikeStatus();
  }, [resource.id, user]);
  
  const getIcon = () => {
    switch (resource.type) {
      case 'document':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const handleDownload = () => {
    if (resource.type === 'link' && resource.link) {
      // Open link in new tab
      window.open(resource.link, '_blank');
    } else if (resource.fileContent || resource.fileUrl) {
      // For documents, show the document viewer instead of downloading
      setShowDocViewer(true);
      
      // Update view/download count
      updateResourceStats('download');
    } else {
      console.error('No file content or URL available for this resource');
      toast.error('Sorry, this file cannot be opened. It may have been corrupted during upload.');
    }
  };
  
  const updateResourceStats = async (action: 'view' | 'download' | 'like' | 'comment') => {
    if (!user) {
      toast.error('Please log in to interact with resources');
      return null;
    }
    
    try {
      // Update stats in memory
      if (window.sharedResources) {
        const resourceIndex = window.sharedResources.findIndex(r => r.id === resource.id);
        if (resourceIndex !== -1) {
          if (action === 'download') {
            window.sharedResources[resourceIndex].stats.downloads += 1;
          } else if (action === 'view') {
            window.sharedResources[resourceIndex].stats.views += 1;
          } else if (action === 'like') {
            window.sharedResources[resourceIndex].stats.likes += isLiked ? -1 : 1;
          } else if (action === 'comment') {
            window.sharedResources[resourceIndex].stats.comments += 1;
          }
          window.sharedResources[resourceIndex].stats.lastViewed = new Date().toISOString();
        }
      }
      
      // Update stats in MongoDB
      const response = await api.post('/api/resources/stats', {
        resourceId: resource.id,
        action: action,
        userId: user._id
      });
      
      console.log(`Resource ${action} recorded:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update resource ${action} stats:`, error);
      return null;
    }
  };
  
  const handleView = () => {
    setShowPreview(!showPreview);
    
    // Update view count
    if (!showPreview) {
      updateResourceStats('view');
    }
  };
  
  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like resources');
      return;
    }
    
    try {
      setIsLoading(true);
      // We need to include the token in the headers
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${resource.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ like: !isLiked })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setIsLiked(!isLiked);
      setLikesCount(data.likesCount || (isLiked ? likesCount - 1 : likesCount + 1));
      toast.success(isLiked ? 'Removed like' : 'Added like');
      
      // Update the stats
      updateResourceStats('like');
    } catch (error) {
      console.error('Failed to like resource:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleComments = async () => {
    setShowComments(!showComments);
    
    if (!showComments && comments.length === 0) {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/resources/${resource.id}/comments`);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    
    try {
      setIsLoading(true);
      // Use fetch with explicit headers instead of axios
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${resource.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to add comment:', errorData);
        throw new Error(errorData.error || 'Failed to add comment');
      }
      
      const data = await response.json();
      const newComment = data.comment;
      
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      updateResourceStats('comment');
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-3 hover:bg-gray-50">
      <div className="flex items-start">
        <div className="p-2 bg-gray-100 rounded-md">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="font-medium text-gray-800 cursor-pointer hover:text-indigo-600" onClick={handleView}>
            {resource.title}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-1">{resource.description}</p>
          
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{resource.stats.views} views</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Download className="h-3 w-3 mr-1" />
              <span>{resource.stats.downloads}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-3 space-x-4">
            <button 
              className={`flex items-center text-sm ${isLiked ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-700`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${isLiked ? 'fill-blue-600' : ''}`} />
              <span>{likesCount}</span>
            </button>
            
            <button 
              className="flex items-center text-sm text-gray-600 hover:text-blue-700"
              onClick={handleToggleComments}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{comments.length || resource.stats.comments || 0}</span>
            </button>
          </div>
        </div>
        <button 
          className="ml-2 p-2 text-indigo-600 hover:text-indigo-700"
          onClick={handleDownload}
          title={resource.type === 'link' ? 'Open Link' : 'View/Download'}
        >
          {resource.type === 'link' ? <ExternalLink className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </button>
      </div>
      
      {showPreview && (
        <div className="mt-3 p-3 border rounded-lg">
          {resource.type === 'document' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {resource.fileName || 'Document'}
              </span>
              <button 
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                onClick={handleDownload}
              >
                Open Document
              </button>
            </div>
          )}
          {resource.type === 'link' && resource.link && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate flex-1">{resource.link}</span>
              <button 
                className="ml-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium whitespace-nowrap"
                onClick={handleDownload}
              >
                Open Link
              </button>
            </div>
          )}
        </div>
      )}
      
      {showComments && (
        <div className="mt-3 p-3 border rounded-lg bg-gray-50">
          <h5 className="font-medium text-gray-700 mb-2">Comments</h5>
          
          <div className="flex items-center mb-4">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded-l-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              className="bg-indigo-600 text-white py-2 px-3 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleAddComment}
              disabled={isLoading || !commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          {isLoading && comments.length === 0 ? (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment, index) => (
                <div key={index} className="bg-white p-2 rounded border">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold text-sm">
                        {comment.author.fullName.charAt(0)}
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium">{comment.author?.fullName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
      
      {showDocViewer && resource.fileUrl && (
        <DocumentViewer 
          fileUrl={resource.fileUrl} 
          fileName={resource.fileName || `${resource.title}.pdf`}
          onClose={() => setShowDocViewer(false)}
        />
      )}
    </div>
  );
};