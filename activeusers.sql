SELECT b.email FROM default.UserParticipation a,
    default.User b
    where 
    a.leagueId = 1 and
    a.seasonId = 2 and
    a.userId = b.id and
    b.email != "otishilburn@gmail.com" and
    a.active = true;