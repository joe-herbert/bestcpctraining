"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.changeColumn("Courses", "name", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.changeColumn("Courses", "name", {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
};
