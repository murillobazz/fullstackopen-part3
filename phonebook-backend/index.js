require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');

app.use(express.json()); // Express middleware to parse json responses, must be between the first ones always.
app.use(express.static('build')); // Express middleware to serve static files through the backend 
// (parameter is the the build directory), it makes it that the backend can be accessed through the browser.

app.use(cors()); // Express middleware to handle cors error on the server side;
// Morgan is used to intercept every API call and log its details to the console
morgan.token('body', (req, res) => JSON.stringify(req.body)); // Here we define a custom token to be shown in the message that'll be logged
// Below, we call express.use on morgan with the 'fields' that'll be shown in the console message (per docs)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const ErrorHandler = (err, req, res, next) => {
  consoleError(err.message);
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ error: err.message })
  }

  next(err);
}
app.use(ErrorHandler); // Middleware for handling errors, should be stated last.

// The GET ALL call has been modified to execute a callback function with a MongoDB query (find({})),
// it works perfectly when connected to a Mongo DB.
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  })
})

// POST Person - Already working with the database, using the Person model.
app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error : "content missing"
    })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson.save()
    .then(savedPerson => {
      res.json(savedPerson);    
    })
    .catch(err => next(err));
})

// GET By ID
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(err => next(err))
})

// PUT By Name
app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(err => next(err))
})

// DELETE Person
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      if(!result) {
        console.log(`This person had already been removed.`)
      }
      res.status(204).end();
    })
    .catch(err => next(err));
})

// GET /info
app.get('/info', (req, res) => {
  const date = new Date();

  Person.find({})
    .then(persons => {
      const quantity = persons.length;
      res.send(`<p>Phonebook has info for ${quantity} people</p><p>${date}</p>`);
    })
    .catch(err => next(err));

})

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})