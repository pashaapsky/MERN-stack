const express = require('express');
const config = require('config');
const mongoose = require('mongoose');

const app = express();

//для обработки сервером(express) json // проблема в body
app.use(express.json({ extended: true}));

//регистрация routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/link', require('./routes/link.routes'));
app.use('/t', require('./routes/redirect.routes'));

const PORT = config.get('port') || 5000;

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        app.listen(PORT, () => console.log(`App has been started on port ${PORT}`));
    } catch (e) {
        process.exit(1)
    }
}

start();


