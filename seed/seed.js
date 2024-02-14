const mysql = require('mysql2/promise');
require('dotenv').config();

// seed the database
async function seedDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    // seed commands
    await connection.query('USE company_db;');
    await connection.query("INSERT INTO department (name) VALUES ('Engineering'), ('Human Resources'), ('Marketing');");
    await connection.query("INSERT INTO role (title, salary, department_id) VALUES ('Software Engineer', 80000, 1), ('HR Manager', 65000, 2), ('Marketing Coordinator', 60000, 3);");
    await connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('John', 'Doe', 1, NULL), ('Jane', 'Smith', 2, NULL), ('Emily', 'Jones', 3, 1);");

    console.log('Database seeded successfully');
    await connection.end();
}
// export seedDatabase function
module.exports = { seedDatabase }; 