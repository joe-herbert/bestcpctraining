"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Discounts", {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
            },
            code: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            amount: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            expiryDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            uses: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Discounts");
    },
};
