const express = require('express')
const morgan = require('morgan')
const sameOrigin = require('cors')
const app = express()

//Ahora habilitamos al backend para que pueda entender desplegar el frontend.
app.use(express.static('dist'))
//Usamos el json parser incluido en express para que asi cuando se ejecute la peticion POST, el servidor entienda la información que llega y que debe agrecar a la api
app.use(express.json())
//Evitamos el problema de mismo origen activando el protocolo cors
app.use(sameOrigin())
//Debo crear un token morgan nuevo para que se use en caso de que el metodo sea post, puedo llamarlo body
morgan.token('body', (request) => request.method === 'POST' ? JSON.stringify(request.body):'')

//El uso de este middleware me permite conocer detalles de la solicitud
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

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

app.get('/',(request,response) =>{
    response.send('<h1>Página informativa</h1>')
})

app.get('/api/persons', (request,response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const contact = persons.find(person => person.id === Number(id))
    response.json(contact)
})

app.get('/info', (request,response) => {
    const date = new Date()
    response.send(
        `<p>Phonebook has info for ${persons.length} persons</p>
        <p>${date}</p>`
    )
})

app.post('/api/persons', (request,response) => {    
    const data = request.body

    if (!data || !data.number || !data.name) {
        response.status(400).json({
            ErrorMessage:'Hay un error, no hay contenido para agregar'
        })
        return
    }

    if (persons.find(person => person.name.replace(/\s/g,'').toLocaleLowerCase() === data.name.replace(/\s/g,'').toLocaleLowerCase())) {
        response.status(400).json({
            ErrorMessage:'Valor duplicado, debe ser unico'
        })//.end()no funciona
        return
    }

    const ids = persons.map(person => person.id)
    const maxId = Math.max(...ids)//se divide el array en variables separadas

    const newContact = {
        id: maxId + 1,
        name: data.name,
        number: data.number
    }

    persons = persons.concat(newContact)

    response.status(201).json(newContact)
})

app.delete('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

//En caso de que la solicitud no encuentre una url valida, ejecutara esta funcion.
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
//usara el .use para ejecutar ete endpoint.
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Estoy escuchando el puerto ${PORT}`)
})