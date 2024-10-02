"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn("Courses", "code", {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "CourseTypes",
                key: "code",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn("Courses", "code");
    },
};
