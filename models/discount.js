"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Discount extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Discount.init(
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            code: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            amount: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            expiryDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            uses: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Discount",
        }
    );
    return Discount;
};
