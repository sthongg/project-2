// backend/routes/api/index.js
const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');
const { requireAuth } = require('../../utils/auth.js');
const usersRouter = require('./users.js');
const sessionRouter = require('./session.js');
const spotsRouter = require('./spots.js');
const reviewRouter = require('./reviews.js')
const spotImageRouter = require('./spotimage.js')
const reviewImageRouter = require('./reviewimages.js')
const bookingRouter = require('./bookings.js')

router.post('/test', function (req, res) {
  res.json({ requestBody: req.body });
});


// GET /api/set-token-cookie
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({
    where: {
      username: 'Demo-lition1'
    }
  });
  setTokenCookie(res, user);
  return res.json({ user: user });
});

// backend/routes/api/index.js
// ...

// GET /api/restore-user

router.use(restoreUser);

router.get(
  '/restore-user',
  (req, res) => {
    return res.json(req.user);
  }
);

// GET /api/require-auth

router.get(
  '/require-auth',
  requireAuth,
  (req, res) => {
    return res.json(req.user);
  }
);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

router.use('/reviews', reviewRouter);

router.use('/spot-images', spotImageRouter);

router.use('/review-images', reviewImageRouter)

router.use('/bookings', bookingRouter)


router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;