import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function generateVerificationToken(): string {
  return jwt.sign({}, JWT_SECRET, { expiresIn: '1h' });
}
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}