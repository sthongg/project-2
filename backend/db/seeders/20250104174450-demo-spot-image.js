'use strict';
const { SpotImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
     return SpotImage.bulkCreate([
      {
            spotId: 1,
            url: 'https://example.com/image1.jpg',
            preview: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            spotId: 1,
            url: 'https://example.com/image2.jpg',
            preview: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            spotId: 2,
            url: 'https://example.com/image3.jpg',
            preview: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            spotId: 2,
            url: 'https://example.com/image4.jpg',
            preview: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            spotId: 3,
            url: 'https://example.com/image5.jpg',
            preview: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
     ]);

  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg', 'https://example.com/image4.jpg', 'https://example.com/image5.jpg']
      }
    });
  }
};