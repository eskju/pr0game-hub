window.Resources = function () {
    const $this = this;

    this.init = function () {
        setValue(ownCoords[0] + '_metal', getInt($('#current_metal').html()).toString());
        setValue(ownCoords[0] + '_crystal', getInt($('#current_crystal').html()).toString());
        setValue(ownCoords[0] + '_deuterium', getInt($('#current_deuterium').html()).toString());
        setValue(ownCoords[0] + '_resource_update', new Date().getTime().toString());

        $this.updateVars();
    }

    this.updateVars = function () {
        let coords;
        $('#planetSelector option').each(function (key, obj) {
            coords = getCoordinates(obj.innerHTML)[0];
            $this.updateVar(coords, 'metal');
            $this.updateVar(coords, 'crystal');
            $this.updateVar(coords, 'deuterium');
        });

        $('#current_metal').stop().animate({left: 0}, 1000, () => {
            $this.updateVars();
        });
    };

    this.updateVar = function (coords, alias) {
        const initValue = getInt(getValue(coords + '_' + alias));
        const production = getInt(getValue(coords + '_production_' + alias));
        const limit = getInt(getValue(coords + '_limit_' + alias));
        const timeDiff = getValue(coords + '_resource_update') ? new Date().getTime() - getInt(getValue(coords + '_resource_update')) : null;
        const currentValue = !timeDiff ? initValue : initValue + production / 86400 * timeDiff / 1000;

        if(currentValue > limit) {
            $('.ress_' + alias + '_' + coords.replace(/\:/g, '_')).html('<span class="text-red" title="Die Lager sind vermutlich voll. Produktion gestoppt.">' + numberFormat(getInt(currentValue), true) + '</span>');
        }
        else {
            $('.ress_' + alias + '_' + coords.replace(/\:/g, '_')).html(numberFormat(getInt(currentValue), true));
        }
    }
};
