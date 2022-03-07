CREATE VIEW FlightsIncoming AS
SELECT ps.name, pt.name, f.*
FROM `flights` f
         INNER JOIN players ps ON ps.id = f.player_start_id AND ps.alliance_id NOT IN (12, 95)
         INNER JOIN players pt ON pt.id = f.player_target_id
WHERE f.is_active = 1
  AND f.is_return = 0;
