SET @weekId = 22;  -- <-- the Week.id you want

SELECT
    u.firstName,
    u.lastName,
    u.nickName,
    l.name AS league,
    GROUP_CONCAT(
        CASE WHEN g.completed = 1
              AND ( (w.pick = 'home'  AND g.homePoints + COALESCE(g.spread, 0) <= g.awayPoints)
                 OR (w.pick = 'visit' AND g.homePoints + COALESCE(g.spread, 0) >  g.awayPoints) )
             THEN t.name
        END
        ORDER BY t.name SEPARATOR ', '
    ) AS losingPicks
FROM `Wager` w
JOIN `Game` g               ON g.id = w.gameId
JOIN `Week` wk              ON wk.id = g.weekId
JOIN `User` u               ON u.id = w.userId
JOIN `League` l             ON l.id = w.leagueId
JOIN `UserParticipation` up ON up.userId   = w.userId
                           AND up.leagueId = w.leagueId
                           AND up.seasonId = wk.seasonId
JOIN `Team` t               ON t.id = CASE WHEN w.pick = 'home' THEN g.homeId ELSE g.awayId END
WHERE g.weekId = @weekId
  AND up.balance <= -1000
GROUP BY u.id, u.firstName, u.lastName, u.nickName, l.id, l.name
ORDER BY l.name, u.lastName, u.firstName;
