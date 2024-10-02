"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Booking.belongsTo(models.Course);
            Booking.belongsTo(models.User);
        }
    }
    Booking.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
            },
            courseId: {
                type: DataTypes.UUID,
                allowNull: false,
                model: "Course",
                key: "id",
            },
            userEmail: {
                type: DataTypes.STRING,
                allowNull: false,
                model: "User",
                key: "email",
            },
            paid: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            orderId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Booking",
            paranoid: true,
        }
    );
    return Booking;
};
