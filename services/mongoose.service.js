const mongoose = require('mongoose');
const helper = require('../common/helper.common');

const connectWithRetry = async () => {
    helper.log('APP.MongoDB', 'connecting...', 'success');
    await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }).catch(async (err) => {
        if (err) {
            helper.log('APP.MongoDB', 'connection failure, retrying in 3 seconds', 'error');

            await helper.sleep(3000);

            await connectWithRetry();
        }
    });
    return helper.log('APP.MongoDB', 'connected', 'success');
};

module.exports = {
    connectWithRetry
}