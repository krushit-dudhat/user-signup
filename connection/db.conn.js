const mongoose = require('mongoose');
const { envConst } = require('../helpers/constants');

const connectionParam = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

exports.connect = async () => {
  mongoose.set('debug', envConst.DB_DEBUG_MODE);
  mongoose.set('strictQuery', false);
  try {
    if (envConst.NODE_ENV === 'test') {
      await mongoose.connect(`${envConst.DB_DIALECT}://${envConst.DB_HOST}:${envConst.DB_PORT}/test_db`, connectionParam);
    } else {
      await mongoose.connect(`${envConst.DB_DIALECT}://${envConst.DB_HOST}:${envConst.DB_PORT}/${envConst.DB_NAME}`, connectionParam);
    }
    console.log('Connected to database');
  } catch (error) {
    console.log('Error in connecting to database', error);
    process.exit(1);
  }
}

exports.removeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};
