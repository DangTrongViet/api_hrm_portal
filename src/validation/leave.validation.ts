import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateLeaveRequest = [
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.start_date);

      if (endDate < startDate) {
        throw new Error('End date must be after or equal to start date');
      }
      return true;
    }),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reason cannot exceed 1000 characters'),
  handleValidationErrors,
];

export const validateLeaveUpdate = [
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reason cannot exceed 1000 characters'),
  handleValidationErrors,
];

function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
}
