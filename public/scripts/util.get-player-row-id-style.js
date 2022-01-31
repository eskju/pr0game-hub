window.getPlayerRowTdStyle = function (obj, ownScore) {
    if (obj.on_vacation === 1) {
        return {color: getRgb(cBlue)};
    } else if (ownPlayer !== null && (ownPlayer.alliance_id !== null && (obj.alliance_id === 12 || obj.alliance_id === 95))) {
        return {color: getRgb(cGreen)};
    } else if (obj.is_inactive === 1) {
        return {color: getRgb(cCyan)};
    } else if (getInt(obj.score) < getInt(ownScore) / 5) {
        return {color: getRgb(cGray)};
    } else if (getInt(obj.score) > getInt(ownScore) * 5) {
        return {color: getRgb(cRed)};
    }

    return {};
}
