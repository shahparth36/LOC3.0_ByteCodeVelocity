require('dotenv/config');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('routes working');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on PORT ${process.env.PORT}`);
});