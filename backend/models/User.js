//in this file we use mongoose to create a model to enable us to communicate with our MongoDB Database
//Import the mongoose library
const mongoose = require(`mongoose`);

//Define a schema for the "User" documents.
//The schema defines the structure and types of fields for user documents:
const Schema = mongoose.Schema;

//In this schema, I've defined fields for the user's name, email, password, and date of birth, each with its respective data type.
const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    verified: Boolean
});

//Create a Mongoose model based on the "UserSchema". The model is named "User":
//The mongoose.model function creates a model that represents a collection in your MongoDB database. In this case, it represents the "User" collection.
const User = mongoose.model(`User`, UserSchema);


//Export the "User" model to make it available for use in other parts of your application:
module.exports = User;

//Now, you can use the "User" model to interact with the "User" collection in your MongoDB database.
//You can perform operations like inserting, updating, querying, and deleting user documents in your database using this model