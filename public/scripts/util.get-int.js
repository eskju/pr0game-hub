window.getInt = function (intOrString) {
    return parseInt((intOrString !== null && intOrString !== undefined && intOrString !== ''? intOrString : '0').toString().replace(/\./, ''));
}
