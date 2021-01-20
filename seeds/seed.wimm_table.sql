BEGIN;


INSERT INTO wimm_user(user_name, full_name, password)
VALUES
('first_user', 'Jim Carrey', '$2a$12$fG05gcHYTFNRDt.4.50XN.ebz1ZeNEIwZh91YPlJ8ik/5dbePH3A2'),
('second_user', 'Robert Downey Jr', '$2a$12$Oy2RNgPCJQBhxEbj4/eaa.GDBbuA6L.MADer0Hdg1BdJZLV6a4pLK'),
('forth_user', 'Emma Watson', '$2a$12$UzsZdLZWox.mNL.Qzq0og.sCLIYLU2JvjJ8jQ.PXAC09IjyTQLQou');

INSERT INTO wimm_income(start_time, end_time, hourly_payment, daily_extra, user_id)
VALUES
(9 , 18, 12.00, 20.00, 1),
(10, 18, 11.50 , 25.00, 2),
(8, 15, 12.00, 22.00, 3),
(19, 22, 15.00 , 50, 1);

INSERT INTO wimm_spending_list(category, user_id)
VALUES
('FOOD' , 1),
('Shopping' , 2),
('Util' , 3), 
('ETC' , 1) ;

INSERT INTO wimm_spending_item(item_name, category_id, spending, content)
VALUES
('Galleria Market', 1, 13.50, 'Fruit, Meat, Milk'),
('RALPHS', 1, 16.00, 'Beer, Ramen'),
('Nike', 2, 40.00 , 'Nike shoes'),
('Adidas', 2, 60.00, 'Adidas Shoes'),
('LADWP', 3, 40.00, 'Electric Fee'),
('SOCAL',  3, 20.00, 'GAS, WATER Fee'),
('GAME', 4, 20.00, 'Mario Party');


COMMIT;
