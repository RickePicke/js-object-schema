# js-object-schema
## A very small, easy to use, javascript object validation tool.

### Installation
```bash
$ npm install js-object-schema
```

### Usage
```javascript

// Import  
const JsObjectSchema = require('js-object-schema');
// Or: import JsObjectSchema from 'js-object-schema';

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
Enjoy!
