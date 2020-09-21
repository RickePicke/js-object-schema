module.exports = {
    moduleFileExtensions: [ 'js' ],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    transform: {
        '.+\\.[t|j]sx?$': 'babel-jest'
    },
    verbose: true
};
