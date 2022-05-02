window.isNewerVersionAvailable = function (apiVersion) {
    if(apiVersion !== version) {
        setValue('version', apiVersion);
    }
}
