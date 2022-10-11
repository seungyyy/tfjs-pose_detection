const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

dotenv.config({ path: 'variables.env' });
const port = process.env.PORT || 5000;

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Connected DB');
    }
  }
);


app.listen(port, () => { 
  console.log(port, "is port number [server open]")
})

app.use(cors());
app.use(express.json())