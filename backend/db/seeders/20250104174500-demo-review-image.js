'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ReviewImages', [
      {
        reviewId: 1,
        imageURL: 'https://example.com/review1-image1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        reviewId: 2,
        imageURL: 'https://example.com/review2-image1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ReviewImages', null, {});
  }
};
