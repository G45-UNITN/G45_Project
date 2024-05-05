const express = require(`express`);
const router = express.Router();

// Import the MongoDB user model so we can use it now
const User = require(`./../models/User`);

// Import the MongoDB user verification model so we can use it now
const UserVerification = require(`./../models/UserVerification`);

// Import the MongoDB password reset model so we can use it now
const PasswordReset = require(`./../models/PasswordReset`);

//Import the MongoDB Budget model so we can use it now
const Budget = require(`./../models/Budget`);

//Import the MongoDB transaction model so we can use it now
const Transaction = require(`./../models/Transaction`);

//Import the MongoDB News modal so we can use it now
const News = require(`./../models/News`);

//Import the email handler from node package (nodemailer)
const nodemailer = require(`nodemailer`);

//Imprt the uuid from node package (uuid)
const {v4: uuidv4} = require(`uuid`);

//env credentials
require(`dotenv`).config();


// Password handler
const bcrypt = require(`bcrypt`);
const saltRounds = 10; // Moved saltRounds outside the function

//path for static verified page
const path = require(`path`);
const {error} = require("console");
const exp = require("constants");
const {Types} = require("mongoose");

//nodemailer stuff (transporter)
let transporter = nodemailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
});

//testing success
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Ready for message");
        console.log(success);
    }
});


// Signup
/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Registra un nuovo utente.
 *     tags:
 *       - USER
 *     description: Registra un nuovo utente nel sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *           example:
 *             name: "George Doe"
 *             email: "george@example.com"
 *             password: "password123"
 *             dateOfBirth: "1990-01-01"
 *     responses:
 *       200:
 *         description: Successo, il budget è stato creato con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Signup successful.
 *       400:
 *         description: Richiesta non valida o campi mancanti.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 1XX
 *                 message:
 *                   type: string
 *                   example: Empty input fields.
 *       500:
 *         description: Si è verificato un errore durante la creazione del budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 1XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while checking for an existing user.
 */


router.post(`/signup`, (req, res) => {
    // Taking the inputs from the body of our request
    let {name, email, password, dateOfBirth} = req.body;
    // Now we trim them of any white spaces
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    if (name == "" || email == "" || password == "" || dateOfBirth == "") {
        // If any is empty we return a JSON object with a status and a message
        res.json({
            status: "FAILED",
            code: 100,
            message: "Empty input fields"
        });
    } else if (!/^[a-zA-Z]*$/.test(name.replace(" ", ""))) {
        res.json({
            status: "FAILED",
            code: 101,
            message: "Invalid name entered"
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            code: 102,
            message: "Invalid email entered"
        });
    } else if (!new Date(dateOfBirth).getTime()) {
        res.json({
            status: "FAILED",
            code: 103,
            message: "Invalid date of birth entered"
        });
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            code: 104,
            message: "Password is too short"
        });
    } else {
        // Checking if the user already exists, using the defined function of the model we've already imported
        User.findOne({email}) // Use findOne to check if the user already exists
            .then(result => {
                if (result) {
                    // A user already exists
                    res.json({
                        status: "FAILED",
                        code: 105,
                        message: "A user with the provided email already exists"
                    });
                } else {
                    // Try to create a new User


                    // Handle the password
                    bcrypt.hash(password, saltRounds).then(hashedPassword => {
                        const newUser = new User({
                            name,
                            email,
                            password: hashedPassword,
                            dateOfBirth,
                            verified: false,
                        });

                        newUser
                            .save()
                            .then((result) => {
                                // res.json({
                                //     status: "SUCCESS",
                                //     code: 1,
                                //     message: "Signup successful",
                                //     data: result,
                                // });
                                //CAUSAVA ERRORE DOPPIO INVIO RES CLIENT

                                //handle account verification
                                sendVerificationEmail(result, res);
                            })
                            .catch((err) => {
                                res.json({
                                    status: "FAILED",
                                    code: 106,
                                    message: "An error occurred while saving the user account"
                                });
                            });
                    })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                code: 108,
                                message: "An error occurred while hashing the password"
                            });
                        });
                }
            }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                code: 109,
                message: "An error occurred while checking for an existing user"
            });
        });
    }
});

//send verification email
//id we gonna use, is the one generated by mongoDB
const sendVerificationEmail = ({_id, email}, res) => {
    //url to be used in the email
    const port = process.env.PORT || 8080;
    const currentUrl = `http://localhost:${port}/`; //4500

    //for the uniqueID we make use of the user record id, which came from the DB and combine it with the uuid package value
    const uniqueString = uuidv4() + _id;

    //mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and login into your account.</p>
        <p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a>
        to proceed.</p>`,
    };

    //hash the uniqueString
    bcrypt
        .hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {
            //set values in userVerification collection
            const newVerification = new UserVerification({
                userID: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiredAt: Date.now() + 21600000,
            });

            newVerification
                .save()
                .then(() => {
                    transporter
                        .sendMail(mailOptions)
                        .then(() => {
                            //email sent and verification record saved
                            console.log("qui");
                            res.json({
                                status: "PENDING",
                                message: "Verification email sent",
                            });
                        })
                        .catch((error) => {
                            console.log("qua");
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Verification email failed",
                            });
                        })
                })
                .catch((error) => {
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "Couldn't save verification email data!",
                    });

                })
        })
        .catch(() => {
            res.json({
                status: "FAILED",
                message: "An error occured while hashing email data!",
            })
        })
};

//verify email || only /verify and not /user beacouse in server.js we told to the applicaztion before use it to /user
/**
 * @swagger
 * /user/verify/{userID}/{uniqueString}:
 *   get:
 *     summary: Verify user with unique string
 *     tags:
 *      - USER
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to verify
 *       - in: path
 *         name: uniqueString
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique string for verification
 *     responses:
 *       '200':
 *         description: User verified successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: Verification successful. User verified.
 *       '400':
 *         description: Bad request
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: Bad request. Missing userID or uniqueString.
 *       '404':
 *         description: User not found or verification failed
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: User not found or verification failed.
 *       '500':
 *         description: Internal server error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: Internal server error occurred.
 */
router.get("/verify/:userID/:uniqueString", (req, res) => {
    let {userID, uniqueString} = req.params;

    UserVerification
        .find({userID})
        .then((result) => {
            if (result.length > 0) {
                //suer verification record exists so we proceed

                const {expiredAt} = result[0];
                const hashedUniqueString = result[0].uniqueString;

                //checking for expired unique string
                if (expiredAt < Date.now()) {
                    //record has expired so we delete it
                    UserVerification
                        .deleteOne({userID})
                        .then(result => {
                            User.deleteOne({_id: userID})
                                .then(() => {
                                    let message = "Link has expired. Please sign up again";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                                .catch((error) => {
                                    let message = "Clearing user with expired unique string failed";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                        })
                        .catch((error) => {
                            console.log(error);
                            let message = "An error occured while clearing expired user verificatio record";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })

                } else {
                    //valid record exists so we validate the user string
                    //first compare the hashed unique string

                    bcrypt
                        .compare(uniqueString, hashedUniqueString)
                        .then((result) => {
                            if (result) {
                                //string match

                                User
                                    .updateOne({_id: userID}, {verified: true})
                                    .then(() => {
                                        UserVerification
                                            .deleteOne({userID})
                                            .then(() => {
                                                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                let message = "An error occured while finalizing successful verification.";
                                                res.redirect(`/user/verified/error=true&message=${message}`);
                                            })
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        let message = "An error occured while updating user record to show verified";
                                        res.redirect(`/user/verified/error=true&message=${message}`);
                                    })

                            } else {
                                //existing record incorrect verificatio detail passed.
                                let message = "Invalid verification details passed. Checl your inbox";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            }
                        })
                        .catch((error) => {
                            let message = "An error occured while comparing unique strings.";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                }
            } else {
                //user verification record dosen't exists
                let message = "Account record dosen't exists or has been verified alrady. Please sign up or log in.";
                res.redirect(`/user/verified/error=true&message=${message}`);
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "An error occured while checking for existing user verification record";
            res.redirect(`/user/verified/error=true&message=${message}`);
        })
});

//Verified page route
/**
 * @swagger
 * /verified:
 *   get:
 *     summary: Ottiene la pagina di verifica
 *     tags:
 *      - USER
 *     description: Restituisce la pagina HTML per la verifica.
 *     responses:
 *       200:
 *         description: Pagina HTML per la verifica
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><head><title>Verifica</title></head><body><h1>Verifica</h1><p>Questa è la pagina di verifica.</p></body></html>"
 */

router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
})

// Sign-in
/**
 * @swagger
 * /user/signin:
 *   post:
 *     summary: Effettua l'accesso di un utente esistente.
 *     tags:
 *       - USER
 *     description: Effettua l'accesso di un utente esistente nel sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successo. Restituisce un messaggio di conferma.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: Signin successful.
 *       400:
 *         description: Errore nei dati inviati o credenziali non valide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 3XX
 *                 message:
 *                   type: string
 *                   example: Empty credentials supplied.
 *       500:
 *         description: Errore del server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 3XX
 *                 message:
 *                   type: string
 *                   example: An error occured while checking for existing user.
 */


router.post(`/signin`, (req, res) => {
    let {email, password} = req.body;
    // Now we trim them of any white spaces
    email = email.trim();
    password = password.trim();

    if (email === "" || password === "") {
        res.json({
            status: "FAILED",
            code: 301,
            message: "Empty credentials supplied"
        })
    } else {
        //check if user exist
        User.find({email}).then(data => {
            if (data.length) { //aggiunto questo
                //user exist

                //check if user is verified

                if (!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        code: 302,
                        message: "Email hasn't been verified yet. Check your inbox",
                    });
                } else {

                    const hashedPassword = data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if (result) {
                            //password match
                            res.json({
                                status: "SUCCESS",
                                code: 3,
                                message: "Signin successful",
                                data: data
                            })
                        } else {
                            res.json({
                                status: "FAILED",
                                code: 303,
                                message: "Invalid password entered"
                            });
                        }
                    }).catch(err => {
                        res.json({
                            status: "FAILED",
                            code: 304,
                            message: "An error occured while comparing password"
                        });
                    })

                }

            } else {
                res.json({
                    status: "FAILED",
                    code: 305,
                    message: "Invalid credentials entered"
                })
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                code: 306,
                message: "An error occured while checking for existing user"
            })
        })
    }
});

//Password reset stuff POST request from the front end
/**
 * @swagger
 * /user/requestPasswordReset:
 *   post:
 *     summary: Richiesta di reimpostazione della password.
 *     tags:
 *       - USER
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: example.simple@exe.com
 *     responses:
 *       200:
 *         description: Successo. La richiesta di reimpostazione della password è stata inviata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   code: 4
 *                 message:
 *                   type: string
 *                   example: La richiesta di reimpostazione della password è stata inviata con successo.
 *       400:
 *         description: Richiesta non valida o campi mancanti.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 4XX
 *                 message:
 *                   type: string
 *                   example: Richiesta non valida o campi mancanti.
 *       401:
 *         description: Email non verificata. Controlla la tua casella di posta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 4XX
 *                 message:
 *                   type: string
 *                   example: Email non verificata. Controlla la tua casella di posta.
 *       402:
 *         description: Nessun account con l'email fornita.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 4XX
 *                 message:
 *                   type: string
 *                   example: Nessun account con l'email fornita.
 *       403:
 *         description: Si è verificato un errore durante il controllo dell'utente esistente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 4XX
 *                 message:
 *                   type: string
 *                   example: Si è verificato un errore durante il controllo dell'utente esistente.
 */


router.post("/requestPasswordReset", (req, res) => {
    const {email, redirectUrl} = req.body;

    //check if email exists
    User
        .find({email})
        .then((data) => {
            if (data.length) {
                //user exists

                //check if user is verfied

                if (!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        code: 401,
                        message: "Email hasn't been verified yer. Check your inbox"
                    });
                } else {
                    //proceed with email to reset password
                    sendResetEmail(data[0], redirectUrl, res);
                }
            } else {
                res.json({
                    status: "FAILED",
                    code: 402,
                    message: "No account with the supplied email exists"
                });
            }
        })
        .catch((error) => {
            console.log(error);
            res.json({
                status: "FAILED",
                code: 403,
                message: "An error occured while checking for existing user"
            });
        })
})

//send password reset email

const sendResetEmail = ({_id, email}, redirectUrl, res) => {
    const resetString = uuidv4() + _id;
    console.log("id: " + _id);
    //first we clear all existing reset records
    PasswordReset
        .deleteMany({userID: _id})
        .then((result) => {
            //Reset records deleted successfully
            console.log("Deleted records:", result.deletedCount);
            //Now we send the email
            //mail options
            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Password Reset",
                html: `<p>Have you lost the password??</p> <p>Don't worry, use the link below to reset it</p>
                <p>This link <b>expires in 60 minutes</b>.</p><p>Press <a href=${redirectUrl + "/" + _id + "/" + resetString}>here</a>
                to proceed.</p>`,
            };
            // insted of the currentUrl we have used the redirectUrl becouse the currentUrl will lead us back to the server, but for the password reset we want to go back to the frontend, so we'll use the frontend link that we recived from the request

            //hash the reset string
            bcrypt
                .hash(resetString, saltRounds)
                .then(hashedResetString => {
                    //set values in password reset collection
                    const newPasswordReset = new PasswordReset({
                        userID: _id,
                        resetString: hashedResetString,
                        createdAt: Date.now(),
                        expiredAt: Date.now() + 33600000,
                    });
                    console.log("atp: " + newPasswordReset.createdAt);
                    console.log("exp " + newPasswordReset.expiredAt);

                    newPasswordReset
                        .save()
                        .then(() => {
                            transporter
                                .sendMail(mailOptions)
                                .then(() => {
                                    //reset email sent and password reset record saved
                                    res.json({
                                        status: "PENDING",
                                        message: "Password reset email sent"
                                    });
                                })
                                .catch((error) => {
                                    console.log(error)
                                    res.json({
                                        status: "FAILED",
                                        message: "Password reset email failed"
                                    });
                                })
                        })
                        .catch((error) => {
                            console.log(error)
                            res.json({
                                status: "FAILED",
                                message: "Couldn't save password reset data!"
                            });
                        })
                })
                .catch((error) => {
                    console.log(error)
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing the password reset data!"
                    });
                })
        })
        .catch((error) => {
            //error while clearing existing records
            console.log(error);
            res.json({
                status: "FAILED",
                message: "Clearing existing password reset records failed"
            });
        })
}

//Actually reset the password
/**
 * @swagger
 * /user/resetPassword:
 *   post:
 *     summary: Reimposta la password
 *     tags:
 *       - USER
 *     description: Reimposta la password dell'utente utilizzando il link inviato per il reset della password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               resetString:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successo, restituisce un messaggio di conferma.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 6
 *                 message:
 *                   type: string
 *                   example: Correct request
 *       400:
 *         description: Errore nei dati inviati o utente non trovato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 5XX
 *                 message:
 *                   type: string
 *                   example: Error data or user Error
 *       500:
 *         description: Errore del server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 5XX
 *                 message:
 *                   type: string
 *                   example: Error server
 */

router.post("/resetPassword", (req, res) => {
    let {userID, resetString, newPassword} = req.body;

    PasswordReset
        .find({userID})
        .then((result) => {
            if (result.length > 0) {
                //password reset record exists so we proceed

                // console.log("result: "+ result[0]);
                // console.log("created: "+ result[0].createdAt);
                const dateNow = new Date();
                // console.log("date: "+ dateNow);

                const {expiredAt} = result[0];
                //get the hashedResetString from the Database
                const hashedResetString = result[0].resetString;

                //checking for expired reset string
                if (expiredAt < dateNow) {
                    PasswordReset
                        .deleteOne({userID})
                        .then(() => {
                            //reset record deleted successfully
                            res.json({
                                status: "FAILED",
                                code: 501,
                                message: "Password reset link has expired"
                            });
                        })
                        .catch((error) => {
                            //deletion failed
                            console.log(error)
                            res.json({
                                status: "FAILED",
                                code: 502,
                                message: "Clearing password reset record failed"
                            });
                        })

                } else {
                    //valid reset record exists so we validate the resset string
                    //first compare the hashed reset string

                    bcrypt
                        .compare(resetString, hashedResetString)
                        .then((result) => {
                            if (result) {
                                //string matched
                                //hash password again

                                bcrypt
                                    .hash(newPassword, saltRounds)
                                    .then(hashedNewPassword => {
                                        //upsate user password

                                        User
                                            .updateOne({_id: userID}, {password: hashedNewPassword})
                                            .then(() => {
                                                //update complete. Now delete reset record
                                                PasswordReset
                                                    .deleteOne({userID})
                                                    .then(() => {
                                                        //bot user record and reset record update

                                                        res.json({
                                                            status: "SUCCESS",
                                                            code: 5,
                                                            message: "Password has been reset successfully"
                                                        });
                                                    })
                                                    .catch((error) => {
                                                        console.log(error);
                                                        res.json({
                                                            status: "FAILED",
                                                            code: 503,
                                                            message: "An error occurred while finalizing password reset."
                                                        });
                                                    })
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                res.json({
                                                    status: "FAILED",
                                                    code: 504,
                                                    message: "Updating user password failed."
                                                });
                                            })
                                    })
                                    .catch((error) => {
                                        res.json({
                                            status: "FAILED",
                                            code: 505,
                                            message: "An error occured while hashing new password"
                                        });
                                    })
                            } else {
                                //existing record but incorrect reset string passed
                                res.json({
                                    status: "FAILED",
                                    code: 506,
                                    message: "Password reset link has expired"
                                });
                            }
                        })
                        .catch((error) => {
                            res.json({
                                status: "FAILED",
                                code: 507,
                                message: "Comparing password reset strings failed"
                            });
                        })
                }
            } else {
                //password reset dosen't exists
                res.json({
                    status: "FAILED",
                    code: 508,
                    message: "Password reset request not found"
                });

            }
        })
        .catch((error) => {
            console.log(error);
            res.json({
                status: "FAILED",
                code: 509,
                message: "Checking for existing password reset record failed"
            });
        })

})

/**
 * @swagger
 * /user/budgetAdd:
 *   post:
 *     summary: Crea un nuovo budget.
 *     tags:
 *       - BUDGET
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successo, il budget è stato creato con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 6
 *                 message:
 *                   type: string
 *                   example: Creation Budget
 *       400:
 *         description: Richiesta non valida o campi mancanti.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 6XX
 *                 message:
 *                   type: string
 *                   example: Empty input fields
 *       500:
 *         description: Si è verificato un errore durante la creazione del budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 6XX
 *                 message:
 *                   type: string
 *                   example: An error has occured while saving budget
 */

router.post(`/budgetAdd`, (req, res) => {
    //Taking the inputs from the body of our request
    let {userID, name, amount, description} = req.body;
    //Now we trim them of any white spaces
    name = name.trim();
    description = description.trim();

    if (name == "" || description == "") { // || amount <= 0
        res.json({
            status: "FAILED",
            code: 601,
            message: "Empty input fields"
        });
    } else if (amount <= 0) {
        res.json({
            status: "FAILED",
            code: 602,
            message: "Amount must be a positive value"
        })
    } else {
        Budget.findOne({name, userID: req.body.userID})
            .then(result => {
                if (result) {
                    // A budget with the same name already exist
                    res.json({
                        status: "FAILED",
                        code: 603,
                        message: "A budget with the same name already exists"
                    });
                } else {
                    // try to create a new budget
                    const newBudget = new Budget({
                        userID,
                        name,
                        current: 0,
                        amount,
                        createdAt: new Date(),
                        description,
                    });
                    newBudget
                        .save()
                        .then((result) => {
                            res.json({
                                status: "SUCCESS",
                                code: 6,
                                message: "Creation Budget",
                                data: result,
                            })
                        })
                        .catch((err) => {
                            res.json({
                                status: "FAILED",
                                error: 604,
                                message: "An error has occured while saving budget",
                            });
                        });
                }
            })
            .catch((err) => {
                res.json({
                    status: "FAILED",
                    error: 605,
                    message: "An error has occured while checking for an existing budget",
                });
            });
    }
});

/**
 * @swagger
 * /user/budgetDelete/{id}:
 *   delete:
 *     summary: Elimina un budget esistente
 *     tags:
 *       - BUDGET
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del budget da eliminare.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successo, il budget è stato eliminato con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 7
 *                 message:
 *                   type: string
 *                   example: Budget deleted successfully
 *       400:
 *         description: ID del budget non valido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 7XX
 *                 message:
 *                   type: string
 *                   example: Invalid budget ID
 *       404:
 *         description: Il budget non è stato trovato nel database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 7XX
 *                 message:
 *                   type: string
 *                   example: Budget not found
 *       500:
 *         description: Si è verificato un errore durante l'eliminazione del budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 7XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while deleting the budget
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */


router.delete(`/budgetDelete/:id`, (req, res) => {
    const budgetId = req.params.id;

    // Verifica se l'ID del budget è valido
    if (!Types.ObjectId.isValid(budgetId)) {
        return res.status(400).json({
            status: "FAILED",
            code: 701,
            message: "Invalid budget ID"
        });
    }

    // Trova il budget dal database e elimina
    Budget.findByIdAndDelete(budgetId)
        .then((deletedBudget) => {
            if (!deletedBudget) {
                return res.status(404).json({
                    status: "FAILED",
                    code: 702,
                    message: "Budget not found"
                });
            }
            res.json({
                status: "SUCCESS",
                code: 7,
                message: "Budget deleted successfully",
                data: deletedBudget
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: "FAILED",
                code: 703,
                message: "An error occurred while deleting the budget",
                error: err.message
            });
        });
});


/**
 * @swagger
 * /user/budgetGet/{id}:
 *   get:
 *     summary: Ottiene un budget dal database.
 *     tags:
 *      - BUDGET
 *     description: Ottiene un budget dal database utilizzando l'ID specificato.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del budget da ottenere.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successo, restituisce il budget trovato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 8
 *                 message:
 *                   type: string
 *                   example: Budget found successfully
 *       400:
 *         description: ID del budget non valido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 8XX
 *                 message:
 *                   type: string
 *                   example: Invalid budget ID
 *       404:
 *         description: Budget non trovato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 8XX
 *                 message:
 *                   type: string
 *                   example: Budget not found
 *       500:
 *         description: Errore del server durante il recupero del budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 8XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while retrieving the budget
 *                 error:
 *                   type: string
 *                   example: Specific MongoDB error message
 */

router.get(`/budgetGet/:id`, (req, res) => {
    const budgetId = req.params.id;

    // Verifica se l'ID del budget è valido
    if (!Types.ObjectId.isValid(budgetId)) {
        return res.status(400).json({
            status: "FAILED",
            code: 801,
            message: "Invalid budget ID"
        });
    }

    // Trova il budget dal database
    Budget.findById(budgetId)
        .then((foundBudget) => {
            // Verifica se il budget è stato trovato
            if (!foundBudget) {
                return res.status(404).json({
                    status: "FAILED",
                    code: 802,
                    message: "Budget not found"
                });
            }

            // Invia il budget trovato come risposta
            res.json({
                status: "SUCCESS",
                code: 8,
                message: "Budget found successfully",
                data: foundBudget
            });
        })
        .catch((err) => {
            // Gestisci gli errori durante la ricerca del budget
            res.status(500).json({
                status: "FAILED",
                code: 803,
                message: "An error occurred while retrieving the budget",
                error: err.message
            });
        });
});

/**
 * @swagger
 * /user/getBudgetsByUserID/{id}:
 *   get:
 *     summary: Ottiene i budget per un determinato utente
 *     tags:
 *      - BUDGET
 *     description: Ottiene i budget associati all'ID dell'utente specificato.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID dell'utente per cui ottenere i budget
 *         required: true
 *         schema:
 *           type: string
 *         example: 5fc8e9a85af3950017c6d2a2
 *     responses:
 *       200:
 *         description: Successo, restituisce i budget associati all'utente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 9
 *                 message:
 *                   type: string
 *                   example: Budgets found successfully
 *       400:
 *         description: Errore dovuto a un ID utente non valido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 9XX
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 *       404:
 *         description: Nessun budget trovato per l'utente specificato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 9XX
 *                 message:
 *                   type: string
 *                   example: Budgets not found
 *       500:
 *         description: Errore del server durante la ricerca dei budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 9XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while retrieving the budgets
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.get(`/getBudgetsByUserID/:id`, (req, res) => {
    const userID = req.params.id;

    // Verifica se l'ID dell'utente è valido
    if (!Types.ObjectId.isValid(userID)) {
        return res.status(400).json({
            status: "FAILED",
            code: 901,
            message: "Invalid user ID"
        });
    }

    // Trova i budget dal database per l'ID dell'utente specificato
    Budget.find({userID: userID})
        .then((foundBudgets) => {
            // Verifica se sono stati trovati budget
            if (foundBudgets.length === 0) {
                return res.status(404).json({
                    status: "FAILED",
                    code: 902,
                    message: "Budgets not found"
                });
            }

            // Invia i budget trovati come risposta
            res.json({
                status: "SUCCESS",
                code: 9,
                message: "Budgets found successfully",
                data: foundBudgets
            });
        })
        .catch((err) => {
            // Gestisci gli errori durante la ricerca dei budget
            console.error("Error retrieving budgets:", err);
            res.status(500).json({
                status: "FAILED",
                code: 903,
                message: "An error occurred while retrieving the budgets",
                error: err.message
            });
        });
});

/**
 * @swagger
 * /user/budgetUpdate/{budgetID}:
 *   patch:
 *     summary: Aggiorna il valore di un budget in positivo
 *     tags:
 *       - BUDGET
 *     description: Aggiorna il valore corrente di un budget specificato utilizzando l'ID del budget.
 *     parameters:
 *       - in: path
 *         name: budgetID
 *         description: ID del budget da aggiornare
 *         required: true
 *         schema:
 *           type: string
 *         example: 5fc8e9a85af3950017c6d2a2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 description: Valore da aggiungere al budget corrente
 *                 example: 100
 *     responses:
 *       200:
 *         description: Successo, restituisce il budget aggiornato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 10
 *                 message:
 *                   type: string
 *                   example: Budget updated successfully
 *       400:
 *         description: Errore dovuto a un valore non valido fornito nel corpo della richiesta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 10XX
 *                 message:
 *                   type: string
 *                   example: Invalid value provided
 *       404:
 *         description: Il budget specificato non è stato trovato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 10XX
 *                 message:
 *                   type: string
 *                   example: Budget not found
 *       500:
 *         description: Errore del server durante la ricerca o l'aggiornamento del budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 10XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while updating the budget
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.patch(`/budgetUpdate/:budgetID`, (req, res) => {
    const {budgetID} = req.params;
    const {value} = req.body;

    // Verifica che il valore da aggiungere sia valido
    if (!value || isNaN(value)) {
        return res.status(400).json({
            status: "FAILED",
            code: 1001,
            message: "Invalid value provided"
        });
    }

    // Cerca il budget nel database utilizzando l'ID fornito
    Budget.findById(budgetID)
        .then(budget => {
            if (!budget) {
                return res.status(404).json({
                    status: "FAILED",
                    code: 1002,
                    message: "Budget not found"
                });
            }

            // Aggiorna il campo "current" aggiungendo il valore fornito
            budget.current += parseFloat(value); // Potresti voler convertire il valore in un numero float se necessario

            // Salva le modifiche nel database
            budget.save()
                .then(updatedBudget => {
                    res.json({
                        status: "SUCCESS",
                        code: 10,
                        message: "Budget updated successfully",
                        data: updatedBudget
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        status: "FAILED",
                        code: 1003,
                        message: "An error occurred while updating the budget",
                        error: error.message
                    });
                });
        })
        .catch(error => {
            res.status(500).json({
                status: "FAILED",
                code: 1004,
                message: "An error occurred while finding the budget",
                error: error.message
            });
        });
});

/**
 * @swagger
 * /user/budgetAfterdeleteTransUpdate/{budgetID}:
 *   patch:
 *     summary: Aggiorna il valore di un budget in negativo
 *     tags:
 *       - BUDGET
 *     description: Aggiorna il valore corrente di un budget specificato utilizzando l'ID del budget.
 *     parameters:
 *       - in: path
 *         name: budgetID
 *         description: ID del budget da aggiornare
 *         required: true
 *         schema:
 *           type: string
 *         example: 5fc8e9a85af3950017c6d2a2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 description: Valore da sottrarre al budget corrente
 *                 example: 100
 *     responses:
 *       200:
 *         description: Successo, restituisce il budget aggiornato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 11
 *                 message:
 *                   type: string
 *                   example: Budget updated successfully
 *       400:
 *         description: Errore dovuto a un valore non valido fornito nel corpo della richiesta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 11XX
 *                 message:
 *                   type: string
 *                   example: Invalid value provided
 *       404:
 *         description: Il budget specificato non è stato trovato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 11XX
 *                 message:
 *                   type: string
 *                   example: Budget not found
 *       500:
 *         description: Errore del server durante la ricerca o l'aggiornamento del budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 11XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while updating the budget
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.patch(`/budgetAfterdeleteTransUpdate/:budgetID`, (req, res) => {
    const {budgetID} = req.params;
    const {value} = req.body;

    // Verifica che il valore da aggiungere sia valido
    if (!value || isNaN(value)) {
        return res.status(400).json({
            status: "FAILED",
            code: 1101,
            message: "Invalid value provided"
        });
    }

    // Cerca il budget nel database utilizzando l'ID fornito
    Budget.findById(budgetID)
        .then(budget => {
            if (!budget) {
                return res.status(404).json({
                    status: "FAILED",
                    code: 1102,
                    message: "Budget not found"
                });
            }

            // Aggiorna il campo "current" aggiungendo il valore fornito
            budget.current -= parseFloat(value); // Potresti voler convertire il valore in un numero float se necessario

            // Salva le modifiche nel database
            budget.save()
                .then(updatedBudget => {
                    res.json({
                        status: "SUCCESS",
                        code: 11,
                        message: "Budget updated successfully",
                        data: updatedBudget
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        status: "FAILED",
                        code: 1103,
                        message: "An error occurred while updating the budget",
                        error: error.message
                    });
                });
        })
        .catch(error => {
            res.status(500).json({
                status: "FAILED",
                code: 1104,
                message: "An error occurred while finding the budget",
                error: error.message
            });
        });
});
/**
 * @swagger
 * /user/transactionAdd:
 *   post:
 *     summary: Aggiunge una nuova transazione
 *     tags:
 *      - TRANSACTIONS
 *     description: Aggiunge una nuova transazione utilizzando i dati forniti.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budgetID:
 *                 type: string
 *                 description: ID del budget a cui appartiene la transazione
 *                 example: 5fc8e9a85af3950017c6d2a2
 *               name:
 *                 type: string
 *                 description: Nome della transazione
 *                 example: Spesa supermercato
 *               amount:
 *                 type: number
 *                 description: Importo della transazione
 *                 example: 50.25
 *               description:
 *                 type: string
 *                 description: Descrizione della transazione
 *                 example: Acquisto generi alimentari
 *     responses:
 *       200:
 *         description: Successo, restituisce la transazione creata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 12
 *                 message:
 *                   type: string
 *                   example: Creation transaction
 *       400:
 *         description: Errore dovuto a campi vuoti o valori non validi nei dati della richiesta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 12XX
 *                 message:
 *                   type: string
 *                   example: Empty input fields
 *       500:
 *         description: Errore del server durante il salvataggio della transazione.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 12XX
 *                 message:
 *                   type: string
 *                   example: An error has occured while saving transaction
 */

router.post(`/transactionAdd`, (req, res) => {
    //Taking the inputs from the body of our request
    let {budgetID, name, amount, description} = req.body;
    //Now we trim them of any white spaces
    name = name.trim();
    description = description.trim();

    if (name == "") { // || amount <= 0
        res.json({
            status: "FAILED",
            code: 1201,
            message: "Empty input fields"
        });
    } else if (amount <= 0) {
        res.json({
            status: "FAILED",
            code: 1202,
            message: "Amount must be a positive value"
        })
    } else if (budgetID === "") {
        res.json({
            status: "FAILED",
            code: 1203,
            message: "Select a valid Budget",
        })
    } else {
        const newTransaction = new Transaction({
            budgetID,
            name,
            createdAt: new Date(),
            amount,
            currentAmount: 0,
            description,
        });
        newTransaction
            .save()
            .then((result) => {
                res.json({
                    status: "SUCCESS",
                    code: 12,
                    message: "Creation transaction",
                    data: result,
                })
            })
            .catch((err) => {
                res.json({
                    status: "FAILED",
                    error: 1204,
                    message: "An error has occured while saving transaction",
                });
            });
    }
});

/**
 * @swagger
 * /user/transactionDelete/{id}:
 *   delete:
 *     summary: Elimina una transazione esistente
 *     tags:
 *      - TRANSACTIONS
 *     description: Elimina una transazione esistente utilizzando l'ID della transazione.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID della transazione da eliminare
 *         required: true
 *         schema:
 *           type: string
 *         example: 5fc8e9a85af3950017c6d2a2
 *     responses:
 *       200:
 *         description: Successo, restituisce la transazione eliminata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 13
 *                 message:
 *                   type: string
 *                   example: Transaction deleted successfully
 *       400:
 *         description: Errore dovuto a un ID transazione non valido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 13XX
 *                 message:
 *                   type: string
 *                   example: Invalid trans ID
 *       404:
 *         description: La transazione specificata non è stata trovata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 13XX
 *                 message:
 *                   type: string
 *                   example: Trans not found
 *       500:
 *         description: Errore del server durante l'eliminazione della transazione.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 13XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while deleting the transaction
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.delete(`/transactionDelete/:id`, (req, res) => {
    const transID = req.params.id;

    // Verifica se l'ID del budget è valido
    if (!Types.ObjectId.isValid(transID)) {
        return res.status(400).json({
            status: "FAILED",
            code: 1301,
            message: "Invalid trans ID"
        });
    }

    // Trova il budget dal database e elimina
    Transaction.findByIdAndDelete(transID)
        .then((deleteTransaction) => {
            if (!deleteTransaction) {
                return res.status(404).json({
                    status: "FAILED",
                    code: 1302,
                    message: "Trans not found"
                });
            }
            res.json({
                status: "SUCCESS",
                code: 13,
                message: "Transaction deleted successfully",
                data: deleteTransaction
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: "FAILED",
                code: 1303,
                message: "An error occurred while deleting the transaction",
                error: err.message
            });
        });
});

/**
 * @swagger
 * /user/transactionGet/{id}:
 *   get:
 *     summary: Ottiene una transazione esistente
 *     tags:
 *      - TRANSACTIONS
 *     description: Ottiene le transazioni esistenti utilizzando l'ID del budget.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del budget
 *         required: true
 *         schema:
 *           type: string
 *         example: 5fc8e9a85af3950017c6d2a2
 *     responses:
 *       200:
 *         description: Successo, restituisce le transazioni trovate.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 14
 *                 message:
 *                   type: string
 *                   example: trans found successfully
 *       400:
 *         description: Errore dovuto a un ID budget non valido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 14XX
 *                 message:
 *                   type: string
 *                   example: Invalid budget ID
 *       404:
 *         description: La transazione specificata non è stata trovata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 14XX
 *                 message:
 *                   type: string
 *                   example: Transaction not found
 *       500:
 *         description: Errore del server durante il recupero della transazione.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 14XX
 *                 message:
 *                   type: string
 *                   example: An error occurred while retrieving the trans
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.get(`/transactionGet/:id`, (req, res) => {
    const transID = req.params.id;

    // Verifica se l'ID del budget è valido
    if (!Types.ObjectId.isValid(transID)) {
        return res.status(400).json({
            status: "FAILED",
            code: 1401,
            message: "Invalid budget ID"
        });
    }

    // Trova il budget dal database
    Transaction.find({budgetID: transID})
        .then((foundTrans) => {
            // Verifica se la transizione è stata trovata
            if (!foundTrans) {
                return res.status(404).json({
                    status: "FAILED",
                    code: 1402,
                    message: "Transaction not found"
                });
            }

            // Invia il trans trovato come risposta
            res.json({
                status: "SUCCESS",
                code: 14,
                message: "trans found successfully",
                data: foundTrans
            });
        })
        .catch((err) => {
            // Gestisci gli errori durante la ricerca del trans
            res.status(500).json({
                status: "FAILED",
                code: 1403,
                message: "An error occurred while retrieving the trans",
                error: err.message
            });
        });
});



/**
 * @swagger
 * /user/newsAdd:
 *   post:
 *     summary: Crea una nuova notizia
 *     tags:
 *       - NEWS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Il nome della notizia
 *               link:
 *                 type: string
 *                 format: uri
 *                 description: Il link referenziale della notizia
 *             required:
 *               - name
 *               - link
 *     responses:
 *       '200':
 *         description: Notizia creata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 15
 *                 message:
 *                   type: string
 *                   example: Notizia creata con successo
 *       '400':
 *         description: Parametri di input non validi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 15XX
 *                 message:
 *                   type: string
 *                   example: Il nome e il link sono obbligatori
 */


router.post('/newsAdd', async (req, res, next) => {
    try {
        const {name, link} = req.body;
        if (!name || !link) {
            return res.status(400).json({
                status: "FAILED",
                code: 1501,
                message: "Il nome e il link sono obbligatori"
            });
        }
        const news = new News({name, link});
        await news.save();
        // Includi l'intero oggetto della notizia nella risposta JSON
        res.status(200).json({
            status: "SUCCESS",
            code: 15,
            message: "Notizia creata con successo",
            data: news
        });
    } catch (err) {
        next(err);
    }
});



// Route per eliminare una notizia esistente
/**
 * @swagger
 * /user/newsDelete/{id}:
 *   delete:
 *     summary: Elimina una notizia esistente
 *     tags:
 *       - NEWS
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID della notizia da eliminare
 *     responses:
 *       '200':
 *         description: Notizia eliminata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 16
 *                 message:
 *                   type: string
 *                   example: Notizia eliminata con successo
 *       '404':
 *         description: Notizia non trovata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 16XX
 *                 message:
 *                   type: string
 *                   example: Notizia non trovata
 */
router.delete('/newsDelete/:id', async (req, res, next) => {
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);
        if (!deletedNews) {
            return res.status(404).json({
                status: "FAILED",
                code: 1601,
                message: "Notizia non trovata"
            });
        }
        res.json({
            status: "SUCCESS",
            code: 16,
            message: "Notizia eliminata con successo"
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /user/newsGet:
 *   get:
 *     summary: Ottiene tutte le notizie dal database
 *     description: Ottiene tutte le notizie dal database.
 *     tags:
 *      - NEWS
 *     responses:
 *       200:
 *         description: Successo, restituisce tutte le notizie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 code:
 *                   type: integer
 *                   example: 17
 *                 message:
 *                   type: string
 *                   example: Notizie trovate con successo
 *       500:
 *         description: Errore del server durante il recupero delle notizie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 code:
 *                   type: integer
 *                   example: 17XX
 *                 message:
 *                   type: string
 *                   example: Si è verificato un errore durante il recupero delle notizie
 *                 error:
 *                   type: string
 *                   example: Messaggio di errore dettagliato
 */


router.get('/newsGet', async (req, res, next) => {
    try {
        const allNews = await News.find();
        res.json({
            status: "SUCCESS",
            code: 17,
            message: "Notizie trovate con successo",
            data: allNews
        });
    } catch (err) {
        next({
            status: "FAILED",
            code: 1701,
            message: "Si è verificato un errore durante il recupero delle notizie",
            error: err.message
        });
    }
});

module.exports = router;
