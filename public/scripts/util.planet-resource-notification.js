window.PlanetResourceNotification = function () {
    const $this = this;

    this.addNotification = function (coords, resourceId, metal, crystal, deuterium, level) {
        setValue(coords + '_notification_resourceId', resourceId);
        setValue(coords + '_notification_metal', parseInt(metal));
        setValue(coords + '_notification_crystal', parseInt(crystal));
        setValue(coords + '_notification_deuterium', parseInt(deuterium));
        setValue(coords + '_notification_level', parseInt(level));

        showMessage('Benachrichtigung gespeichert.');

        $('body').animate({left: 0}, 1000, () => {
            window.location.reload();
        });
    };

    this.removeNotification = function (coords) {
        setValue(coords + '_notification_resourceId', null);
        setValue(coords + '_notification_metal', null);
        setValue(coords + '_notification_crystal', null);
        setValue(coords + '_notification_deuterium', null);

        window.location.reload();
    }

    this.hasNotification = function (coords, resourceId) {
        return parseInt(getValue(coords + '_notification_resourceId')) === parseInt(resourceId);
    };

    this.getFinishTime = function (coords) {
        if (getInt(getValue(coords + '_notification_resourceId')) === 0) {
            return null;
        }

        let metalTime = this.getFinishTimeForResource(coords, 'metal');
        let crystalTime = this.getFinishTimeForResource(coords, 'crystal');
        let deuteriumTime = this.getFinishTimeForResource(coords, 'deuterium');

        if (deuteriumTime > crystalTime && deuteriumTime > metalTime) {
            return deuteriumTime;
        }

        if (crystalTime > metalTime) {
            return crystalTime;
        }

        if (metalTime <= new Date().getTime() / 1000) {
            return null;
        }

        return metalTime;
    };

    this.getFinishTimeForResource = function (coords, resource) {
        const need = getInt(getValue(coords + '_notification_' + resource));
        const available = getInt(getValue(coords + '_' + resource));
        const productionPerDay = getInt(getValue(coords + '_production_' + resource));
        const lastUpdate = getInt(getValue(coords + '_resource_update'));
        const diff = need - available < 0 ? 0 : need - available;
        const secondsLeft = diff < 0 ? 0 : diff / productionPerDay * 86400;

        return Math.ceil(lastUpdate / 1000 + secondsLeft);
    };

    this.getDiffForResource = function (coords, resource) {
        const need = getInt(getValue(coords + '_notification_' + resource));
        const available = getInt(getValue(coords + '_' + resource));
        const diff = need - available < 0 ? 0 : need - available;

        return numberFormat(diff);
    };

    this.getNotifications = function () {
        let result = [];
        let coords;
        let resourceId;
        const resources = {
            '1': 'Metallmine',
            '2': 'Kristallmine',
            '3': 'Deuteriumsynthesierer',
            '4': 'Solarkraftwerk',
            '6': 'Technodome',
            '12': 'Fusionskraftwerk',
            '14': 'Roboterfabrik',
            '15': 'Nanofabrik',
            '21': 'Schiffswerft',
            '22': 'Metalllager',
            '23': 'Kristalllager',
            '24': 'Deuteriumtank',
            '31': 'Forschungslabor',
            '33': 'Terraformer',
            '34': 'Allianzdepot',
            '41': 'Basis',
            '42': 'Phalanx',
            '43': 'Portal',
            '44': 'Raketensilo',

            '106': 'Spionagetechnik',
            '108': 'Computertechnik',
            '109': 'Waffentechnik',
            '110': 'Schildtechnik',
            '111': 'Raumschiffpanzerung',
            '113': 'Energietechnik',
            '114': 'Hyperraumtechnik',
            '115': 'Verbrennungstriebwerk',
            '117': 'Impulstriebwerk',
            '118': 'Hyperraumantrieb',
            '120': 'Lasertechnik',
            '121': 'Ionentechnik',
            '122': 'Plasmatechnik',
            '123': 'Intergalaktisches Forschungsnetzwerk',
            '124': 'Astrophysik',
            '131': 'Produktionsmaximierung Metall',
            '132': 'Produktionsmaximierung Kristall',
            '133': 'Produktionsmaximierung Deuterium',
            '199': 'Gravitonforschung',

            '202': 'small_transporters',
            '203': 'large_transporters',
            '204': 'light_hunters',
            '205': 'heavy_hunters',
            '206': 'cruisers',
            '207': 'battleships',
            '208': 'colony_ships',
            '209': 'recyclers',
            '210': 'spy_drones',
            '211': 'bombers',
            '212': 'solar_satellites',
            '213': 'destroyers',
            '214': 'death_stars',
            '215': 'battle_cruisers',

            '401': 'rocket_launchers',
            '402': 'light_laser_turrets',
            '403': 'heavy_laser_turrets',
            '404': 'gauss_canons',
            '405': 'ion_turrets',
            '406': 'plasma_turrets',
            '407': 'small_shields',
            '408': 'large_shields',

            '502': 'interceptor_missiles',
            '503': 'interplanetary_missiles',

            '901': 'metal',
            '902': 'crystal',
            '903': 'deuterium',
            '911': 'energy'
        };

        $('#planetSelector option').each(function (key, obj) {
            coords = getCoordinates(obj.innerHTML)[0];
            resourceId = getValue(coords + '_notification_resourceId');

            if (resourceId) {
                result.push({
                    coords,
                    resourceId,
                    resource: resources[resourceId],
                    metal: $this.getDiffForResource(coords, 'metal'),
                    crystal: $this.getDiffForResource(coords, 'crystal'),
                    deuterium: $this.getDiffForResource(coords, 'deuterium'),
                    level: getValue(coords + '_notification_level')
                });
            }
        });

        return result;
    };
};
