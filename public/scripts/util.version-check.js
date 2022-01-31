window.isNewerVersionAvailable = function (apiVersion) {
    if(apiVersion !== currentVersion) {
        setValue('version', apiVersion);
        window.location.reload();
    }

    return;

    const currentVersion = version.split('.');
    const latestVersion = apiVersion.split('.');

    // new major
    if (getInt(latestVersion[0]) > getInt(currentVersion[0])) {
        return true;
    }

    // major version is newer than server's version
    if (getInt(latestVersion[0]) < getInt(currentVersion[0])) {
        return false;
    }

    // new minor
    if (getInt(latestVersion[1]) > getInt(currentVersion[1])) {
        return true;
    }

    // minor version is newer than server's version
    if (getInt(latestVersion[1]) < getInt(currentVersion[1])) {
        return false;
    }

    // new fix
    return getInt(latestVersion[2]) > getInt(currentVersion[2]);
}
