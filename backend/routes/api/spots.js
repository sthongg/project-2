const express = require('express');
const { Spot, SpotImage, User, Review, Sequelize } = require('../../db/models');
const { Op } = Sequelize;
const { requireAuth } = require('../../utils/auth');
const router = express.Router();



// Get all Spots
router.get('/', async (req, res) => {
    try {
      const spots = await Spot.findAll();
      return res.json({ Spots: spots });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Get all Spots owned by the Current User
router.get('/:userId/spots', requireAuth, async (req, res) => {
    const userId = req.params.userId;
  
    if (req.user.id !== Number(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    try {
      const spots = await Spot.findAll({ where: { ownerId: userId } });
      return res.json({ Spots: spots });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Get details of a Spot from an id
router.get('/:spotId', async (req, res) => {
    const spotId = req.params.spotId;
  
    try {
      const spot = await Spot.findByPk(spotId, {
        include: [
          {
            model: SpotImage,
            as: 'SpotImages',
            attributes: ['id', 'url', 'preview'],
          },
          {
            model: User,
            as: 'Owner',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      });
  
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }
  
      const response = {
        ...spot.toJSON(),
        numReviews: spot.Reviews.length,
        avgStarRating: spot.Reviews.reduce((sum, review) => sum + review.stars, 0) / spot.Reviews.length || 0,
      };
  
      return res.json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Create a Spot
router.post('/', requireAuth, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
  
    const errors = {};
  
    if (!address) errors.address = 'Street address is required';
    if (!city) errors.city = 'City is required';
    if (!state) errors.state = 'State is required';
    if (!country) errors.country = 'Country is required';
    if (lat < -90 || lat > 90) errors.lat = 'Latitude must be within -90 and 90';
    if (lng < -180 || lng > 180) errors.lng = 'Longitude must be within -180 and 180';
    if (name.length > 50) errors.name = 'Name must be less than 50 characters';
    if (!description) errors.description = 'Description is required';
    if (price <= 0) errors.price = 'Price per day must be a positive number';
  
    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }
  
    try {
      const newSpot = await Spot.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
      });
  
      return res.status(201).json(newSpot);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', restoreUser, async (req, res) => {
    const { spotId } = req.params;
    const { url, preview } = req.body;
    
    // Ensure the user is authenticated and the spot exists
    const spot = await Spot.findByPk(spotId);
  
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
  
    // Ensure the current user is the owner of the spot
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    try {
      // Create the new image for the spot
      const image = await SpotImage.create({
        spotId: spot.id,
        url,
        preview
      });
  
      return res.status(201).json({
        id: image.id,
        url: image.url,
        preview: image.preview
      });
    } catch (error) {
      return res.status(400).json({ message: 'Bad Request' });
    }
  });

// Edit a Spot
router.put('/:spotId', requireAuth, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          address: "Street address is required",
          city: "City is required",
          state: "State is required",
          country: "Country is required",
          lat: "Latitude must be within -90 and 90",
          lng: "Longitude must be within -180 and 180",
          name: "Name must be less than 50 characters",
          description: "Description is required",
          price: "Price per day must be a positive number"
        }
      });
    }

    await spot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    });

    res.json(spot);
  } catch (err) {
    res.status(500).json({ message: "Failed to update spot" });
  }
});

// Delete a Spot
router.delete('/:spotId', requireAuth, async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await spot.destroy();
    res.json({ message: "Successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete spot" });
  }
});

module.exports = router;
 