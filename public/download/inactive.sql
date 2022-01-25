SELECT id,
       name,
       score,
       main_coordinates,
       (
           SELECT MIN(created_at)
           FROM `log_players` l
           WHERE DATE(created_at) < '2022-01-23'
             AND l.external_id = p.id
             AND l.score = p.score
           ) AS lastActivity
FROM players p
WHERE score = (
    SELECT MAX(score) FROM `log_players` l WHERE DATE(created_at) < '2022-01-23' AND l.external_id = p.id)
  AND is_inactive = 0
  AND on_vacation = 0
ORDER BY score DESC;
