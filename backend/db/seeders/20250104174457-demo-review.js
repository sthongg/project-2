"use strict";

const { Review } = require("../models");
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        review: "Absolutely loved this place! Would stay again.",
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 1,
        spotId: 1,
        review: "Nice and cozy, but a bit noisy at night.",
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 1,
        spotId: 1,
        review: "It was okay, nothing special.",
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        spotId: 2,
        review: "Decent stay, but cleanliness could be improved.",
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 3,
        spotId: 3,
        review: "The worst experience ever. Avoid at all costs!",
        stars: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true });
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      review: {
        [Op.in]: [
          "Absolutely loved this place! Would stay again.",
          "Nice and cozy, but a bit noisy at night.",
          "It was okay, nothing special.",
          "Decent stay, but cleanliness could be improved.",
          "The worst experience ever. Avoid at all costs!",
        ]
      },
    });
  },
};
