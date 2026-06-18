const express = require('express');
const path = require('path');
const app = express();

app.use('/HemiTyping', express.static(path.join(__dirname, 'dist')));

app.listen(8080, () => {
    console.log('Server running on http://localhost:8080/HemiTyping/');
});
