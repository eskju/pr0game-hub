window.getPlayerRowStyle = function (obj, ownScore) {
    if (obj.on_vacation === 1) {
        return {background: getRgb(cBlue)};
    } else if (ownPlayer !== null && (ownPlayer.alliance_id !== null && (obj.alliance_id === 12 || obj.alliance_id === 95))) {
        return {background: getRgb(cGreen)};
    } else if (obj.is_inactive === 1) {
        return {background: getRgb(cCyan)};
    } else if (getInt(obj.score) < 5000 && getInt(obj.score) < ownScore / 5) {
        return {background: getRgb(cGray)};
    } else if (ownScore < 5000 && getInt(obj.score) > ownScore * 5) {
        return {background: getRgb(cRed)};
    }

    const friendAllianceIds = CsvToArray(getValue('filter_ids_friend_alliances'));
    const friendIds = CsvToArray(getValue('filter_ids_friends'));
    const enemyAllianceIds = CsvToArray(getValue('filter_ids_enemy_alliances'));
    const enemyIds = CsvToArray(getValue('filter_ids_enemies'));

    for (let i = 0; i < friendAllianceIds.length; i++) {
        if (friendAllianceIds[i].toString() === (obj.alliance_id || '').toString()) {
            return {background: 'rgb(192, 184, 92)'};
        }
    }

    for (let i = 0; i < friendIds.length; i++) {
        if (friendIds[i].toString() === (obj.id || '').toString()) {
            return {background: 'rgb(192, 184, 92)'};
        }
    }

    for (let i = 0; i < enemyAllianceIds.length; i++) {
        if (enemyAllianceIds[i].toString() === (obj.alliance_id || '').toString()) {
            return {background: getRgb(cRed)};
        }
    }

    for (let i = 0; i < enemyIds.length; i++) {
        if (enemyIds[i].toString() === (obj.id || '').toString()) {
            return {background: getRgb(cRed)};
        }
    }

    return {};
}
