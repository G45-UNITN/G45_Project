//mongodb (it gives access to mongodb)
require(`./config/db`);
require(`dotenv`);


const app = require(`express`)();
const UserRouter = require(`./api/User`);
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const port = process.env.PORT || 8080;
//const port = 4500; //3000

//cors
const cors = require("cors");

// const corsOptions = {
//     origin: 'http://localhost:4500',
//     optionsSuccessStatus: 200, // Alcuni browser emettono un errore se questo non è incluso
// };

// app.use(cors(corsOptions));
//eventualmente 

app.use(cors());



// For accepting POST data
const bodyParser = require(`express`).json;
app.use(bodyParser());

app.use(`/user`, UserRouter);

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentazione delle API del progetto G45',
        },
        servers: [
            {
                url: `http://localhost:${port}/`,
            }
        ]
    },
    apis: ['./api/User.js'], // Percorso dei file contenenti le definizioni delle API
};

const spacs = swaggerJsdoc(options)
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spacs)
)
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;