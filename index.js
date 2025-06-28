const express = require('express')
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
    response.json(persons)
})

app.get('/info', (request, response) => {
    const no = 3
    const html = `
        Phonebook has info for ${persons.length} people <br />
        ${new Date()}
    `
    response.send(html)

})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id

    const person = persons.find(p => p.id === id)

    if (!person) {
        return res.status(404).end()
    } 

    res.json(person)
    
})

app.post('/api/persons', (req, res) => {
    const id = Math.floor(Math.random() * 100000000)

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

    if (persons.find(p => p.name.toLowerCase() === body.name.toLowerCase())) {
        return res.status(400).json({
            "error": "name must be unique"
        })
    }
    
    const person = {
        id: id,
        name: body.name,
        number: body.number
    }
    
    persons = persons.concat(person)
    res.json(person)
})


app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id

    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})


const PORT = 3001
app.listen(PORT)


