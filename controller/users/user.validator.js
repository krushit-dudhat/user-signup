const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const {
  errorResponse,
} = require('../../helpers/index');

const ajv = new Ajv();
addFormats(ajv);

const updateUserSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
    },
    dob: {
      type: 'string',
      format: 'date',
    },
    gender: {
      type: 'string',
      enum: ["male", "female"],
    },
  },
};

const updateUserValidator = async (req, res, next) => {
  const validate = ajv.compile(updateUserSchema);
  const valid = validate(req.body);
  if (!valid) {
    return errorResponse(req, res, validate.errors, 400);
  }
  return next();
}

module.exports = {
  updateUserValidator,
};