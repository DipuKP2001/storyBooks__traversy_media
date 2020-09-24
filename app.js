const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session') 
const MongoStore = require('connect-mongo')(session)


dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//Body parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(methodOverride(function(req,res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    } 
}))

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
} 

const {formatDate, truncate, stripTags,editIcon} = require('./helpers/hbs')


app.engine('.hbs', exphbs({ helpers:{formatDate,truncate,stripTags,editIcon},defaultLayout: 'main' ,extname: '.hbs'}));
app.set('view engine', '.hbs');

// session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))


// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global variable
app.use(function(req,res,next){
    res.locals.user = req.user || null
    next()
})

app.use(express.static(path.join(__dirname,'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`))