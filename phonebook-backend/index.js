require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');

app.use(express.json()); // Express middleware to parse json responses
app.use(express.static('build'));
app.use(cors());

// Morgan is used to intercept every API call and log its details to the console
morgan.token('body', (req, res) => JSON.stringify(req.body)); // Here we define a custom token to be shown in the message that'll be logged
// Below, we call express.use on morgan with the 'fields' that'll be shown in the console message (per docs)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// The GET call has been modified to execute a callback function with a MongoDB query (find({})), it works perfectly when connected to a Mongo DB.
app.get('/api/persons', (req, res) => {
  Person.find({}).then(notes => {
    res.json(notes);
  })
})

app.post('/api/persons', (req, res) => {
  const body = req.body;
  // const alreadyExists = Person.findOne({ name : body.name });

  if (!body.name || !body.number) {
    return res.status(400).json({
      error : "content missing"
    })
  }

  // if (alreadyExists) {
  //   return res.status(400).json({
  //     error: "name must be unique"
  //   })
  // }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson.save().then(savedPerson => {
    res.json(savedPerson);    
  })

})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person);
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
})

app.get('/info', (req, res) => {
  const quantity = persons.length;
  const date = new Date();
  res.send(`<p>Phonebook has info for ${quantity} people</p><p>${date}</p>`);
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})