import {useState, useRef} from "react";
import {Form, Modal, Button, Alert} from "react-bootstrap";
import {addTransaction, getBudgetsByUserID, updateBudgetByBudgetID} from "../../auth/actions/userActions"
import {FiAlertTriangle} from "react-icons/fi";

export default function AddExpenseModal({show, handleClose, defaultBudgetId}) {
    const nameRef = useRef();
    const amountRef = useRef();
    const budgetIdRef = useRef();
    const descRef = useRef();
    const userID = localStorage.getItem("token");

    const [error, setError] = useState("");
    const [status, setStatus] = useState(false);
    const [budgets, setBudgets] = useState([]);
    const [selectedBudgetId, setSelectedBudgetId] = useState("");


    const fetchBudgets = async () => {
        console.log("asda");
        try {
            // Sostituisci con la tua funzione per ottenere i budget dall'API
            const response = await getBudgetsByUserID(userID);
            setBudgets(response.data);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        }
    }


    async function handleSubmit(e) {
        e.preventDefault();
        const name = nameRef.current.value;
        const amount = parseFloat(amountRef.current.value);
        const description = descRef.current.value;
        const budgetID = budgetIdRef.current.value;

        const credentials = {budgetID, name, amount, description};

        try {
            const response = await addTransaction(credentials);
            if (response.data.status === "FAILED") {
                setError(response.data.message); // Set error message from response
                setStatus(true);
            } else {
                updateBudgetByBudgetID(budgetID, amount);
                setStatus(false);
                handleClose(); // Close the modal if the call is successful
                window.location.reload();
            }
        } catch (error) {
            console.error("An error occurred while making the request:", error);
            setError("An error occurred. Please try again."); // Generic error message
        }
    }

    return (
        <Modal show={show} onHide={() => {
            setStatus(false);
            handleClose();
        }} onShow={fetchBudgets}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>New Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control ref={nameRef} type="text" required placeholder="Name . . ."/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="amount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                            ref={amountRef}
                            type="number"
                            placeholder="0 €"
                            required
                            min={0}
                            step={0.01}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="budgetId">
                        <Form.Label>Budget</Form.Label>
                        <Form.Select defaultValue={defaultBudgetId} ref={budgetIdRef} value={selectedBudgetId}
                                     onChange={(e) => setSelectedBudgetId(e.target.value)}>
                            <option value="">Select a Budget</option>
                            {budgets.map((budget) => (
                                <option key={budget._id} value={budget._id}>{budget.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control ref={descRef} as="textarea" rows="3" required placeholder="Enter a text . . ."/>
                    </Form.Group>
                    <Alert show={status} variant={"danger"}
                           className={"py-1 fw-bold text-center d-flex align-items-center justify-content-center"}>
                        <FiAlertTriangle className="me-2"/>
                        <span className="me-2">{error}</span>
                    </Alert>
                    <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit">
                            Add
                        </Button>
                    </div>
                </Modal.Body>
            </Form>
        </Modal>
    );
}
