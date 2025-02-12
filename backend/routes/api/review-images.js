// backend/routes/api/reviews.js
const express = require('express')
const router = express.Router();
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');

// //Delete a review image by id
router.delete('/:reviewImageId', requireAuth, async (req, res) => {
    const reviewimageId = req.params.reviewimageid;  // The reviewimage ID from the URL params
    const reviewimage = await ReviewImage.findByPk(reviewimageId);
    
    if (!reviewimage) {
        // If the spot does not exist, return a 404 error
        return res.status(404).json({
            message: "Review Image couldn't be found",
        });
    }

    const review = await Review.findByPk(reviewimage.reviewId)

    if(review.userId !== req.user.id){
        res.status(401).json({error: "Must be owner to delete this review image"})
    }

    await reviewimage.destroy()

    res.status(200).json({
        message: "Successfully deleted"
    })
})

module.exports = router;