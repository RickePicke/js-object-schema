import { curry } from './utils';

const defaultOptions = {
    parseObject: false,
    strict: false,
    name: null,
    notNil: false,
    notEmpty: false
};

class JsObjectSchema {
    constructor(schema, options = {}) {
        this.schema = schema || {};
        this.options = { ...defaultOptions, ...options };
        this._createValidationErrors = curry((schema, object, validationErrors, key) => {
            const schemaNode = schema[key];
            const value = object ? object[key] : null;

            if (typeof schemaNode === 'function') {
                const errorSuffix = `Error in ${this.options.name || 'Root Object'}: `;
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
        });

        this._handleNonFunctionSchemaNode = curry((schemaNode, key, validationErrors, obj) => {
            const schemaObj = schemaNode instanceof JsObjectSchema
                ? schemaNode
                : new JsObjectSchema(schemaNode, { name: key });

            const { error } = schemaObj.validate(obj, key);
            return error ? [ ...validationErrors, ...error.errors ] : validationErrors;
        });

        return this;
    }

    validate(object, key = this.options.name) {
        const strictError = this._getOptionalError(Object, key);
        if (strictError) {
            return strictError;
        }

        const validationErrors = Object
            .keys(this.schema)
            .reduce(this._createValidationErrors(this.schema, object), []);

        return {
            object: this.options.parseObject ? this._parseObject(object) : object,
            error: !validationErrors.length ? null : { message: 'Schema validation error', errors: validationErrors }
        };
    }

    _parseObject(object) {
        return Object.keys(this.schema)
            .reduce((acc, key) => ({ ...acc, [key]: object[key] }), {});
    }

    _getOptionalError(object, key) {
        const message = 'Schema validation error';
        const objName = key || 'Root Object';

        if (this.options.notNil && !object) {
            return { object, error: { message, errors: [ new Error(`${objName} must not be nil.`) ] } };
        }

        if (this.options.notEmpty && (!object || !Object.keys(object).length)) {
            return { object, error: { message, errors: [ new Error(`${objName} must not be empty.`) ] } };
        }

        if (this.options.strict && JSON.stringify(Object.keys(this.schema).sort()) !== JSON.stringify(Object.keys(object).sort())) {
            return { object, error: { message, errors: [ new Error(`${objName} include properties that is not in schema`) ] } };
        }

        return null;
    }
}

export default JsObjectSchema;
