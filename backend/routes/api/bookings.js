const express = require('express');
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const {Op} = require('sequelize');

const router = express.Router();

//get all bookings by the current user
router.get('/current', requireAuth, async (req, res) => {
    const userId = req.user.id
    const userBookings = await Booking.findAll({
        where: { userId: userId },
        include: [
            {
                model: Spot, 
                attributes: [
                    "id",
                    "ownerId",
                    "address",
                    "city",
                    "state",
                    "country",
                    "lat",
                    "lng",
                    "name",
                    "price"
                ],
                include: [
                    { model: Review, attributes: ['stars'] }, // Include reviews to calculate avgRating
                    { model: SpotImage, attributes: ['url', 'preview'] } // Include spot images
                ]
            }
        ]
    });

    // console.log(userBookings[0].dataValues.Spot.dataValues)

    userBookings.forEach(element => {
        element.dataValues.avgRating = element.dataValues.Spot.dataValues.Reviews.reduce((acc, review) =>{
            acc += review.stars
       
            return acc
        }, 0)/element.dataValues.Spot.dataValues.Reviews.length
        delete element.dataValues.Spot.dataValues.Reviews
    })

    // Find and add the preview image for each spot
    userBookings.forEach(element => {
        const previewImage = element.dataValues.Spot.dataValues.SpotImages.find(image => image.preview === true);
        element.dataValues.Spot.dataValues.previewImage = previewImage.url
        delete element.dataValues.Spot.dataValues.SpotImages;
    });

    //remove avg rating
    userBookings.forEach(element => {
        delete element.dataValues.avgRating
    })

    // Respond with the spots
    return res.json({
        "Bookings": userBookings
    });
})


// Edit a booking
router.put('/:bookingid', requireAuth, async (req, res) => {
    const bookingId = req.params.bookingid; // The booking ID from the URL params
    const {startDate, endDate} = req.body; // This allows us to use startDate and endDate as we need
    
    // Validate input
    if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                startDate: "startDate cannot be in the past",
                endDate: "endDate cannot be on or before startDate"
            }
        });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
    }

    if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Must be user to edit this booking" });
    }

    // Check if the booking has passed
    const today = new Date();
    if (new Date(booking.endDate) < today) {
        return res.status(403).json({
            message: "Past bookings can't be modified"
        });
    }

    // Fetch all bookings for the same spot except the current booking
    const allBookings = await Booking.findAll({
        where: {
            spotId: booking.spotId
        }
    });

    // Check for conflicts
    for (const existingBooking of allBookings) {
        if (
            existingBooking.id !== booking.id &&
            (
                (new Date(startDate) >= new Date(existingBooking.startDate) &&
                    new Date(startDate) < new Date(existingBooking.endDate)) ||
                (new Date(endDate) > new Date(existingBooking.startDate) &&
                    new Date(endDate) <= new Date(existingBooking.endDate)) ||
                (new Date(startDate) <= new Date(existingBooking.startDate) &&
                    new Date(endDate) >= new Date(existingBooking.endDate))
            )
        ) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            });
        }
    }

    // Update the booking
    await booking.update({
        startDate,
        endDate
    });

    return res.json(booking);
});

// Delete a booking by ID
router.delete('/:bookingid', requireAuth, async (req, res) => {
    const bookingId = req.params.bookingid; // The booking ID from the URL params
    const today = new Date();

    // Find the booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        return res.status(404).json({
            message: "Booking couldn't be found",
        });
    }

    // Find the associated spot
    const spot = await Spot.findByPk(booking.spotId);
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    const userId = req.user.id;

    // Check if the user is authorized to delete the booking
    if (booking.userId !== userId && spot.ownerId !== userId) {
        return res.status(403).json({
            message: "Must be the booking user or spot owner to delete"
        });
    }

    // Prevent deletion if the booking has already started
    if (new Date(booking.startDate) <= today) {
        return res.status(400).json({
            message: "Cannot delete a booking that has already started",
        });
    }

    // Delete the booking
    await booking.destroy();

    return res.status(200).json({
        message: "Successfully deleted"
    });
});

module.exports = router;








module.exports = router;