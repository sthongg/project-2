// backend/routes/api/reviews.js
const express = require('express')
const router = express.Router();
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');

// //Delete a spot image by id
router.delete('/:spotimageid', requireAuth, async (req, res) => {
    const spotimageId = req.params.spotimageid;  // The spotimage ID from the URL params
    const spotimage = await SpotImage.findByPk(spotimageId);
    const spot = await Spot.findByPk(spotimage.spotId)

    if (!spotimage) {
        // If the spot does not exist, return a 404 error
        return res.status(404).json({
            message: "Spot Image couldn't be found",
        });
    }

    if(spot.ownerId !== req.user.id){
        res.status(401).json({error: "Must be owner to delete this spot"})
    }

    await spotimage.destroy()

    res.status(200).json({
        message: "Successfully deleted"
    })
})

module.exports = router;