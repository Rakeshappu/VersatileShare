


import connectDB from '../../../lib/db/connect';
import cors from 'cors';
import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '../../../lib/db/models/User'
import { generateOTP,generateVerificationToken } from '../../../lib/auth/jwt'
import { sendVerificationEmail } from '../../../lib/email/sendEmail'
import { withDB } from '../_middleware'


const corsMiddleware = cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'OPTIONS'],
  credentials: true,
})

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })


async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  await runMiddleware(req, res, corsMiddleware)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectDB()
    const { email, password, fullName, role, department, phoneNumber, secretNumber, semester } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Validate faculty secret number
    if (role === 'faculty' && (!secretNumber || secretNumber !== 'FACULTY2024')) {
      return res.status(400).json({ error: 'Invalid faculty secret number' })
    }
    const otp = generateOTP();
    const verificationToken = generateVerificationToken()

    const userData = {
      email,
      password,
      fullName,
      role,
      department,
      phoneNumber,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      verificationCode: otp,
      verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    }

    if (role === 'faculty') {
      userData.secretNumber = secretNumber
    }
    if (role === 'student') {
      userData.semester = semester
    }

    const user = new User(userData)
    await user.save()

    await sendVerificationEmail(email, verificationToken,otp)

    return res.status(201).json({ message: 'User created successfully' })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withDB(handler);