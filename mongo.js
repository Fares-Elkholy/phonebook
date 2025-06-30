const mongoose = require('mongoose')

if (process.argv.length < 3 || process.argv.length > 5) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://felkholy:${password}@cluster0.5ukrnyd.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
    name: String,
    number: String,
})


const Phone = new mongoose.model('Phone', phoneSchema)

if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const newPhone = new Phone({
        name: name,
        number: number,
    })

    newPhone.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
    console.log('phonebook:')
    Phone.find({}).then(result => {
        result.forEach(r =>{
            console.log(`${r.name} ${r.number}`)
        })

        mongoose.connection.close()
    })
}
