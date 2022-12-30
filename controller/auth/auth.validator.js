const Ajv = require('ajv');
const addFormats = require("ajv-formats")
const {
  errorResponse,
} = require('../../helpers/index');

const ajv = new Ajv();
addFormats(ajv);

const signupSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 16,
    },
    name: {
      type: 'string',
      minLength: 3,
    },
  },
  required: ['email', 'password', 'name'],
  additionalProperties: false,
}

const loginSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 16,
    },
  },
  required: ['email', 'password'],
  additionalProperties: false,
}

const signupValidator = async (req, res, next) => {
  const validate = ajv.compile(signupSchema);
  const valid = validate(req.body);
  if (!valid) {
    return errorResponse(req, res, validate.errors, 400);
  }
  next();
}

const loginValidator = async (req, res, next) => {
  const validate = ajv.compile(loginSchema);
  const valid = validate(req.body);
  if (!valid) {
    return errorResponse(req, res, validate.errors, 400);
  }
  next();
}

module.exports = {
  signupValidator,
  loginValidator,
};
