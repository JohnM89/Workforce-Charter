USE company_db;

INSERT INTO department (name) VALUES ('Engineering'), ('Human Resources'), ('Marketing');

INSERT INTO role (title, salary, department_id) VALUES ('Software Engineer', 80000, 1), ('HR Manager', 65000, 2), ('Marketing Coordinator', 60000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('John', 'Doe', 1, NULL), ('Jane', 'Smith', 2, NULL), ('Emily', 'Jones', 3, 1);
