const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const News = require('../models/News');

const baseURL = "http://localhost:4500";


describe('Testing the "/signup" endpoint', () => {

    const existingUser = {
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
        dateOfBirth: "1990-01-01"
    };

    beforeEach(async () => {
        // Creare un utente fittizio nel database prima di ogni test
        await User.create(existingUser);
    });

    afterEach(async () => {
        // Eliminare l'utente fittizio dal database dopo ogni test
        await User.deleteOne({ email: existingUser.email });
    });

    test("API call with existing email", async () => {
        // Creare un nuovo utente con lo stesso indirizzo email
        const newUser = {
            name: "New User",
            email: "existing@example.com",
            password: "newpassword123",
            dateOfBirth: "1990-01-01"
        };

        const response = await request(baseURL)
            .post('/user/signup')
            .send(newUser);

        // Verificare che la risposta indichi che un utente con lo stesso indirizzo email esiste già
        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(105);
        expect(response.body.message).toEqual('A user with the provided email already exists');
    });
    test("API call with empty input fields", async () => {
        const emptyUser = {
            name: "",
            email: "",
            password: "",
            dateOfBirth: ""
        };

        const response = await request(baseURL)
            .post('/user/signup')
            .send(emptyUser);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(100);
        expect(response.body.message).toEqual('Empty input fields');
    });
    test("API call with invalid name containing numbers", async () => {
        const invalidNameUser = {
            name: "Test123",
            email: "test@example.com",
            password: "TestPassword123",
            dateOfBirth: "1990-01-01"
        };

        const response = await request(baseURL)
            .post('/user/signup')
            .send(invalidNameUser);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(101);
        expect(response.body.message).toEqual('Invalid name entered');
    });
    test("API call with invalid email format", async () => {
        const invalidEmailUser = {
            name: "Test User",
            email: "invalid_email_example.com",
            password: "TestPassword123",
            dateOfBirth: "1990-01-01"
        };

        const response = await request(baseURL)
            .post('/user/signup')
            .send(invalidEmailUser);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(102);
        expect(response.body.message).toEqual('Invalid email entered');
    });
    test("API call with invalid date of birth format", async () => {
        const invalidDOBUser = {
            name: "Test User",
            email: "test@example.com",
            password: "TestPassword123",
            dateOfBirth: "invalid_date"
        };

        const response = await request(baseURL)
            .post('/user/signup')
            .send(invalidDOBUser);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(103);
        expect(response.body.message).toEqual('Invalid date of birth entered');
    });
    test("API call with password too short", async () => {
        const shortPasswordUser = {
            name: "Test User",
            email: "test@example.com",
            password: "short",
            dateOfBirth: "1990-01-01"
        };

        const response = await request(baseURL)
            .post('/user/signup')
            .send(shortPasswordUser);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(104);
        expect(response.body.message).toEqual('Password is too short');
    });

});

describe('Testing the "/user/signin" endpoint', () => {


    let userId;

    beforeAll(async () => {
        // Creare un utente fittizio nel database con verification false
        const newUser = new User({
            name: "Gabriele Menestrina",
            email: "prova.gabriele@gmail.com",
            password: "provaprova",
            verified: false,
        });
        const savedUser = await newUser.save();
        userId = savedUser._id;
    });

    afterAll(async () => {
        // Eliminare l'utente fittizio dal database dopo aver completato i test
        await User.findByIdAndDelete(userId);
    });

    test("API call with unverified email", async () => {
        const inputBody = {
            email: "prova.gabriele@gmail.com",
            password: "provaprova",
        };

        const response = await request(baseURL)
            .post("/user/signin")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(302);
        expect(response.body.message).toEqual('Email hasn\'t been verified yet. Check your inbox');
    });

    test("API call with valid credentials", async () => {
        const inputBody = {
            email: "menestrina.gabriele@gmail.com",
            password: "ciaociao",
        };

        const response = await request(baseURL)
            .post("/user/signin")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(3);
        expect(response.body.message).toEqual('Signin successful');
    });

    test("API wrong", async () => {
        const inputBody = {
            email: "menestrina.gabriele@gmail.com",
            password: "dffdfdfdfd",
        };

        const response = await request(baseURL)
            .post("/user/signin")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(303);
        expect(response.body.message).toEqual('Invalid password entered');
    });

    test("API call with empty credentials", async () => {
        const inputBody = {
            email: "",
            password: "",
        };

        const response = await request(baseURL)
            .post("/user/signin")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(301);
        expect(response.body.message).toEqual('Empty credentials supplied');
    });

    test("API call with invalid credentials", async () => {
        const inputBody = {
            email: "nonexistent@example.com",
            password: "invalidpassword",
        };

        const response = await request(baseURL)
            .post("/user/signin")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(305);
        expect(response.body.message).toEqual('Invalid credentials entered');
    });

});

describe('Testing the "/budgetAdd" endpoint', () => {

    let budgetId;

    beforeEach(async () => {
        // Creare un budget fittizio nel database prima di ogni test
        const currentDateTime = new Date().toISOString().replace(/:/g, '-');
        const budgetName = `Test Prova ${currentDateTime}`;
        const newBudget = new Budget({
            userID: "6626905ad2649e7472c3baa8",
            name: budgetName,
            amount: 1000,
            description: "Test budget description",
        });
        const savedBudget = await newBudget.save();
        budgetId = savedBudget._id;
    });

    afterEach(async () => {
        // Eliminare il budget fittizio dal database dopo ogni test
        if (budgetId) {
            await Budget.findByIdAndDelete(budgetId);
        }
    });

    test("API success add budget", async () => {
        const currentDateTime = new Date().toISOString().replace(/:/g, '-');

        const budgetName = `Test Prova ${currentDateTime}`;
        const inputBody = {
            userID: "6626905ad2649e7472c3baa8",
            name: budgetName,
            amount: 1000,
            description: "Test budget description",
        };

        const response = await request(baseURL)
            .post("/user/budgetAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(6);
        expect(response.body.message).toEqual('Creation Budget');

        // Salva l'ID del budget creato per eliminarlo dopo il test
        budgetId = response.body.data._id;
    });

    test("API call with empty input fields", async () => {
        const inputBody = {
            userID: "exampleUserID",
            name: "",
            amount: 1000,
            description: "Test budget description",
        };

        const response = await request(baseURL)
            .post("/user/budgetAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(601);
        expect(response.body.message).toEqual('Empty input fields');
    });

    test("API call with negative amount", async () => {
        const inputBody = {
            userID: "exampleUserID",
            name: "Test Budget",
            amount: -1000, // Amount is negative
            description: "Test budget description",
        };

        const response = await request(baseURL)
            .post("/user/budgetAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(602);
        expect(response.body.message).toEqual('Amount must be a positive value');
    });

    test("API call with existing budget name", async () => {
        // Utilizza il budget creato nel beforeEach
        const existingBudget = await Budget.findById(budgetId);

        const inputBody = {
            userID: existingBudget.userID,
            name: existingBudget.name,
            amount: 1500,
            description: "Test budget description",
        };

        const response = await request(baseURL)
            .post("/user/budgetAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(603);
        expect(response.body.message).toEqual('A budget with the same name already exists');
    });

});

describe('Testing the "/user/budgetDelete/:id" endpoint', () => {
    let budgetId;

    beforeAll(async () => {
        // Creare un budget fittizio nel database per utilizzarlo nei test
        const newBudget = new Budget({
            userID: "6626905ad2649e7472c3baa8",
            name: "Test Budget",
            amount: 1000,
            description: "Test budget description",
        });
        const savedBudget = await newBudget.save();
        budgetId = savedBudget._id;
    });

    afterAll(async () => {
        // Eliminare il budget fittizio dal database dopo aver completato i test
        await Budget.findByIdAndDelete(budgetId);
    });

    test("API call with valid budget ID", async () => {
        const response = await request(app)
            .delete(`/user/budgetDelete/${budgetId}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(7);
        expect(response.body.message).toEqual('Budget deleted successfully');
    });

    test("API call with invalid budget ID", async () => {
        const invalidId = 'invalidId';
        const response = await request(app)
            .delete(`/user/budgetDelete/${invalidId}`);

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(701);
        expect(response.body.message).toEqual('Invalid budget ID');
    });

    test("API call with non-existing budget ID", async () => {
        const nonExistingId = '606c6ec8f3a4e335b87c05f0'; // Un ID che non esiste nel database
        const response = await request(app)
            .delete(`/user/budgetDelete/${nonExistingId}`);

        expect(response.statusCode).toEqual(404);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(702);
        expect(response.body.message).toEqual('Budget not found');
    });

});

describe('Testing the "/budgetGet/:id" endpoint', () => {

    let budgetId;

    beforeAll(async () => {
        // Creare un budget fittizio nel database per utilizzarlo nei test
        const newBudget = new Budget({
            userID: "6626905ad2649e7472c3bca8",
            name: "Test Budget",
            amount: 1000,
            description: "Test budget description",
        });
        const savedBudget = await newBudget.save();
        budgetId = savedBudget._id;
    });

    afterAll(async () => {
        // Eliminare il budget fittizio dal database dopo aver completato i test
        await Budget.findByIdAndDelete(budgetId);
    });

    test("API call with valid budget ID", async () => {
        const response = await request(baseURL)
            .get(`/user/budgetGet/${budgetId}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(8);
        expect(response.body.message).toEqual('Budget found successfully');
    });

    test("API call with invalid budget ID", async () => {
        const invalidId = "invalidId";

        const response = await request(baseURL)
            .get(`/user/budgetGet/${invalidId}`);

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(801);
        expect(response.body.message).toEqual('Invalid budget ID');
    });

    test("API call with non-existing budget ID", async () => {
        const nonExistingId = "607e89b0dd31285cc4b30c4e"; // ID non esistente nel database

        const response = await request(baseURL)
            .get(`/user/budgetGet/${nonExistingId}`);

        expect(response.statusCode).toEqual(404);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(802);
        expect(response.body.message).toEqual('Budget not found');
    });

});

describe('Testing the "/getBudgetsByUserID/:id" endpoint', () => {

    let userId;

    beforeAll(async () => {
        // Creare un utente fittizio nel database per utilizzarlo nei test
        const newBudget = new Budget({
            userID: "6626905ad2649e8e72c3baa8",
            name: "Test Budget",
            amount: 1000,
            description: "Test budget description",
        });
        const savedBudget = await newBudget.save();
        budgetId = savedBudget._id;
        userId = savedBudget.userID;
    });

    afterAll(async () => {
        // Eliminare l'utente fittizio dal database dopo aver completato i test
        await User.findByIdAndDelete(budgetId);
    });

    test("API call with valid user ID", async () => {
        const response = await request(baseURL)
            .get(`/user/getBudgetsByUserID/${userId}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(9);
        expect(response.body.message).toEqual('Budgets found successfully');
    });

    test("API call with invalid user ID", async () => {
        const invalidId = "invalidId";

        const response = await request(baseURL)
            .get(`/user/getBudgetsByUserID/${invalidId}`);

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(901);
        expect(response.body.message).toEqual('Invalid user ID');
    });

    test("API call with non-existing user ID", async () => {
        const nonExistingId = "607e89b0dd31285cc4b30c4e"; // ID non esistente nel database

        const response = await request(baseURL)
            .get(`/user/getBudgetsByUserID/${nonExistingId}`);

        expect(response.statusCode).toEqual(404);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(902);
        expect(response.body.message).toEqual('Budgets not found');
    });

});

describe('Testing the "/budgetUpdate/:budgetID" endpoint', () => {
    let budgetID;

    beforeEach(async () => {
        // Creare un budget fittizio nel database prima di ogni test
        const newBudget = new Budget({
            userID: "6626905ad2649e7472c3bca8",
            name: "Test Budget",
            current: 500,
            amount: 1000,
            description: "Test budget description",
        });
        const savedBudget = await newBudget.save();
        budgetID = savedBudget._id;
    });

    afterEach(async () => {
        // Eliminare il budget fittizio dal database dopo ogni test
        if (budgetID) {
            await Budget.findByIdAndDelete(budgetID);
        }
    });

    test("API call with valid value", async () => {
        const value = 500; // Valore da aggiungere al budget

        const response = await request(baseURL)
            .patch(`/user/budgetUpdate/${budgetID}`)
            .send({ value });

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(10);
        expect(response.body.message).toEqual('Budget updated successfully');
    });

    test("API call with invalid value", async () => {
        const value = "invalid"; // Valore non valido

        const response = await request(baseURL)
            .patch(`/user/budgetUpdate/${budgetID}`)
            .send({ value });

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1001);
        expect(response.body.message).toEqual('Invalid value provided');
    });

    test("API call with non-existing budget ID", async () => {
        const value = 500; // Valore da aggiungere al budget
        const nonExistingID = "7727805ad2649e7472c3bca8";

        const response = await request(baseURL)
            .patch(`/user/budgetUpdate/${nonExistingID}`)
            .send({ value });

        expect(response.statusCode).toEqual(404);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1002);
        expect(response.body.message).toEqual('Budget not found');
    });

});

describe('Testing the "/budgetAfterdeleteTransUpdate/:budgetID" endpoint', () => {
    let budgetID;

    beforeEach(async () => {
        // Creare un budget fittizio nel database prima di ogni test
        const newBudget = new Budget({
            userID: "6626905ad2649e7472c3bca8",
            name: "Test Budget",
            amount: 1000,
            description: "Test budget description",
            current: 500 // Considera un budget con un valore iniziale di 500
        });
        const savedBudget = await newBudget.save();
        budgetID = savedBudget._id;
    });

    afterEach(async () => {
        // Eliminare il budget fittizio dal database dopo ogni test
        if (budgetID) {
            await Budget.findByIdAndDelete(budgetID);
        }
    });

    test("API call with valid value", async () => {
        const value = 200; // Valore da sottrarre dal budget

        const response = await request(baseURL)
            .patch(`/user/budgetAfterdeleteTransUpdate/${budgetID}`)
            .send({ value });

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(11);
        expect(response.body.message).toEqual('Budget updated successfully');
    });

    test("API call with invalid value", async () => {
        const value = "invalid"; // Valore non valido

        const response = await request(baseURL)
            .patch(`/user/budgetAfterdeleteTransUpdate/${budgetID}`)
            .send({ value });

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1101);
        expect(response.body.message).toEqual('Invalid value provided');
    });

    test("API call with non-existing budget ID", async () => {
        const value = 200; // Valore da sottrarre dal budget
        const nonExistingID = "6626905ad1111e7472c3bca8";

        const response = await request(baseURL)
            .patch(`/user/budgetAfterdeleteTransUpdate/${nonExistingID}`)
            .send({ value });

        expect(response.statusCode).toEqual(404);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1102);
        expect(response.body.message).toEqual('Budget not found');
    });

});

describe('Testing the "/transactionAdd" endpoint', () => {
    let budgetID;

    beforeEach(async () => {
        // Creare un budget fittizio nel database prima di ogni test
        const newTransaction = new Transaction({
            userID: "6626905ad2649e7472c3bca8",
            name: "Test Budget",
            amount: 1000,
            description: "Test budget description",
        });
        const savedTransaction = await newTransaction.save();
        transactionID = savedTransaction._id;
    });

    afterEach(async () => {
        // Eliminare il budget fittizio dal database dopo ogni test
        if (transactionID) {
            await Budget.findByIdAndDelete(transactionID);
        }
    });

    test("API call with valid input fields", async () => {
        const inputBody = {
            budgetID: budgetID, // ID del budget appena creato
            name: "Test Transaction",
            amount: 500,
            description: "Test transaction description",
        };

        const response = await request(baseURL)
            .post("/user/transactionAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(12);
        expect(response.body.message).toEqual('Creation transaction');
    });

    test("API call with empty input fields", async () => {
        const inputBody = {
            budgetID: budgetID, // ID del budget appena creato
            name: "",
            amount: 0, // amount <= 0
            description: "",
        };

        const response = await request(baseURL)
            .post("/user/transactionAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1201);
        expect(response.body.message).toEqual('Empty input fields');
    });

    test("API call with negative amount", async () => {
        const inputBody = {
            budgetID: budgetID, // ID del budget appena creato
            name: "Test Transaction",
            amount: -100,
            description: "Test transaction description",
        };

        const response = await request(baseURL)
            .post("/user/transactionAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1202);
        expect(response.body.message).toEqual('Amount must be a positive value');
    });

    test("API call without selecting a valid budget", async () => {
        const inputBody = {
            budgetID: "", // budgetID vuoto
            name: "Test Transaction",
            amount: 500,
            description: "Test transaction description",
        };

        const response = await request(baseURL)
            .post("/user/transactionAdd")
            .send(inputBody);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1203);
        expect(response.body.message).toEqual('Select a valid Budget');
    });

});

describe('Testing the "/transactionDelete/:id" endpoint', () => {
    let transactionID;

    beforeEach(async () => {
        // Creare una transazione fittizia nel database prima di ogni test
        const newTransaction = new Transaction({
            budgetID: "1111111ad2649e7472c3bca8",
            name: "Test Transaction",
            amount: 500,
            description: "Test transaction description",
        });
        const savedTransaction = await newTransaction.save();
        transactionID = savedTransaction._id;
    });

    afterEach(async () => {
        // Eliminare la transazione fittizia dal database dopo ogni test
        if (transactionID) {
            await Transaction.findByIdAndDelete(transactionID);
        }
    });

    test("API call to delete an existing transaction", async () => {
        const response = await request(baseURL)
            .delete(`/user/transactionDelete/${transactionID}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(13);
        expect(response.body.message).toEqual('Transaction deleted successfully');

        // Verifica che la transazione sia stata eliminata correttamente dal database
        const deletedTransaction = await Transaction.findById(transactionID);
        expect(deletedTransaction).toBeNull();
    });

    test("API call to delete a non-existing transaction", async () => {
        const nonExistingTransactionID = "6626905ad1111e7472c3bca8";
        const response = await request(baseURL)
            .delete(`/user/transactionDelete/${nonExistingTransactionID}`);

        expect(response.statusCode).toEqual(404);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1302);
        expect(response.body.message).toEqual('Trans not found');
    });

    test("API call with invalid transaction ID", async () => {
        const invalidTransactionID = "non-valid";
        const response = await request(baseURL)
            .delete(`/user/transactionDelete/${invalidTransactionID}`);

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1301);
        expect(response.body.message).toEqual('Invalid trans ID');
    });
});

describe('Testing the "/transactionGet/:id" endpoint', () => {
    let budgetID;

    beforeEach(async () => {
        // Creare un budget fittizio nel database prima di ogni test
        const newBudget = new Budget({
            name: "Test Budget",
            amount: 1000,
            description: "Test budget description",
        });
        const savedBudget = await newBudget.save();
        budgetID = savedBudget._id;
    });

    afterEach(async () => {
        // Eliminare il budget fittizio dal database dopo ogni test
        if (budgetID) {
            await Budget.findByIdAndDelete(budgetID);
        }
    });

    test("API call with valid budget ID", async () => {
        const response = await request(baseURL)
            .get(`/user/transactionGet/${budgetID}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(14);
        expect(response.body.message).toEqual('trans found successfully');

        // Verifica che le transazioni associate al budget siano state recuperate correttamente
        expect(response.body.data).toHaveLength(0); // Assicurati che non ci siano transazioni inizialmente
    });

    test("API call with invalid budget ID", async () => {
        const invalidBudgetID = "invalid-id";
        const response = await request(baseURL)
            .get(`/user/transactionGet/${invalidBudgetID}`);

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1401);
        expect(response.body.message).toEqual('Invalid budget ID');
    });

});

describe('Testing the "/newsAdd" endpoint', () => {
    let newsId;

    afterEach(async () => {
        // Eliminare la notizia creata dal database dopo ogni test
        if (newsId) {
            await News.findByIdAndDelete(newsId);
        }
    });

    test("API call with valid data", async () => {
        const newsData = {
            name: "Test News",
            link: "https://example.com/news"
        };

        const response = await request(baseURL)
            .post("/user/newsAdd")
            .send(newsData);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(15);
        expect(response.body.message).toEqual('Notizia creata con successo');
        expect(response.body.data).toHaveProperty('_id'); // Verifica che l'ID della notizia sia presente nella risposta

        // Salva l'ID della notizia creata per eliminarla dopo il test
        newsId = response.body.data._id;
    });

    test("API call with missing data", async () => {
        const response = await request(baseURL)
            .post("/user/newsAdd")
            .send({});

        expect(response.statusCode).toEqual(400);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1501);
        expect(response.body.message).toEqual('Il nome e il link sono obbligatori');
    });
});

describe('Testing the "/newsDelete/:id" endpoint', () => {
    let newsId;

    beforeEach(async () => {
        // Creare una notizia fittizia nel database prima di ogni test
        const newNews = new News({
            name: "Test News",
            link: "https://example.com/news"
        });
        const savedNews = await newNews.save();
        newsId = savedNews._id;
    });

    afterEach(async () => {
        // Eliminare la notizia creata dal database dopo ogni test
        if (newsId) {
            await News.findByIdAndDelete(newsId);
        }
    });

    test("API call to delete existing news", async () => {
        const response = await request(baseURL)
            .delete(`/user/newsDelete/${newsId}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(16);
        expect(response.body.message).toEqual('Notizia eliminata con successo');
    });

    test("API call to delete non-existing news", async () => {
        // Creare un ID non esistente per simulare un tentativo di eliminazione di una notizia inesistente
        const nonExistentId = "609c8ff0e27f9e382cf65c1a";

        const response = await request(baseURL)
            .delete(`/user/newsDelete/${nonExistentId}`);

        expect(response.statusCode).toEqual(404);
        expect(response.body.status).toEqual('FAILED');
        expect(response.body.code).toEqual(1601);
        expect(response.body.message).toEqual('Notizia non trovata');
    });
});

describe('Testing the "/newsGet" endpoint', () => {

    test("API call to retrieve all news", async () => {
        const response = await request(baseURL)
            .get('/user/newsGet');

        expect(response.statusCode).toEqual(200);
        expect(response.body.status).toEqual('SUCCESS');
        expect(response.body.code).toEqual(17);
        expect(response.body.message).toEqual('Notizie trovate con successo');
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBeTruthy();
        // Verifica se il numero di notizie restituite è maggiore di zero
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test("API call to retrieve all news - Error handling", async () => {
        // Simula un errore nel recupero delle notizie impostando un URL errato
        const response = await request(baseURL)
            .get('/incorrectUrl');

        expect(response.statusCode).toEqual(404);
    });
});
