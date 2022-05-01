window.getCombatSimulatorLink = function(data, galaxy, system, planet) {

    let sience = [];

    let sdata = data.science.data;
    sdata.forEach((row) => {
        (sience.length == 0 && row.values[2].value !== null ? sience = row.values : '');
    });

    let resource = data.resources.data[0].values;
    let fleet = data.fleet.data[0].values;
    let defense = data.defense.data[0].values;

    let values = sience.concat(resource, fleet, defense);

    let map = {
        metal: 901,
        crystal: 902,
        deuterium: 903,
        military_tech: 109,
        defense_tech: 110,
        shield_tech: 111,
        small_transporters: 202,
        large_transporters: 203,
        light_hunters: 204,
        heavy_hunters: 205,
        cruisers: 206,
        battleships: 207,
        colony_ships: 208,
        recyclers: 209,
        spy_drones: 210,
        bombers: 211,
        solar_satellites: 212,
        destroyers: 213,
        death_stars: 214,
        battle_cruisers: 215,
        rocket_launchers: 401,
        light_laser_turrets: 402,
        heavy_laser_turrets: 403,
        gauss_canons: 404,
        ion_turrets: 405,
        plasma_turrets: 406,
        small_shields: 407,
        large_shields: 408,

    };

    let params = 'koords=' + galaxy + ':' + system + ':' + planet;

    values.forEach((item) => {
        if (typeof map[item.alias] != 'undefined') {
            params += (params === '' ? '' : '&') + map[item.alias] + '=' + item.value;
        }
    });

    return 'window.open(\'https://pr0game.gamers-universe.eu/pr0game/sim/?' + params + '\',\'_blank\')';

};
