import { curry } from './utils';

const defaultOptions = {
    parseObject: false,
    rootObjectValidation: null
};

class JsObjectSchema {
    constructor(name, schema, options = {}) {
        this.name = name || 'Object';
        this.schema = schema || {};
        this.options = { ...defaultOptions, ...options };

        this._handleNonFunctionSchemaNode = curry((schemaNode, key, validationErrors, val) => {
            const schemaObj = this._getSchemaObject(schemaNode, key);
            const { error } = schemaObj.validate(val);
            return error ? [ ...validationErrors, ...error.errors ] : validationErrors;
        });

        this._handleFunctionSchemaNode = curry((validationFunc, key, validationErrors, val) => {
            const errorSuffix = `Error in ${this.name}: `;
            return validationFunc(val)
                ? validationErrors
                : [ ...validationErrors, Error(`${errorSuffix}${key} is invalid.`) ];
        });

        return this;
    }

    validate(object) {
        const rootObjectValidationError = this._getRootObjectValidationError(Object);
        if (rootObjectValidationError) {
            return rootObjectValidationError;
        }

        const validationErrors = Object
            .keys(this.schema)
            .reduce(this._getValidationErrors(object), []);

        return {
            object: this.options.parseObject ? this._parseObject(object) : object,
            error: !validationErrors.length ? null : { message: 'Schema validation error', errors: validationErrors }
        };
    }

    _getSchemaObject(schemaNode, key) {
        return schemaNode instanceof JsObjectSchema
            ? schemaNode
            : new JsObjectSchema(key, schemaNode);
    }

    _getValidationErrors(object) {
        return (validationErrors, key) => {
            const schemaNode = this.schema[key];
            const value = object ? object[key] : null;

            if (typeof schemaNode === 'function') {
                return this._handleFunctionSchemaNode(schemaNode, key, validationErrors, object);
            }

            if (Array.isArray(schemaNode) && typeof schemaNode[0] === 'function') {
                return value.reduce(this._handleFunctionSchemaNode(schemaNode, key), validationErrors);
            }

            if (Array.isArray(schemaNode)) {
                return value.reduce(this._handleNonFunctionSchemaNode(schemaNode[0], key), validationErrors);
            }

            if (schemaNode && typeof schemaNode === 'object') {
                return this._handleNonFunctionSchemaNode(schemaNode, key, validationErrors, object[key]);
            }

            throw new Error(`Error for key '${key}': Handler must be a function or JsObjectSchema`);
        };
    };

    _getRootObjectValidationError(object) {
        const { rootObjectValidation } = this.options;
        const handler = (rootObjectValidation && rootObjectValidation.handler)
            ? rootObjectValidation.handler
            : rootObjectValidation;

        const errorMessage = (rootObjectValidation && rootObjectValidation.errorMessage)
            ? rootObjectValidation.errorMessage
            : `${this.name} is invalid`;

        if (typeof handler === 'function' && !handler(object)) {
            return { object, error: { message: 'Root Object Validation error', errors: [ new Error(errorMessage) ] } };
        }

        if (handler) {
            console.warn('Option rootObjectValidation is used incorrectly. No validation made for root object. Check docs for usage.');
        }

        return null;
    }

    _parseObject(object) {
        return Object.keys(this.schema)
            .reduce((parsedObject, key) => {
                const schemaNode = this.schema[key];
                const value = object[key];

                if (schemaNode && typeof schemaNode === 'object' && !Array.isArray(schemaNode)) {
                    const schemaObj = this._getSchemaObject(schemaNode, key);
                    return { ...parsedObject, [key]: schemaObj.options.parseObject ? schemaObj._parseObject(value) : value };
                }

                if (Array.isArray(schemaNode)) {
                    const schemaObj = this._getSchemaObject(schemaNode[0], key);
                    const parsedArray = value.reduce((array, item) => [
                        ...array,
                        schemaObj.options.parseObject ? schemaObj._parseObject(item) : item
                    ], []);

                    return { ...parsedObject, [key]: parsedArray };
                }

                return ({ ...parsedObject, [key]: object[key] });
            }, {});
    }
}

export default JsObjectSchema;
