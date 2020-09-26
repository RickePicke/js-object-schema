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

        this._handleNonFunctionSchemaNode = curry((schemaNode, key, validationErrors, obj) => {
            const schemaObj = schemaNode instanceof JsObjectSchema
                ? schemaNode
                : new JsObjectSchema(key, schemaNode);

            const { error } = schemaObj.validate(obj);
            return error ? [ ...validationErrors, ...error.errors ] : validationErrors;
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
            .reduce(this._createValidationErrors(object), []);

        return {
            object: this.options.parseObject ? this._parseObject(object) : object,
            error: !validationErrors.length ? null : { message: 'Schema validation error', errors: validationErrors }
        };
    }

    _createValidationErrors(object) {
        return (validationErrors, key) => {
            const schemaNode = this.schema[key];
            const value = object ? object[key] : null;

            if (typeof schemaNode === 'function') {
                const errorSuffix = `Error in ${this.name}: `;
                return schemaNode(object || {})
                    ? validationErrors
                    : [ ...validationErrors, Error(`${errorSuffix}${key} is invalid.`) ];
            }

            if (typeof schemaNode === 'object' && schemaNode !== null && !Array.isArray(schemaNode)) {
                return this._handleNonFunctionSchemaNode(schemaNode, key, validationErrors, object[key]);
            }

            if (Array.isArray(schemaNode)) {
                return value.reduce(this._handleNonFunctionSchemaNode(schemaNode[0], key), validationErrors);
            }

            throw new Error(`Error for key '${key}': Handler must be a function or JsObjectSchema`);
        };
    };

    _getRootObjectValidationError(object) {
        const { rootObjectValidation } = this.options;
        if (rootObjectValidation) {
            if (typeof rootObjectValidation.handler === 'function' && !rootObjectValidation.handler(object)) {
                return {
                    object,
                    error: {
                        message: 'Root Object validation error',
                        errors: [ new Error(rootObjectValidation.errorMessage || `${this.name} is invalid`) ]
                    }
                };
            } else {
                console.warn(`Option rootObjectValidation handler is not a function. No validation done for root object '${this.name}'.`);
            }
        }

        return null;
    }

    _parseObject(object) {
        return Object.keys(this.schema)
            .reduce((acc, key) => ({ ...acc, [key]: object[key] }), {});
    }
}

export default JsObjectSchema;
