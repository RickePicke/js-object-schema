import JsObjectSchema from '../src/index';

const squirtle = { name: 'Squirtle', level: 5, maxLevel: 99 };
const bulbasaur = { name: 'Bulbasaur', level: 5, maxLevel: 99 };
const pikachu = { name: 'Pikachu', level: 99, maxLevel: 99 };

describe('JsObjectSchema', () => {
    describe('Basics', () => {
        test('plain schema given valid object', () => {
            const schema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            });

            const result = schema.validate(pikachu);

            expect(result.error).toBe(null);
            expect(result.object).toEqual(pikachu);
        });
    });

    describe('Nested schemas', () => {
        test('schema with prop that is a schema given valid object', () => {
            const pokemonSchema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            });

            const trainerSchema = new JsObjectSchema('Trainer', {
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
            const pokemonSchema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            });

            const trainerSchema = new JsObjectSchema('Trainer', {
                name: ({ name }) => typeof name === 'string',
                badges: ({ badges }) => Array.isArray(badges),
                pokemon: pokemonSchema
            });

            const trainer = { name: 'Ash', badges: null, pokemon: { maxLevel: 0, level: 1, name: 'missingno' } };

            const result = trainerSchema.validate(trainer);

            expect(result.error.errors.length).toBe(3);
            expect(result.error.message).toBe('Schema validation error');
            expect(result.error.errors[0].message).toBe('Error in Trainer: badges is invalid.');
            expect(result.error.errors[1].message).toBe('Error in Pokemon: maxLevel is invalid.');
            expect(result.error.errors[2].message).toBe('Error in Pokemon: level is invalid.');
        });

        test('schema with an object as prop given valid object', () => {
            const trainerSchema = new JsObjectSchema('Trainer', {
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
            const trainerSchema = new JsObjectSchema('Trainer', {
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
            const pokemonSchema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            });

            const trainerSchema = new JsObjectSchema('Trainer', {
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
            const pokemonSchema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            });

            const trainerSchema = new JsObjectSchema('Trainer', {
                name: ({ name }) => typeof name === 'string',
                badges: ({ badges }) => Array.isArray(badges),
                pokemon: [ pokemonSchema ]
            });

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
            const trainerSchema = new JsObjectSchema('Trainer', {
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
            const trainerSchema = new JsObjectSchema('Trainer', {
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

    describe('Options', () => {
        test('schema given options with parseObject true should only include props from schema and nested schemas', () => {
            const statsSchema = new JsObjectSchema('Stats', {
                attack: ({ attack }) => attack ? typeof attack === 'number' : true,
                defence: ({ defence }) => defence ? typeof defence === 'number' : true,
                speed: ({ speed }) => speed ? typeof speed === 'number' : true
            }, { rootObjectValidation: obj => obj && !!Object.keys(obj).length });

            const pokemonSchema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel,
                stats: statsSchema
            }, { parseObject: true });

            const trainerSchema = new JsObjectSchema('Trainer', {
                name: ({ name }) => typeof name === 'string',
                badges: ({ badges }) => Array.isArray(badges),
                pokemon: [ pokemonSchema ]
            }, { parseObject: true });

            const pikachuExt = { ...pikachu, attacks: [ 'Tackle', 'Leer' ], stats: { attack: 5, hp: 50 } };
            const squirtleExt = { ...squirtle, attacks: [ 'Tackle', 'Leer' ], stats: { defence: 5, hp: 50 } };

            const trainer = { name: 'Ash', badges: [], pokemon: [] };
            const trainerExt = { ...trainer, bag: [ { pokeBalls: 5 } ], pokemon: [ squirtleExt, pikachuExt ] };

            const expectedTrainer = {
                ...trainer,
                pokemon: [ { ...squirtle, stats: squirtleExt.stats }, { ...pikachu, stats: pikachuExt.stats } ]
            };

            const result = trainerSchema.validate(trainerExt);

            expect(result.object).toEqual(expectedTrainer);
        });

        test('schema given options rootObjectValidation function should return specific error when it\'s invalid', () => {
            const options = {
                rootObjectValidation: {
                    handler: obj => !!obj && typeof obj === 'object' && !Array.isArray(obj),
                    errorMessage: 'Bag must not be a non nil object.'
                }
            };

            const schema = new JsObjectSchema('Bag', {}, options);

            const result = schema.validate(null);

            expect(result.error.errors.length).toBe(1);
            expect(result.error.message).toBe('Root Object Validation error');
            expect(result.error.errors[0].message).toBe('Bag must not be a non nil object.');
        });

        test('nested schema given object with nested prop as undefined', () => {
            const pokemonSchema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            }, { rootObjectValidation: (pokemon) => !!pokemon && typeof pokemon === 'object' && !Array.isArray(pokemon) });

            const trainerSchema = new JsObjectSchema('Trainer', {
                name: ({ name }) => typeof name === 'string',
                badges: ({ badges }) => Array.isArray(badges),
                pokemon: pokemonSchema
            });

            const trainer = { name: 'Ash', badges: [] };

            const result = trainerSchema.validate(trainer);

            expect(result.error.errors.length).toBe(1);
            expect(result.error.message).toBe('Schema validation error');
            expect(result.error.errors[0].message).toBe('Pokemon is invalid.');
        });

        test('nested schema given object with nested prop as empty object', () => {
            const pokemonSchema = new JsObjectSchema('Pokemon', {
                name: ({ name }) => typeof name === 'string',
                maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
                level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
            });

            const trainerSchema = new JsObjectSchema('Trainer', {
                name: ({ name }) => typeof name === 'string',
                badges: ({ badges }) => Array.isArray(badges),
                pokemon: pokemonSchema
            });

            const trainer = { name: 'Ash', badges: [], pokemon: {} };

            const result = trainerSchema.validate(trainer);

            expect(result.error.errors.length).toBe(3);
            expect(result.error.message).toBe('Schema validation error');
            expect(result.error.errors[0].message).toBe('Error in Pokemon: name is invalid.');
            expect(result.error.errors[1].message).toBe('Error in Pokemon: maxLevel is invalid.');
            expect(result.error.errors[2].message).toBe('Error in Pokemon: level is invalid.');
        });
    });
});
