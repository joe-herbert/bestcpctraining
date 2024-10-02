"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn("Bookings", "deletedAt", {
            allowNull: true,
            type: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn("Bookings", "deletedAt");
    },
};
