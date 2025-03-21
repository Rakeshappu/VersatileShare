//src\lib\api\routes.ts
export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/api/auth/signup', 
    LOGIN: '/api/auth/login',    
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
    GOOGLE: '/api/auth/google',
    ME: '/api/auth/me',
    VERIFY_OTP: '/api/auth/verify-otp',
    SEND_OTP: '/api/auth/send-otp',
  },
  
  RESOURCES: {
    LIST: '/api/resources',
    CREATE: '/api/resources',
    GET: (id: string) => `/api/resources/${id}`,
    UPDATE: (id: string) => `/api/resources/${id}`,
    DELETE: (id: string) => `/api/resources/${id}`,
    STATS: '/api/resources/stats',
    SEARCH: '/api/resources/search',
    BY_SEMESTER: '/api/resources/by-semester',
    BY_SUBJECT: '/api/resources/by-subject',
  },
  
  STORAGE: {
    UPLOAD: '/api/upload',
    PRESIGNED: '/api/upload/presigned',
    DOWNLOAD: (fileId: string) => `/api/upload/download/${fileId}`,
    DELETE: '/api/upload',
    LOCAL: '/api/upload/local',
  },
  
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    ACTIVITY: '/api/user/activity',
  },
  
  SYSTEM: {
    HEALTH: '/api/health',
    DB_STATUS: '/api/db/status',
    SERVICES_STATUS: '/api/system/services-status'
  }
} as const;
