"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasMany(models.Booking, {
                foreignKey: "userEmail",
            });
        }
    }
    User.init(
        {
            email: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            firstName: DataTypes.STRING,
            surname: DataTypes.STRING,
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            permissions: {
                type: DataTypes.STRING,
                defaultValue: "user",
            },
            licenseNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            hgvLicense: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            pcvLicense: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            mobileNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            postcode: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "User",
        }
    );
    return User;
};
