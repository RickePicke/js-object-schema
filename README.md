# js-object-schema
## A very small, flexible, easy to use, javascript object validation tool.

### Install
```bash
$ npm install js-object-schema
```

### Usage
```javascript
// Import  
import JsObjectSchema from 'js-object-schema';
// Or: const JsObjectSchema = require('js-object-schema');

// Create schema
const schema = new JsObjectSchema('Pokemon', {
    name: ({ name }) => typeof name === 'string', 
    maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
    level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
})

const pokemon = { name: 'Picachu', level: 99, maxLevel: 99};

const result = schema.validate(object);

// Check result
if (result.error) {
    // Do somthing with the errors if any
}
```
### Api Reference
#### _JsObjectSchema(name, schema, options)_
| Argument                          | Description                                                                  | Default value                                       |
|-----------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------|
| name:&nbsp;`String`               | The name of the schema. Providing name will give more accurate error message | `'Object'`                                          |
| schema:&nbsp;[Schema](#Schema)    | See Schema reference.                                                        | `{}`                                                |
| options:&nbsp;[Options](#Options) | See Options reference                                                        | `{parseObject: false, rootObjectValidation: null }` |

#### _JsObjectSchema.validate(object)_
Call this function to validate an object 

| Argument           | Description                         | Default value |
|--------------------|-------------------------------------|---------------|
| object:&nbsp;`Object` | The object that should be validated | `undefined`   |

| Return Value        | Description                                          | Example                                              |
|---------------------|------------------------------------------------------|------------------------------------------------------|
| result              | An object containing the validated object and error  | `{ object: Object, error: null }`                    |
| result.object       | The validated and optionally parsed object.          | `{ key: 'value' }`                                   |
| result.error        | The error object. When no errors, this is null.      | `{ message: 'Schema validation error', errors: [] }` |
| result.error.errors | The validation errors for each prop.                 | `[ new Error("'key' is invalid") ]`                  |

##### Example
```javascript
const JsObjectSchema = require('js-object-schema');
const schema = new JsObjectSchema('Pokemon', {
    name: ({ name }) => typeof name === 'string', 
    maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
    level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
}, { parseObject: true });

const pokemon = { name: 'Picachu', level: 99, maxLevel: 99 };
const { error, object } = schema.validate(object);
```

#### Schema
The schema should be an object that reflects the object it should validate. The schema property can be a function, array or JsObjectSchema.

##### Basic Schema
A schema property function is called with the whole object as argument. If it returns true, the property is interpreted as valid:
```javascript
const pokemonSchema = new JsObjectSchema('Pokemon', {
    name: ({ name }) => typeof name === 'string', // name must be a string 
    maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0, // maxLevel must be a number grater than 0
    level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel // level must be a number lesser than or equal to maxLevel
});
```

##### Nested Schemas
The schema can be nested! Simply create an object within the schema object:
```javascript
const trainerSchema = new JsObjectSchema('Pokemon', {
    name: ({ name }) => typeof name === 'string',
    badges: ({ badges }) => Array.isArray(badges),
    pokemon: {
        name: ({ name }) => typeof name === 'string',
        maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
        level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
    },
});
```
Or create a schema and map it to the prop:
```javascript
const pokemonSchema = new JsObjectSchema('Pokemon', { /* ..props */ });

const trainerSchema = new JsObjectSchema('Pokemon', {
    // ...props
    pokemon: pokemonSchema,
});
```
If the property is an array, simply put the validation function, object or schema inside an array. Each item in the array will be validated:
```javascript
const trainerSchema = new JsObjectSchema('Pokemon', {
    pokemon: [ pokemonSchema ],
    bag: [ { /*.. props */ } ],
    badges: [ (badge) => badge !== null ]
});
```
#### Options
| Prop                                  | Description                                                                                           | Default value |
|---------------------------------------|-------------------------------------------------------------------------------------------------------|---------------|
| parseObject:&nbsp;`Boolean`           | When true, the object will pe parsed to match the schema. Not inherited by nested schemas.            | `false`       |
| rootObjectValidation:&nbsp;`function` | A function that is invoked with the root object. When returning true, object is interpreted as valid. | `null`        |

## License
[MIT](./LICENSE)

Enjoy!
