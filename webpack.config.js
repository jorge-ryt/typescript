const path = require('path');

module.exports = {
    entry: {
        authentication: './src/pages/authentication.ts',
        taskManager: './src/pages//taskManager.ts',
        fileManager: './src/components/fileManager.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
