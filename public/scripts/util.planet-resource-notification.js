window.PlanetResourceNotification = function () {
    const $this = this;

    this.addNotification = function (coords, resourceId, metal, crystal, deuterium) {
        setValue(coords + '_notification_resourceId', resourceId);
        setValue(coords + '_notification_metal', parseInt(metal));
        setValue(coords + '_notification_crystal', parseInt(crystal));
        setValue(coords + '_notification_deuterium', parseInt(deuterium));

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
};
