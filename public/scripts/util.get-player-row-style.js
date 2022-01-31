window.getPlayerRowStyle = function (obj, ownScore) {
    if (obj.on_vacation === 1) {
        return {background: getRgb(cBlue)};
    } else if (ownPlayer !== null && (ownPlayer.alliance_id !== null && (obj.alliance_id === 12 || obj.alliance_id === 95))) {
        return {background: getRgb(cGreen)};
    } else if (obj.is_inactive === 1) {
        return {background: getRgb(cCyan)};
    } else if (getInt(obj.score) < ownScore / 5) {
        return {background: getRgb(cGray)};
    } else if (getInt(obj.score) > ownScore * 5) {
        return {background: getRgb(cRed)};
    }

    return {};
}
