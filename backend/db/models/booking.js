'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Define associations for the Booking model.
     */
    static associate(models) {
      // Booking belongs to a User (who makes the booking)
      Booking.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });

      // Booking belongs to a Spot (which is being booked)
      Booking.belongsTo(models.Spot, { foreignKey: 'spotId', onDelete: 'CASCADE' });
    }
  }

  Booking.init(
    {
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Spots', key: 'id' },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      startDate: {
        type: DataTypes.DATEONLY, // Stores only date (e.g., 'YYYY-MM-DD')
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY, // Stores only date (e.g., 'YYYY-MM-DD')
        allowNull: false,
        validate: {
          isAfterStartDate(value) {
            if (value <= this.startDate) {
              throw new Error('End date must be after start date.');
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Booking',
    }
  );

  return Booking;
};
