SELECT
    id,name,(SELECT name FROM alliances a WHERE a.id = p.alliance_id) AS `alliance`,main_coordinates,
    (SELECT l.score FROM `log_players` l WHERE `p`.`id` = `l`.`external_id` AND `created_at` >= '2022-01-20 00:00:00' AND `created_at` < '2022-01-20 23:59:59' ORDER BY `created_at` DESC LIMIT 1) AS d7,
    (SELECT l.score FROM `log_players` l WHERE `p`.`id` = `l`.`external_id` AND `created_at` >= '2022-01-21 00:00:00' AND `created_at` < '2022-01-21 23:59:59' ORDER BY `created_at` DESC LIMIT 1) AS d6,
    (SELECT l.score FROM `log_players` l WHERE `p`.`id` = `l`.`external_id` AND `created_at` >= '2022-01-22 00:00:00' AND `created_at` < '2022-01-22 23:59:59' ORDER BY `created_at` DESC LIMIT 1) AS d5,
    (SELECT l.score FROM `log_players` l WHERE `p`.`id` = `l`.`external_id` AND `created_at` >= '2022-01-23 00:00:00' AND `created_at` < '2022-01-23 23:59:59' ORDER BY `created_at` DESC LIMIT 1) AS d4,
    (SELECT l.score FROM `log_players` l WHERE `p`.`id` = `l`.`external_id` AND `created_at` >= '2022-01-24 00:00:00' AND `created_at` < '2022-01-24 23:59:59' ORDER BY `created_at` DESC LIMIT 1) AS d3,
    (SELECT l.score FROM `log_players` l WHERE `p`.`id` = `l`.`external_id` AND `created_at` >= '2022-01-25 00:00:00' AND `created_at` < '2022-01-25 23:59:59' ORDER BY `created_at` DESC LIMIT 1) AS d2,
    (SELECT l.score FROM `log_players` l WHERE `p`.`id` = `l`.`external_id` AND `created_at` >= '2022-01-26 00:00:00' AND `created_at` < '2022-01-26 23:59:59' ORDER BY `created_at` DESC LIMIT 1) AS d1,
   score
FROM `players` p
WHERE alliance_id IN (12, 95) ORDER BY score DESC
