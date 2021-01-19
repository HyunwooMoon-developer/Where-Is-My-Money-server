BEGIN;

TRUNCATE
wimm_user,
RESTART IDENTITY CASCADE;

INSERT INTO wimm_user(user_name, full_name, password)
VALUES
('first_user', 'Jim Carrey', '11aaAA!!'),
('second_user', 'Robert Downey Jr', '22bbBB@@'),
('third_user' , 'Scarlett Johansson', '33ccCC##'),
('forth_user', 'Emma Watson', '44ddDD$$');

COMMIT;
