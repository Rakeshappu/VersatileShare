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
  }
} as const;