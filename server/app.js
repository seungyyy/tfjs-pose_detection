const express = require('express');
const app = express();
const port = 5500;

app.listen(port, () => { 
  console.log(port, "is port number [server open]")
})

app.use(express.json())