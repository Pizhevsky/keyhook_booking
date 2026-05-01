import { Router } from 'express';
import { parseId } from '../lib/parseId';
import { 
  getAllBookings, 
  createBooking, 
  cancelBooking 
} from '../services/bookingService';
import { validateCreateBooking } from '../middleware/validate';

const router = Router();

// GET /api/bookings?status=all — active only by default
router.get('/', 
  async (req, res, next) => {
    try {
      res.json(await getAllBookings(req.query.status === 'all'));
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validateCreateBooking,
  async (req, res, next) => {
    try {
      res.status(201).json(
        await createBooking(res.locals.validatedBody),
      );
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/book/:id?cancelledBy=<userId>
router.delete('/:id', async (req, res, next) => {
  try {
    const bookingId = parseId(req.params.id, 'booking id');
    const requestingUserId = parseId(req.query.cancelledBy as string, 'cancelledBy');
    res.json(await cancelBooking(bookingId, requestingUserId));
  } catch (err) {
    next(err);
  }
});

export default router;