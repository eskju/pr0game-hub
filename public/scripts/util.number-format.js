window.numberFormat = function (number, toUnit = false) {
    if (toUnit) {
        number = getInt(number);

        if (number === 0) {
            return '';
        }

        return (Math.round(number / 100) / 10).toFixed(1) + 'K';
    }


    return Math.floor(number || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
