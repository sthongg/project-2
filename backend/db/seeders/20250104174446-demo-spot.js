'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        lat: 37.7749,
        lng: -122.4194,
        name: 'Cozy Studio in SF',
        description: 'A small but cozy studio in the heart of San Francisco.',
        price: 150.00,
        avgRating: 4.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 2,
        address: '456 Elm St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        lat: 40.7128,
        lng: -74.0060,
        name: 'Spacious Loft in NYC',
        description: 'A beautiful loft with stunning views of the city.',
        price: 250.00,
        avgRating: 4.8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 3,
        address: '789 Ocean Ave',
        city: 'Miami Beach',
        state: 'FL',
        country: 'USA',
        lat: 25.7907,
        lng: -80.1300,
        name: 'Beachfront Paradise in Miami',
        description: 'Enjoy a luxurious stay at this oceanfront condo with direct beach access.',
        price: 300.00,
        avgRating: 4.9,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ["Cozy Studio in SF", "Spacious Loft in NYC", "Beachfront Paradise in Miami"] },
      },
    )
  }
};
