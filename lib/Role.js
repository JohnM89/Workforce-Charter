const inquirer = require('inquirer');
const db = require('../config/connection');

class Role {
    // fetch all roles
    static async findAll() {
        try {
            const [rows] = await db.promise().query(`
                SELECT role.id, role.title, department.name AS department, role.salary 
                FROM role 
                JOIN department ON role.department_id = department.id`);
            console.table(rows); // display the fetched rows in a table format
            return rows;
        } catch (err) {
            console.error(err);
        }
    }

    // prompt for adding a role
    static async addRolePrompt() {
        try {
            const departments = await db.promise().query('SELECT id, name FROM department')
                .then(([rows]) => rows.map(dept => ({ name: dept.name, value: dept.id })))
                .catch(err => { console.error(err); return []; });

            const answer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'What is the title of the role?'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary of the role?'
                },
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Which department does the role belong to?',
                    choices: departments
                }
            ]);

            await this.addRole(answer.title, answer.salary, answer.departmentId);
            console.log(`Added role ${answer.title} to the database.`);
        } catch (err) {
            console.error(err);
        }
    }

    // add a new role to the database
    static addRole(title, salary, departmentId) {
        return db.promise().query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, departmentId])
            .then(() => console.log(`Added role ${title} to the database.`))
            .catch(err => console.error(err));
    }
}
// export the Role class
module.exports = Role;
