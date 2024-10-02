"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn("CourseTypes", "spaces", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 20,
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn("CourseTypes", "spaces");
    },
};
