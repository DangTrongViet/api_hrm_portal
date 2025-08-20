import jwt from 'jsonwebtoken';

export const generateToken = (userId: number) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
};
export const generateTokenVerify = (userId: number) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
};

export const generateRandomNumber = (length: number): string => {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
