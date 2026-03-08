const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/assetmanagement');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();

    for (const u of users) {
        console.log(`User: ${u.email}`);
        console.log(`Hash: ${u.password}`);

        let isMatch = false;
        if (u.password && u.password.startsWith('$')) {
            isMatch = await bcrypt.compare('123456', u.password);
            console.log(`Bcrypt Match with '123456': ${isMatch}`);

            isMatch = await bcrypt.compare('password', u.password);
            console.log(`Bcrypt Match with 'password': ${isMatch}`);

            isMatch = await bcrypt.compare('123', u.password);
            console.log(`Bcrypt Match with '123': ${isMatch}`);
        } else {
            console.log(`Plain text match with '123': ${u.password === '123'}`);
        }
        console.log('---');
    }
    process.exit(0);
}

run().catch(console.error);
