import { check } from 'express-validator';
import { validateRequest } from '@validation/validate.request';

const validatorLogin = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),

  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password must be between 6 and 15 characters'),

  validateRequest,
];

const validatorResetPassword = [
  check('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password must be between 6 and 15 characters'),
  check('otpCode')
    .trim()
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP code must be equal 6 '),

  validateRequest,
];

const validatorChangePassword = [
  check('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password must be between 6 and 15 characters'),
  check('oldPassword')
    .trim()
    .notEmpty()
    .withMessage('Old Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password must be between 6 and 15 characters'),
  check('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password must be between 6 and 15 characters'),

  validateRequest,
];

export { validatorLogin, validatorResetPassword, validatorChangePassword };
