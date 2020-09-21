import JsObjectSchema from '../src/index';

describe('schema', () => {
    test('plain schema given valid object', () => {
        const schema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        });

        const object = {
            name: 'Picachu',
            level: 99,
            maxLevel: 99
        };

        const result = schema.validate(object);

        expect(result.object).toEqual(object);
        expect(result.error).toBe(null);
    });

    test('schema with handler and custom message given invalid object', () => {
        const schema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: {
                handler: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                errorMessage: 'maxLevel must be a number greater than 0.'
            },
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        });

        const object = {
            name: 'Charmander',
            level: 0,
            maxLevel: 0
        };

        const result = schema.validate(object);

        expect(result.object).toEqual(object);
        expect(result.error.errors.length).toBe(1);
        expect(result.error.errors[0].message).toBe('maxLevel must be a number greater than 0.');
    });

    test('schema with arrays with mixed values given invalid object', () => {
        const schema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: {
                handler: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                errorMessage: 'maxLevel must be a number greater than 0.'
            },
            level: [
                ({ level }) => typeof level === 'number',
                {
                    handler: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel,
                    errorMessage: 'level must be lower or equal to maxLevel'
                }
            ]
        });

        const object = {
            name: 'Squirtle',
            level: 99,
            maxLevel: 50
        };

        const result = schema.validate(object);

        expect(result.object).toEqual(object);
        expect(result.error.errors.length).toBe(1);
        expect(result.error.errors[0].message).toBe('level must be lower or equal to maxLevel');
    });
});
