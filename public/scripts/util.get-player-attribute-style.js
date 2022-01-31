window.getPlayerAttributeStyle = function (obj, player, alias, color) {
    let referenceValue = 1;

    if (cfgHighlight[alias] && cfgHighlight[alias].enabled) {
        referenceValue = cfgHighlight[alias].threshold;
    } else {
        if (player && player[alias]) {
            referenceValue = getInt(player[alias]);
        }
    }

    return {color: getColor(color, getInt(obj[alias]) / referenceValue)};
};

window.getPlayerScoreStyle = function (obj, player) {
    return getPlayerAttributeStyle(obj, player, 'score', cBlue);
}
window.getPlayerScoreBuildingStyle = function (obj, player) {
    return getPlayerAttributeStyle(obj, player, 'score_building', cGreen);
}
window.getPlayerScoreScienceStyle = function (obj, player) {
    return getPlayerAttributeStyle(obj, player, 'score_science', cPink);
}
window.getPlayerScoreMilitaryStyle = function (obj, player) {
    return getPlayerAttributeStyle(obj, player, 'score_military', cRed);
}
window.getPlayerScoreDefenseStyle = function (obj, player) {
    return getPlayerAttributeStyle(obj, player, 'score_defense', cYellow);
}
