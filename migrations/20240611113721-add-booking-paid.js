"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Bookings", "paid", {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Bookings", "paid");
    },
};
