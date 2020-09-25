import JsObjectSchema from '../src/index';

const squirtle = { name: 'Squirtle', level: 5, maxLevel: 99 };
const bulbasaur = { name: 'Bulbasaur', level: 5, maxLevel: 99 };
const picachu = { name: 'Picachu', level: 99, maxLevel: 99 };

describe('JsObjectSchema', () => {
    test('plain schema given valid object', () => {
        const schema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        });

        const result = schema.validate(picachu);

        expect(result.error).toBe(null);
        expect(result.object).toEqual(picachu);
    });

    test('schema given options with parseObject true should only include props from schema', () => {
        const schema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        }, { parseObject: true });

        const objectWithExtraProps = { ...squirtle, hp: 60, attacks: [ 'Tackle', 'Leer' ] };

        const result = schema.validate(objectWithExtraProps);

        expect(result.object).toEqual(squirtle);
    });

    test('schema given options with strict true should return specific error when object has keys doesn\'t match schema', () => {
        const schema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        }, { strict: true, name: 'Pokemon' });

        const object = { ...squirtle, hp: 60, attacks: [ 'Tackle', 'Leer' ] };
        const result = schema.validate(object);

        expect(result.error.errors.length).toBe(1);
        expect(result.error.message).toBe('Schema validation error');
        expect(result.error.errors[0].message).toBe('Pokemon include properties that is not in schema');
    });

    test('schema with prop that is a schema given valid object', () => {
        const pokemonSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        }, { name: 'pokemon' });

        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: pokemonSchema
        });

        const trainer = { name: 'Ash', badges: [], pokemon: squirtle };

        const result = trainerSchema.validate(trainer);

        expect(result.error).toBe(null);
        expect(result.object).toEqual(trainer);
    });

    test('schema with prop that is a schema given invalid object', () => {
        const pokemonSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        }, { name: 'Pokemon' });

        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: pokemonSchema
        });

        const trainer = { name: 'Ash', badges: null, pokemon: { maxLevel: 0, level: 1, name: 'missingno' } };

        const result = trainerSchema.validate(trainer);

        expect(result.error.errors.length).toBe(3);
        expect(result.error.message).toBe('Schema validation error');
        expect(result.error.errors[0].message).toBe('Error in Root Object: badges is invalid.');
        expect(result.error.errors[1].message).toBe('Error in Pokemon: maxLevel is invalid.');
        expect(result.error.errors[2].message).toBe('Error in Pokemon: level is invalid.');
    });

    test('schema with an object as prop given valid object', () => {
        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            }
        });

        const trainer = { name: 'Ash', badges: [], pokemon: bulbasaur };

        const result = trainerSchema.validate(trainer);

        expect(result.error).toBe(null);
        expect(result.object).toEqual(trainer);
    });

    test('schema with an object as prop given invalid object', () => {
        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            }
        });

        const trainer = { name: 'Ash', badges: [], pokemon: { name: null, maxLevel: 99, level: 5 } };

        const result = trainerSchema.validate(trainer);

        expect(result.error.errors.length).toBe(1);
        expect(result.error.message).toBe('Schema validation error');
        expect(result.error.errors[0].message).toBe('Error in pokemon: name is invalid.');
    });

    test('schema with prop that is an array with schema given valid object', () => {
        const pokemonSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        }, { name: 'Pokemon' });

        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: [ pokemonSchema ]
        });

        const trainer = { name: 'Ash', badges: [], pokemon: [ bulbasaur, squirtle ] };
        const result = trainerSchema.validate(trainer);

        expect(result.error).toBe(null);
        expect(result.object).toEqual(trainer);
    });

    test('schema with prop that is an array with schema given invalid object', () => {
        const pokemonSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
            level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
        }, { name: 'Pokemon' });

        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: [ pokemonSchema ]
        }, { name: 'Trainer' });

        const trainer = {
            name: null,
            badges: [ 'Pewter Gym' ],
            pokemon: [ bulbasaur, squirtle, { name: null, level: 40, maxLevel: 40 } ]
        };

        const result = trainerSchema.validate(trainer);

        expect(result.error.errors.length).toBe(2);
        expect(result.error.message).toBe('Schema validation error');
        expect(result.error.errors[0].message).toBe('Error in Trainer: name is invalid.');
        expect(result.error.errors[1].message).toBe('Error in Pokemon: name is invalid.');
    });

    test('schema with prop that is an array with object given valid object', () => {
        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: [{
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            }]
        });

        const trainer = { name: 'Ash', badges: [], pokemon: [ bulbasaur, squirtle ] };

        const result = trainerSchema.validate(trainer);

        expect(result.error).toBe(null);
        expect(result.object).toEqual(trainer);
    });

    test('schema with prop that is an array with object given invalid object', () => {
        const trainerSchema = new JsObjectSchema({
            name: ({ name }) => typeof name === 'string',
            badges: ({ badges }) => Array.isArray(badges),
            pokemon: [{
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            }]
        });

        const trainer = {
            name: 'Ash',
            badges: [],
            pokemon: [ { name: 'Rattata', level: 41, maxLevel: 40 }, bulbasaur, squirtle ]
        };

        const result = trainerSchema.validate(trainer);

        expect(result.error.errors.length).toBe(1);
        expect(result.error.message).toBe('Schema validation error');
        expect(result.error.errors[0].message).toBe('Error in pokemon: level is invalid.');
    });
});
