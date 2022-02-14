window.Resources = function () {
    const $this = this;
    this.sumMetal = 0;
    this.sumCrystal = 0;
    this.sumDeuterium = 0;
    this.sumLimitMetal = 0;
    this.sumLimitCrystal = 0;
    this.sumLimitDeuterium = 0;

    this.init = function () {
        setValue(ownCoords[0] + '_metal', getInt($('#current_metal').html()).toString());
        setValue(ownCoords[0] + '_crystal', getInt($('#current_crystal').html()).toString());
        setValue(ownCoords[0] + '_deuterium', getInt($('#current_deuterium').html()).toString());
        setValue(ownCoords[0] + '_resource_update', new Date().getTime().toString());

        $this.updateVars();
    }

    this.updateVars = function () {
        let coords;

        this.sumMetal = 0;
        this.sumCrystal = 0;
        this.sumDeuterium = 0;
        this.sumLimitMetal = 0;
        this.sumLimitCrystal = 0;
        this.sumLimitDeuterium = 0;

        $('#planetSelector option').each(function (key, obj) {
            coords = getCoordinates(obj.innerHTML)[0];
            $this.updateVar(coords, 'metal');
            $this.updateVar(coords, 'crystal');
            $this.updateVar(coords, 'deuterium');
        });

        $('#sumMetal').html(numberFormat(this.sumMetal, true));
        $('#sumCrystal').html(numberFormat(this.sumCrystal, true));
        $('#sumDeuterium').html(numberFormat(this.sumDeuterium, true));
        $('#sumLimitMetal').html(numberFormat(this.sumLimitMetal, true));
        $('#sumLimitCrystal').html(numberFormat(this.sumLimitCrystal, true));
        $('#sumLimitDeuterium').html(numberFormat(this.sumLimitDeuterium, true));

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

        if (currentValue > limit) {
            $('.ress_' + alias + '_' + coords.replace(/\:/g, '_')).html('<span class="text-red" title="Die Lager sind vermutlich voll. Produktion gestoppt.">' + numberFormat(parseInt(currentValue), true) + '<small style="color: #888"> / ' + numberFormat(parseInt(limit), true) + '</small></span>');
        } else {
            $('.ress_' + alias + '_' + coords.replace(/\:/g, '_')).html(numberFormat(parseInt(currentValue), true) + '<small style="color: #888"> / ' + numberFormat(parseInt(limit), true) + '</small>');
        }

        switch (alias) {
            case 'metal':
                this.sumMetal += parseInt(currentValue);
                this.sumLimitMetal += parseInt(limit);
                break;

            case 'crystal':
                this.sumCrystal += parseInt(currentValue);
                this.sumLimitCrystal += parseInt(limit);
                break;

            case 'deuterium':
                this.sumDeuterium += parseInt(currentValue);
                this.sumLimitDeuterium += parseInt(limit);
                break;
        }
    }
};
