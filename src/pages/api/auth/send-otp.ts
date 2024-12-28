// pages/api/auth/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../lib/db/models/User';
import { generateOTP } from '../../../lib/auth/otp';
import { sendVerificationEmail } from '../../../lib/email/sendEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { email } = req.body;
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log('Generated OTP:', generateOTP, 'Expiry:', new Date(Date.now() + 10 * 60 * 1000));

    await User.findOneAndUpdate(
      { email }, 
      { verificationOTP: otp, verificationOTPExpiry: otpExpiry }
    );

    await sendVerificationEmail(email,token, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}



// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ 
//       email,
//       verificationOTP: otp,
//       verificationOTPExpiry: { $gt: new Date() }
//     });

//     if (!user) {
//       return res.status(400).json({ error: 'Invalid or expired OTP' });
//     }

//     user.isEmailVerified = true;
//     user.verificationOTP = undefined;
//     user.verificationOTPExpiry = undefined;
//     await user.save();

//     res.status(200).json({ message: 'Email verified successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Verification failed' });
//   }
// }