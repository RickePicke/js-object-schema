const defaultOptions = {
    parseObject: false
};

export default class {
    constructor(schema, options = {}) {
        this.schema = schema || {};
        this.options = { ...defaultOptions, ...options };
        return this;
    }

    validate(object) {
        const executeValidationOnKey = (acc, key) => {
            const handleValidation = (errors, validationNode) => {
                if (typeof validationNode === 'object' && validationNode !== null) {
                    if (typeof validationNode.handler !== 'function') {
                        throw new Error(`Error for key '${key}': Handler must be a function`);
                    }

                    return validationNode.handler(object || {})
                        ? errors
                        : [ ...errors, new Error(validationNode.errorMessage || `${key} is invalid.`) ];
                }

                if (typeof validationNode === 'function') {
                    return validationNode(object || {}) ? errors : [ ...errors, new Error(`${key} is invalid.`) ];
                }

                throw new Error(`Error for key '${key}': Handler must be a function`);
            };

            const schemaKey = this.schema[key];
            if (Array.isArray(schemaKey)) {
                return schemaKey.reduce(handleValidation, acc);
            } else {
                return handleValidation(acc, schemaKey);
            }
        };

        const errors = Object
            .keys(this.schema)
            .reduce(executeValidationOnKey, []);

        return {
            object: this.options.parseObject ? this._parseObject(object) : object,
            error: !errors.length ? null : { message: 'Schema validation error', errors }
        };
    }

    _parseObject(object) {
        return Object.keys(this.schema)
            .reduce((acc, key) => ({ ...acc, [key]: object[key] }), {});
    }
};
