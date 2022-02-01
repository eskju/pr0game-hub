window.numberFormat = function(number) {
    return Math.floor(number || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
