// pages/api/auth/verify-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../lib/db/models/User';
import connectDB from '../../../lib/db/connect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, otp } = req.body;
    console.log('Received verification request:', { email, otp });
    console.log('Verifying OTP:', { email, otp });
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    console.log('Searching for user with criteria:', {
        email,
        verificationCode: otp,
        verificationCodeExpiry: { $gt: new Date() }
      });

      // First, find the user by email to debug
    const userByEmail = await User.findOne({ email });
    console.log('User found by email:', userByEmail ? {
      email: userByEmail.email,
      verificationCode: userByEmail.verificationCode,
      verificationCodeExpiry: userByEmail.verificationCodeExpiry,
      currentTime: new Date()
    } : 'No user found');
  
    // Find user with matching OTP
    const user = await User.findOne({
      email,
      verificationCode: otp,
      verificationCodeExpiry: { $gt: new Date() }
    });
    console.log('Found user:', user);

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('OTP details:', {
        savedOTP: user.verificationCode,
        expiry: user.verificationCodeExpiry,
        currentTime: new Date()
      });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP',
        debug: {
          emailFound: !!userByEmail,
          otpMatched: userByEmail?.verificationCode === otp,
          notExpired: userByEmail?.verificationCodeExpiry ? new Date(userByEmail.verificationCodeExpiry) > new Date() : false
        } });
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}   