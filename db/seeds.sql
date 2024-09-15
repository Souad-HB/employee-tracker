INSERT INTO department (name) 
VALUES  ('Engineering'),
        ('Finance'),
        ('Sales'),
        ('Human Ressources');

INSERT INTO role (title, salary, department_id)  
VALUES  ('Software Engineer', 800000, 1),
        ('Accountant', 50000, 2),
        ('Sales Manager', 450098, 3),
        ('HR Administrator', 60000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES  ('Jane', 'Doe', 1, NULL),
        ('John', 'Doe', 2, NULL),
        ('Souad', 'Hassen', 3, NULL),
        ('Obiwan', 'Kanobie', 1, NULL);
