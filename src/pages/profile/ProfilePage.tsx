
import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2, Building, GraduationCap, Book, ChevronRight, Award, FileText, Settings, Camera, Mail, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    gender: 'Male',
    department: user?.department || '',
    batch: '2025',
    degree: 'B.E Information Science'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string>(
    user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=random`
  );

  const handleEditToggle = (section: string) => {
    if (editing === section) {
      setEditing(null);
      // Here you would normally save changes to the backend
      toast.success('Profile updated successfully!');
    } else {
      setEditing(section);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const ProfileSection = ({ title, children, id }: { title: string, children: React.ReactNode, id: string }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <button 
          className={`${editing === id ? 'bg-indigo-600 text-white px-3 py-1 rounded' : 'text-indigo-600'} hover:${editing === id ? 'bg-indigo-700' : 'text-indigo-700'}`}
          onClick={() => handleEditToggle(id)}
        >
          {editing === id ? 'Save' : <Edit2 className="h-5 w-5" />}
        </button>
      </div>
      {children}
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center space-x-3 mb-4">
      <Icon className="h-5 w-5 text-gray-400" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col items-center sm:flex-row sm:items-start">
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
              onClick={handleImageClick}
            >
              <img 
                src={profileImage} 
                alt={user?.fullName || "User"} 
                className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
            <p className="text-gray-600">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "Student"}</p>
            <div className="flex flex-wrap justify-center sm:justify-start mt-2 space-x-2">
              {user?.email && (
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </div>
              )}
              {user?.phoneNumber && (
                <div className="flex items-center text-sm text-gray-500 ml-4">
                  <Phone className="h-4 w-4 mr-1" />
                  {user.phoneNumber}
                </div>
              )}
            </div>
          </div>
        </div>

        <ProfileSection title="Personal Information" id="personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              {editing === 'personal' ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {editing === 'personal' ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              {editing === 'personal' ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.phoneNumber || "Not set"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              {editing === 'personal' ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.gender}</p>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={Building} label="Campus" value="PES College of Engineering" />
              <InfoItem icon={GraduationCap} label="Batch" value={formData.batch} />
              <InfoItem icon={Book} label="Department" value={formData.department} />
              <InfoItem icon={GraduationCap} label="Degree" value={formData.degree} />
            </div>
          </div>
        </ProfileSection>

        <div className="space-y-4">
          <Link to="/profile/academic" className="block bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-800">Academic Information</h2>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link to="/profile/resume" className="block bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-800">Resume</h2>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link to="/profile/rewards" className="block bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-800">Rewards</h2>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link to="/settings" className="block bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
