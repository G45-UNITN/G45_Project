import {Form, Modal, Button, Alert} from "react-bootstrap";
import {useRef, useState} from "react";
import {addBudget} from "../../auth/actions/userActions"; // Import the addBudget function from your API
import {FiAlertTriangle} from "react-icons/fi";

export default function AddBudgetModal({show, handleClose}) {
    const [error, setError] = useState("");
    const [status, setStatus] = useState(false);

    const nameRef = useRef();
    const maxRef = useRef();
    const descRef = useRef();

    async function handleSubmit(e) {
        e.preventDefault();
        const name = nameRef.current.value;
        const amount = parseFloat(maxRef.current.value);
        const description = descRef.current.value;
        const userID = localStorage.getItem("token");
        console.log("userID: ", userID);

        const credentials = {userID, name, amount, description};

        try {
            const response = await addBudget(credentials);
            if (response.data.status === "FAILED") {
                setError(response.data.message); // Set error message from response
                setStatus(true);
            } else {
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
        }}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>New Budget</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control ref={nameRef} type="text" required placeholder="Enter a new Budget name"/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="max">
                        <Form.Label>Maximum Spending</Form.Label>
                        <Form.Control
                            ref={maxRef}
                            type="number"
                            placeholder="0 €"
                            required
                            min={0}
                            step={0.01}
                        />
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
