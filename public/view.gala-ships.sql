SELECT `pl`.`galaxy`               AS `Gala`,
       `pl`.`system` AS `system`,
       `p`.`name`                  AS `Spieler`,
       SUM(`pl`.`cruisers`)        AS `Xer`,
       SUM(`pl`.`battleships`)     AS `SS`,
       SUM(`pl`.`battle_cruisers`) AS `SXer`,
       SUM(`pl`.`bombers`)         AS `Bomber`,
       SUM(`pl`.`destroyers`)      AS `Zer`,
       SUM(`pl`.`recyclers`)       AS Recs
FROM `planets` pl
         INNER JOIN players `p` ON `pl`.`player_id` = `p`.`id`
WHERE `p`.`alliance_id` IN (12, 95)
GROUP BY `pl`.`galaxy`,`pl`.`system`, `pl`.`player_id`
HAVING Xer + SS + SXer + Bomber + Zer + Recs > 0
ORDER BY `pl`.`galaxy`, `pl`.`system`;
