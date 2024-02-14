const inquirer = require('inquirer');
const db = require('../config/connection');

class Employee {
    // fetch all employees
  static async findAll() {
    try {
        const [rows] = await db.promise().query(`
            SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
            FROM employee 
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department ON role.department_id = department.id 
            LEFT JOIN employee manager ON manager.id = employee.manager_id`);
        console.table(rows); // display the fetched rows in a table format
        return rows; 
    } catch (err) {
        console.error(err);
    }
}


    // add an employee
    static async addEmployeePrompt() {
        try {
            const roles = await db.promise().query('SELECT id, title FROM role')
                .then(([rows]) => rows.map(role => ({ name: role.title, value: role.id })))
                .catch(err => { console.error(err); return []; });

            const managers = await db.promise().query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee')
                .then(([rows]) => [{ name: 'None', value: null }].concat(rows.map(manager => ({ name: manager.name, value: manager.id }))))
                .catch(err => { console.error(err); return []; });

            const answer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "What is the employee's role?",
                    choices: roles
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: "Who is the employee's manager?",
                    choices: managers
                }
            ]);

            await this.addEmployee(answer.firstName, answer.lastName, answer.roleId, answer.managerId);
            console.log(`Added employee ${answer.firstName} ${answer.lastName} to the database.`);
        } catch (err) {
            console.error(err);
        }
    }

    // add a new employee to the database
    static addEmployee(firstName, lastName, roleId, managerId) {
        return db.promise().query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', 
            [firstName, lastName, roleId, managerId])
            .then(() => console.log(`Added employee ${firstName} ${lastName} to the database.`))
            .catch(err => console.error(err));
    }

    // update an employee's role
    static updateEmployeeRole(employeeId, newRoleId) {
        return db.promise().query('UPDATE employee SET role_id = ? WHERE id = ?', [newRoleId, employeeId])
            .then(() => console.log(`Updated role for employee ID ${employeeId}.`))
            .catch(err => console.error(err));
    }

    // updating an employee's role via prompt
static async updateEmployeeRolePrompt() {
        try {
            const employees = await db.promise().query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee')
                .then(([rows]) => rows.map(employee => ({ name: employee.name, value: employee.id })))
                .catch(err => { console.error(err); return []; });

            const roles = await db.promise().query('SELECT id, title FROM role')
                .then(([rows]) => rows.concat({ id: -1, title: "Add New Role" }).map(role => ({ name: role.title, value: role.id })))
                .catch(err => { console.error(err); return []; });

            const managers = await db.promise().query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee')
                .then(([rows]) => [{ name: 'None', value: null }].concat(rows.map(manager => ({ name: manager.name, value: manager.id }))))
                .catch(err => { console.error(err); return []; });

            const employeeAnswer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: "Which employee's role do you want to update?",
                    choices: employees
                }
            ]);

            const roleAnswer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'roleId',
                    message: "What is the employee's new role?",
                    choices: roles
                }
            ]);

            // handles adding a new role
            let newRoleId = roleAnswer.roleId;
            if (newRoleId === -1) {
                const newRole = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'What is the title of the new role?'
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary for the new role?'
                    },
                    {
                        type: 'list',
                        name: 'departmentId',
                        message: 'Which department does this role belong to?',
                        choices: await db.promise().query('SELECT id, name FROM department')
                                    .then(([rows]) => rows.map(department => ({ name: department.name, value: department.id })))
                                    .catch(err => { console.error(err); return []; })
                    }
                ]);
                await db.promise().query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [newRole.title, newRole.salary, newRole.departmentId])
                    .then(() => console.log(`Added new role ${newRole.title} to the database.`))
                    .catch(err => console.error(err));
                
                const [newRoleRow] = await db.promise().query('SELECT id FROM role WHERE title = ?', [newRole.title]);
                newRoleId = newRoleRow[0].id;
            }

            // manager selection
            const managerAnswer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'managerId',
                    message: "Who is the employee's manager?",
                    choices: managers
                }
            ]);

            await this.updateEmployeeRole(employeeAnswer.employeeId, newRoleId, managerAnswer.managerId);
            console.log(`Updated employee's role and manager in the database.`);
        } catch (err) {
            console.error(err);
        }
    }


    static updateEmployeeRole(employeeId, newRoleId, managerId = null) {
        return db.promise().query('UPDATE employee SET role_id = ?, manager_id = ? WHERE id = ?', [newRoleId, managerId, employeeId])
            .then(() => console.log(`Updated role and manager for employee ID ${employeeId}.`))
            .catch(err => console.error(err));
    }
}
// export the Employee class
module.exports = Employee;

