'use strict';

const { Booking } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Booking.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-01-12')
      },
      {
        spotId: 2,
        userId: 2,
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-18')
      },
      {
        spotId: 3,
        userId: 3,
        startDate: new Date('2026-03-05'),
        endDate: new Date('2026-03-08')
      }
    ], { validate: true });
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      startDate: {
        [Op.in]: [
          new Date('2026-01-10'),
          new Date('2026-02-15'),
          new Date('2026-03-05')
        ]
      }
    });
  }
};
