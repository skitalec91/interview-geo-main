module.exports = {
    mock: {
        routes: {
            delay: 100,
        },
        collections: {
            selected: 'base'
        }
    },
    files: {
        babelRegister: {
            enabled: true,
            options: {
                presets: ['babel-preset-react-app']
            }
        },
    },
};