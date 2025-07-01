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
        res.json(foundNumber)
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

app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    const { name, number } = req.body

    Phone.findById(id).then(person => {
        if (!person) {// if person is not in DB
            return res.status(404).end()
        }
        person.name = name
        person.number = number

        person.save().then(updatedPerson => {
            res.json(updatedPerson)
        })
    }).catch(error => {
        console.log(error)
        next(error)
    })
})


app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id

    Phone.findByIdAndDelete(id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))

    res.status(204).end()
})

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = 3001
app.listen(PORT)


