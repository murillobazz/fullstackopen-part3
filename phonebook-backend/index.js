const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());

morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
  res.json(persons);
})

app.post('/api/persons', (req, res) => {
  const body = req.body;
  const alreadyExists = persons.find(person => person.name === body.name);

  if (!body.name || !body.number) {
    return res.status(400).json({
      error : "content missing"
    })
  }

  if (alreadyExists) {
    return res.status(400).json({
      error: "name must be unique"
    })
  }

  const newPerson = {
    id: Math.floor(Math.random() * 600),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(newPerson);

  res.json(newPerson);
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).send('Person not found').end();
  }
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

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})