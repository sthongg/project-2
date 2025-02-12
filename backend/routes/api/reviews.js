// backend/routes/api/reviews.js
const express = require('express')
const router = express.Router();
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');

//Get all Reviews of the Current User
router.get('/current', requireAuth, async (req, res) => {
    const userId = req.user.id;

    const reviews = await Review.findAll({
        where: { userId: userId },
        include: [
            {
                model: User,
                attributes: ["id", "firstName", "lastName"],
            },
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
                    "price",
                ],
            },
            {
                model: ReviewImage,
                attributes: ["id", "url"],
            },
        ],
    });

    // Add previewImage to each spot by querying SpotImage table separately
    for (let review of reviews) {
        if (review.Spot) {
            const spotId = review.Spot.id;
            const previewImage = await SpotImage.findOne({
                where: { spotId: spotId, preview: true },
                attributes: ["url"],
            });

            // Add previewImage or set null if not found
            review.Spot.dataValues.previewImage = previewImage.url
        }
    }

    res.status(200).json({ "Reviews": reviews });
});

//add an image to a review based on reviews id
router.post('/:reviewid/images', requireAuth, async (req, res) => {
    const reviewId = req.params.reviewid;  // The spot ID from the URL params

    const review = await Review.findByPk(reviewId, {include: {model: ReviewImage}});

    if (!review) {
        // If the spot does not exist, return a 404 error
        return res.status(404).json({
            message: "Review couldn't be found",
        });
    }

    if(review.dataValues.ReviewImages.length >= 10){
        return res.status(403).json({
            message: "Max number of review images has been reached"
        })
    }

    if(review.userId !== req.user.id){
        res.status(401).json({error: "Must be owner to add an image to this review"})
    }


    const reviewImage = await ReviewImage.create({
        reviewId: review.id,
        url: "image url"
    })

    res.status(201).json({
        "id": reviewImage.id,
        "url": reviewImage.url
    })
})

//EDIT A Review
router.put("/:reviewid", requireAuth, async (req, res) => {
    const reviewId = req.params.reviewid;  // The spot ID from the URL params
    const { review, stars } = req.body;  // Destructuring from the request body

    // Ensure all fields are provided and valid
    if (!review || !stars) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                review: "Review text is required",
                stars: "Stars must be an integer from 1 to 5"
            },
        })
    }

    const theReview = await Review.findByPk(reviewId);

    if (!theReview) {
        // If the spot does not exist, return a 404 error
        return res.status(404).json({
            message: "Review not found",
        });
    }

    if(theReview.userId !== req.user.id){
        res.status(401).json({error: "Must be owner to edit this review"})
    }


    await theReview.update({
        review,
        stars
    });

    return res.json(theReview)
});


// //Delete a review by id
router.delete('/:reviewid', requireAuth, async (req, res) => {
    const reviewId = req.params.reviewid;  // The spot ID from the URL params
    const review = await Review.findByPk(reviewId);

    if (!review) {
        // If the spot does not exist, return a 404 error
        return res.status(404).json({
            message: "Review couldn't be found",
        });
    }

    if(review.userId !== req.user.id){
        res.status(401).json({error: "Must be owner to delete this review"})
    }

    review.destroy()

    res.status(200).json({
        message: "Successfully deleted"
    })
})


module.exports = router;