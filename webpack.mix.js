const path = require('path');

module.exports = {
    entry: './public/scripts/index.js',
    output: {
        filename: 'script.js',
        path: path.resolve(__dirname, './public/scripts/dist'),
    },
    plugins: [

    ],
    resolve: {
        modules: [
            /* assuming that one up is where your node_modules sit,
               relative to the currently executing script
            */
            path.join(__dirname, '../node_modules')
        ]
    }
};
