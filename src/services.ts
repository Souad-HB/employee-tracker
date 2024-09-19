import inquirer from 'inquirer';
import { pool } from './connection.js';
import { QueryResult } from 'pg';
import { employeeTracker } from './server.js';

// Function to show all of departments
const viewAllDepartments = () => {
    const sqlQuery = `SELECT * FROM department;`
    pool.query(sqlQuery, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            employeeTracker();
        }
    });

};

// Function to show all of roles
const viewAllRoles = () => {
    console.log("Displaying roles: \n")
    const sqlQuery = `SELECT r.id, r.title, d.name AS department, r.salary FROM role r 
    JOIN department d ON r.department_id = d.id;`

    pool.query(sqlQuery, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            employeeTracker();
        }
    });
};

// Function to show all employees
const viewAllEmployees = () => {
    const sqlQuery = `SELECT 
                        e.id,
                        e.first_name, 
                        e.last_name, 
                        r.title, 
                        d.name AS department, 
                        r.salary, 
                        CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
                    FROM employee e 
                        JOIN role r ON e.role_id = r.id
                        JOIN department d ON r.department_id = d.id
                        LEFT JOIN employee manager on e.manager_id = manager.id
                        ORDER BY ID ASC;`

    pool.query(sqlQuery, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            employeeTracker();
        }
    });
}

// Function to add a department
const addDepartment = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'departmentInput',
            message: 'What is the name of the department?',
            validate: userInput => {
                if (userInput) {
                    return true;
                } else {
                    console.log('Please add a department name');
                    return false;
                }
            }
        }
    ])
    .then((answers) => {
        // Define the SQL query with a placeholder
        const sqlQuery = `INSERT INTO department (name) VALUES ($1);`;
        // Make sure the answers.departmentInput is passed as an array
        const values = [answers.departmentInput];
        pool.query(sqlQuery, values, (err, result) => {
            if (err) {
                console.log(err);
            } else if (result) {
                console.log(`Added ${answers.departmentInput} to the database.`);
                
                employeeTracker();  // prompt the list again
            }
        });
    });
};
 // Function to add a role
const addRole = () => {
    inquirer
    .prompt ([
        { // prompt for the role name
            type: 'input',
            name: 'roleName',
            message: 'What is the name of the role?',
            validate: userInput => { // role can't be null
                if (userInput) {
                    return true;
                }
                else {
                    console.log('Role name is required.')
                    return false;
                };
            }
        },
        { // prompt for the role salary
            type: 'input',
            name: 'roleSalary',
            message: 'What is the salary of the role?',
            validate: userInput => { // salary can't be null
                if (isNaN(userInput) || userInput <= 0) {
                    return 'Please enter a valid number for the salary';
                }
                else {
                    return true;
                };
            }
        }
    ])
    .then ((answers) => { // store the first two answers in an array
        const roleData = [answers.roleName, answers.roleSalary];
        const deptQuery = `SELECT * FROM department;`;
        pool.query(deptQuery, (err: Error, result: QueryResult) => {
            if (err) {
                console.log(err);
            } else if (result) {
                inquirer
                .prompt ([
                    { // prompt for the list of existing departments
                        type: 'list',
                        name: 'roleDepartment',
                        message: 'Which department does the role belong to?',
                        choices: result.rows.map(department => ({
                            name: department.name,
                            value: department.id
                        }))
                    }
                ])
                .then ((answer) => {
                    roleData.push(answer.roleDepartment); //add the sleected department to roleData array
                    
                    const sqlQuery = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);`
                    pool.query(sqlQuery, roleData, (err: Error, result: QueryResult) => {
                        if (err) {
                            console.log(err)
                        } else if (result) {
                            console.log(`Added ${answers.roleName} to the database.`)
                            employeeTracker();
                        };
                    });
                });
            };
        });
    }) ;
}

// Function to add an employee
const addEmployee = () => { 
    inquirer
    .prompt([
        { // Ask the user for the the first and last name of the employee
            type: 'input',
            name: 'fName',
            message: "What is the employee's first name?",
            validate: userInput => { //fName can't be null
                if (!userInput) {
                    console.log("Employee's first name can't be null");
                    return false;
                }
                else  {
                    return true;
                };
            }
        },
        {
            type: 'input',
            name: 'lName',
            message: "What is the employee's last name?",
            validate: userInput => { //lName can't be null
                if (!userInput) {
                    console.log("Employee's first name can't be null");
                    return false;
                }
                else  {
                    return true;
                };
            }
        } 
    ])
    .then ((answers) => {
        // store the collected data so far in an array
        const employeeData = [answers.fName, answers.lName]; 

        // grab the existing roles and prompt them to the user
        const roleQuery = `SELECT id, title FROM role;`;
        pool.query(roleQuery, (err, result) => {
            if (err) {
                console.log(err);
            } else if (result) {
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's role?",
                        choices: result.rows.map(role => ({
                            name: role.title,
                            value: role.id
                        }))
                    }
                ])
                .then ((answer) => {
                    employeeData.push(answer.role); // add the role to the employeeData array
                    const managerQuery = `SELECT id, first_name, last_name FROM employee;`
                    pool.query(managerQuery, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else if (result) {
                            // prompt the user the list of employees to choose a manager for the new employee
                            inquirer
                            .prompt([
                                { 
                                    type: 'list',
                                    name: 'manager',
                                    message: "Who is the employee's manager?",
                                    choices: ['None', ...result.rows.map(manager => ({
                                        name: manager.first_name + ' ' + manager.last_name,
                                        value: manager.id
                                    }))]
                                }
                            ])
                            .then(answer => { // When None is chosen, then it's considered null in the database table
                                employeeData.push(answer.manager === 'None' ? null : answer.manager);

                                const employeeQuery = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4);`
                                pool.query(employeeQuery, employeeData, (err, result) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else if (result) {
                                        console.log(`Added ${employeeData[0]} ${employeeData[1]} to the database`)
                                        employeeTracker();
                                    };
                                });
                                
                            });
                        };
                        
                    });
                    
                });
            };
        });

        
    });
};

// Function to update a role of an employee
const updateRole = () => {
    const empQuery = `SELECT * from employee;`;
    pool.query (empQuery, (err, result) => {
        if (err) {
            console.log(err);
        } else if (result) {
            // grab the list of employees to choose from
            inquirer
            .prompt ([
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee's role would you want to update?",
                    choices: result.rows.map((employee) => ({
                        name: employee.first_name + ' ' + employee.last_name,
                        value: employee.id
                    }))
                }
            ])
            .then ((answer) => {
                // store the answer in an array employeeData
                const employeeData = [answer.employee];
                const roleQuery = `SELECT * FROM role;`;
                pool.query(roleQuery, (err, result) => {
                    if (err) {
                        console.error('Error getting the title from role', err)
                    } else if (result) {
                        // grab the list of roles to choose the new role from
                        inquirer
                        .prompt ([
                            {
                                type: 'list',
                                name: 'role',
                                message: "Which role do you want to assign the selected employee?",
                                choices: result.rows.map((role) => ({
                                    name: role.title,
                                    value: role.id
                                }))               
                            }
                        ])
                        .then ((answer) => {
                            // storing the selected role in the employeeData array
                            employeeData.push(answer.role);
                            const updatedRoleQuery = `UPDATE employee SET
                                                        role_id = $1
                                                        WHERE id = $2;`
                            const values = [employeeData[1], employeeData[0]];  
                                 
                            pool.query(updatedRoleQuery, values, (err, result) => {
                                if (err) {
                                    console.error('Error updating the employees role', err)
                                } else if (result) {
                                    console.log(`Employee's role is updated successfully.`);
                                    employeeTracker();
                                }
                            });
                        });
                    };
                    
                });

            });
        };

    });
}

// Function to update the manager of an employee
const updateManager = () => {
    const empQuery = `SELECT * FROM employee;`
    pool.query(empQuery, (err, result) => {
        if (err) {
            console.log(err)
        } else if (result) {
            // grab the list of employees
            inquirer
            .prompt ([
                {
                    type: 'list',
                    name: "employee",
                    message: "Which employee's manager do you want to update?",
                    choices: (result.rows.map((employee) => ({
                        name: employee.first_name + ' ' + employee.last_name,
                        value: employee.id
                    }))).filter((manager) => manager != null)
                }
            ])
            .then ((answer) => {
                // store that employee in an array employeeData
                const employeeData = [answer.employee];
                let selectedEmployee = answer.employee;
                const manQuery = `SELECT * FROM employee;`;
                pool.query(manQuery, (err, result) => {
                    if (err) {
                        console.log(err) 
                    } else if (result) {
                        inquirer
                        .prompt ([
                            {
                                type: 'list',
                                name: 'manager',
                                message: 'Which manager do you want to assign the selected employee?',
                                // extract all employees except the one to have the manager assigned to. an employee can't be their own manager.
                                choices: ['None', ...result.rows
                                    .filter((possibleManager) => possibleManager.id !== selectedEmployee)
                                    .map((manager) => ({
                                        name: manager.first_name + ' ' + manager.last_name,
                                        value: manager.id
                                    }))]
                            }
                        ])
                        .then((answer) => {
                            employeeData.push(answer.manager === 'None' ? null : answer.manager);
                            const updatedManagerQuery = `UPDATE employee SET manager_id = $1 WHERE id = $2;`
                            const values = [employeeData[1], employeeData[0]];  
                            pool.query(updatedManagerQuery, values, (err, result) => {
                                if (err) {
                                    console.error('Error updating the employee manager', err)
                                } else if (result) {
                                    console.log(`Employee's manager is updated successfully.`);
                                    employeeTracker();
                                }
                            });
                        });
                    };
                });
            });
        };
    });
}

// Function to get the employees by a selected manager
const employeeByManager = () => {
    const query = `SELECT * FROM employee;`
    pool.query(query, (err, result) => {
        if (err) {
            console.log(err)
        } else if (result) {
            inquirer
            .prompt([
                { // grab the list of employees
                    type: 'list',
                    name: 'selectedEmployee',
                    message: 'Which manager would you want to select?', 
                    choices: result.rows.map((employee) => ({
                        name: employee.first_name + ' ' + employee.last_name,
                        value: employee.id
                    }))
                }
            ])
            .then ((answer) => {
                const query = `SELECT 
                                e.id,
                                e.first_name, 
                                e.last_name,  
                                CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
                            FROM employee e 
                                JOIN role r ON e.role_id = r.id
                                JOIN department d ON r.department_id = d.id
                                LEFT JOIN employee manager on e.manager_id = manager.id
                                WHERE e.manager_id = $1;`
                pool.query(query, [answer.selectedEmployee], (err, result) => {
                    if (err) {
                        console.log(err)
                    } else if (result) {
                        console.table(result.rows);
                        employeeTracker();
                    };
                });
            });
            
        };
    });
};

// Function to get employyes by department
const employeeByDepartment = () => {
    const query = `SELECT * FROM department;`
    pool.query(query, (err, result) => {
        if (err) {
            console.log(err)
        } else if (result) {
            inquirer
            .prompt([
                { // grab a list of the departments
                    type: 'list',
                    name: 'selectedDepartment',
                    message: 'Which department would you want to select?',
                    choices: result.rows.map((department) => ({
                        name: department.name,
                        value: department.id
                    }))
                }
            ])
            .then ((answer) => {
                const query = `SELECT CONCAT(first_name, ' ', last_name) AS employee, department.name AS department FROM employee
                                LEFT JOIN role ON employee.role_id = role.id
                                LEFT JOIN department ON department.id = role.department_id
                                WHERE department.id = $1;`
                pool.query(query, [answer.selectedDepartment], (err, result) => {
                    if (err) {
                        console.log(err)
                    } else if (result) {
                        console.table(result.rows);
                        employeeTracker();
                    };
                });
            });
            
        };
    });
};

// Function to delete a department
const deleteDepartment = () => {
    const query = `SELECT * FROM department;`
    pool.query(query, (err, result) => {
        if (err) {
            console.log(err)
        } else if (result) {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'selectedDepartment',
                        message: 'Which department would you want to delete?',
                        choices: result.rows.map((department) => ({
                            name: department.name,
                            value: department.id
                        }))
                    }
                ])
                .then((answer) => {
                    const deletedDepartment = answer.selectedDepartment;
                    const delQuery = `DELETE FROM department WHERE id = $1;`
                    pool.query(delQuery, [deletedDepartment], (err, result) => {
                        if (err) {
                            console.log(err)
                        } else if (result) {
                            console.log(`The department is deleted from the database.`);
                            employeeTracker();
                        };
                    });
                });
        };
    });
};

const deleteEmployee = () => {
    const query = `SELECT * FROM employee;`
    pool.query(query, (err, result) => {
        if (err) {
            console.log(err)
        } else if (result) {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'selectedEmployee',
                        message: 'Which employee would you want to delete?',
                        choices: result.rows.map((employee) => ({
                            name: employee.first_name + ' ' + employee.last_name,
                            value: employee.id
                        }))
                    }
                ])
                .then((answer) => {
                    const deletedEmployee = answer.selectedEmployee
                    const delQuery = `DELETE FROM employee WHERE id = $1;`
                    pool.query(delQuery, [deletedEmployee], (err, result) => {
                        if (err) {
                            console.log(err)
                        } else if (result) {
                            console.log(`The employee is deleted from the database.`);
                            employeeTracker();
                        };
                    });
                });
        };
    });
};

// Function to view utilized budget by department
const viewBudgetByDepartment = () => {
    const query = `SELECT * FROM department;`
    pool.query(query, (err, result) => {
        if (err) {
            console.log(err)
        } else if (result) {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'selectedDepartment',
                        message: 'Which department would you want to view the budget for?',
                        choices: result.rows.map((department) => ({
                            name: department.name,
                            value: department.id
                        }))
                    }
                ])
                .then((answer) => {
                    const value = [answer.selectedDepartment];

                    const query = `SELECT department_id AS id, department.name AS department, SUM(role.salary) AS budget 
                        FROM employee
                        JOIN role ON employee.role_id = role.id
                        JOIN department ON department.id = role.department_id 
                        WHERE department.id = $1
                        GROUP BY department_id, department.name;`;
                    pool.query(query, value, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else if (result) {
                            console.table(result.rows)
                            employeeTracker();
                        };
                    });
                });
        };
    });
};

// Function to exit the application
const Quit = () => {
    process.exit(0);
}

// Export all the above methods
export { viewAllDepartments, viewAllRoles, viewAllEmployees, addDepartment,addRole, addEmployee, updateRole, updateManager, employeeByManager, employeeByDepartment, deleteDepartment, deleteEmployee, viewBudgetByDepartment, Quit } ;