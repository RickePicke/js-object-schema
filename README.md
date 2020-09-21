# js-object-schema
## A very small, easy to use, javascript object validation tool.

### Installation
```bash
$ npm install js-object-schema
```

### Usage
Pass an object where a key is the name of the prop and value is a function returning a boolean:
```javascript

// Import  
const JsObjectSchema = require('js-object-schema');
// Or: import JsObjectSchema from 'js-object-schema';

// Create schema
const schema = new JsObjectSchema({
    name: ({ name }) => typeof name === 'string', 
    maxLevel: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
    level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
})

const object = {
    name: 'Picachu',
    level: 99,
    maxLevel: 99
};

const result = schema.validate(object);
// { error: null, object: { name: 'Picachu', level: 99, maxLevel: 99 } }

if (result.error) {
    // Do somthing with the errors if any
}

```

The key values can also be objects with a handler and a custom error message:
```javascript
const schema = new JsObjectSchema({
    name: ({ name }) => typeof name === 'string', 
    maxLevel: {
        handler: ({ maxLevel }) => typeof maxLevel === 'number' && maxLevel > 0,
        errorMessage: 'maxLevel must be a number greater than 0.'
    },
    level: ({ level, maxLevel }) => typeof level === 'number' && level <= maxLevel
})

const object = {
    name: 'Charmander',
    level: 0,
    maxLevel: 0
};

const result = schema.validate(object);
// { error: [ new Error('maxLevel must be a number greater than 0.') ], object: { name: 'Picachu', level: 0, maxLevel: 0 } }

```

The value could also be an array of functions and/or objects:
```javascript
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
})

const object = {
    name: 'Squirtle',
    level: 99,
    maxLevel: 50
};

const result = schema.validate(object);
// { error: [ new Error('level must be lower or equal to maxLevel.') ], object: { name: 'Picachu', level: 99, maxLevel: 50 } }
```
Enjoy!
