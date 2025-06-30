require('dotenv').config()
const express = require('express')
const Phone = require('./models/phone')
const morgan = require('morgan')


const app = express()

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ').concat(' ').concat(JSON.stringify(req.body))
})
)


let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    Phone.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    let no = null
    Phone.countDocuments({}).then(count => {
        const html = `
            Phonebook has info for ${count} people <br />
            ${new Date()}
        `
        response.send(html)
    })
})

app.get('/api/persons/:id', (req, res) => {
    Phone.findById(req.params.id).then(foundNumber => {
        response.json(foundNumber)
    })
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            "error": "name is missing!"
        })
    }
    if (!body.number) {
        return res.status(400).json({
            "error": "number is missing!"
        })
    }
    
    const person = new Phone({
        name: body.name,
        number: body.number,
    })
    
    person.save().then(savedPerson => {
        res.json(savedPerson)
    }).catch(error => error.message)
})


app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id

    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})


const PORT = 3001
app.listen(PORT)


