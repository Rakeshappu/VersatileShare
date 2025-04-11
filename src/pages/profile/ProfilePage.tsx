import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2, Building, GraduationCap, Book, ChevronRight, Award, FileText, Settings, Camera, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 50 
    }
  }
};

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
    department: '',
    batch: '2025',
    degree: 'B.E Information Science'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        gender: user.gender || 'Male',
        batch: user.batch || '2025',
        degree: user.degree || 'B.E Information Science'
      }));
      
      setProfileImage(
        user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=random`
      );
    }
  }, [user]);

  const handleEditToggle = async (section: string) => {
    if (editing === section) {
      setEditing(null);
      
      if (section === 'personal') {
        await saveProfileChanges();
      }
    } else {
      setEditing(section);
    }
  };

  const saveProfileChanges = async () => {
    setIsLoading(true);
    
    try {
      console.log('Saving profile with data:', {
        ...formData,
        avatar: profileImage.startsWith('data:') ? profileImage : undefined
      });
      
      const response = await api.put('/api/user/profile', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        gender: formData.gender,
        batch: formData.batch,
        degree: formData.degree,
        avatar: profileImage.startsWith('data:') ? profileImage : undefined // Only send if it's a new base64 image
      });
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        
        // Update local storage user data to reflect changes
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          department: formData.department,
          gender: formData.gender,
          batch: formData.batch,
          degree: formData.degree,
          avatar: response.data.user.avatar || currentUser.avatar
        };
        
        // Save updated user to local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
         // Update the auth context - ensures all components using the user context are updated
         if (updateUser) {
          updateUser(updatedUser);
          
          // Dispatch a custom event that other components can listen for
          const profileUpdateEvent = new CustomEvent('profileUpdated', {
            detail: { 
              user: updatedUser,
              avatar: updatedUser.avatar
            }
          });
          document.dispatchEvent(profileUpdateEvent);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const ProfileSection = ({ title, children, id }: { title: string, children: React.ReactNode, id: string }) => (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-lg shadow p-6 mb-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${editing === id ? 'bg-indigo-600 text-white px-3 py-1 rounded' : 'text-indigo-600'} hover:${editing === id ? 'bg-indigo-700' : 'text-indigo-700'} disabled:opacity-50 transition-colors duration-200`}
          onClick={() => handleEditToggle(id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
          ) : editing === id ? (
            'Save'
          ) : (
            <Edit2 className="h-5 w-5" />
          )}
        </motion.button>
      </div>
      {children}
    </motion.div>
  );

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <motion.div 
      variants={itemVariants}
      className="flex items-center space-x-3 mb-4"
    >
      <Icon className="h-5 w-5 text-gray-400" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col items-center sm:flex-row sm:items-start hover:shadow-md transition-shadow duration-300"
        >
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            </motion.div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <motion.h1 
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900"
            >
              {user?.fullName}
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600"
            >
              {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Student"}
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-center sm:justify-start mt-2 space-x-2"
            >
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
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-lg shadow p-6 mb-6 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${editing === 'personal' ? 'bg-indigo-600 text-white px-3 py-1 rounded' : 'text-indigo-600'} hover:${editing === 'personal' ? 'bg-indigo-700' : 'text-indigo-700'} disabled:opacity-50 transition-colors duration-200`}
              onClick={() => handleEditToggle('personal')}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
              ) : editing === 'personal' ? (
                'Save'
              ) : (
                <Edit2 className="h-5 w-5" />
              )}
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              {editing === 'personal' ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.fullName}</p>
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {editing === 'personal' ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 bg-gray-100"
                  disabled
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              {editing === 'personal' ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.phoneNumber || "Not set"}</p>
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              {editing === 'personal' ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleSelectChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formData.gender}</p>
              )}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 mb-4">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Campus</p>
                  <p className="text-sm font-medium text-gray-900">PES College of Engineering</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <GraduationCap className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Batch</p>
                  {editing === 'personal' ? (
                    <input
                      type="text"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-1 px-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{formData.batch}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <Book className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  {editing === 'personal' ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-1 px-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{formData.department}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <GraduationCap className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Degree</p>
                  {editing === 'personal' ? (
                    <input
                      type="text"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-1 px-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 transition-colors duration-200"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{formData.degree}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/profile/academic" className="block bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-6 w-6 text-gray-400" />
                    <h2 className="text-xl font-semibold text-gray-800">Academic Information</h2>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;