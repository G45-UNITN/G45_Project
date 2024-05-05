import { Modal, Button, Stack} from "react-bootstrap"
import { currencyFormatter } from "./utils"
import {getTransaction, deleteTransaction, updateBudgetByBudgetIDAfterDeleteTransaction, deleteBudget} from "../../auth/actions/userActions";
import {useState} from "react";
import { BsInfoSquare } from "react-icons/bs";


export default function ViewExpensesModal({ show, budgetId, handleClose }) {

    const [expenses, setExpenses] = useState([]);
    const fetchBudgets = async () => {
        try {
            // Sostituisci con la tua funzione per ottenere i budget dall'API
            const values = await getTransaction(budgetId);
            setExpenses(values.data);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        }
    }

    return (
        <Modal show={show} onHide={() => handleClose()} onShow={fetchBudgets} >
            <Modal.Header closeButton>
                <Modal.Title>
                    <Stack direction="horizontal" gap="2">
                        <div>Expenses - </div>
                        {(
                            <Button
                                onClick={() => {
                                    deleteBudget(budgetId)
                                    handleClose()
                                    window.location.reload();
                                }}
                                variant="outline-danger"
                            >
                                Delete
                            </Button>
                        )}
                    </Stack>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack direction="vertical" gap="3">
                    {expenses.map(expense => (
                        <Stack direction="horizontal" gap="2" key={expense.id}>

                            <BsInfoSquare title={expense.description}/>
                            <div className="me-auto fs-4">{expense.name}</div>
                            <div className="fs-5">
                                {currencyFormatter.format(expense.amount)}
                            </div>
                            <Button
                                onClick={() => {
                                    deleteTransaction(expense._id);
                                    updateBudgetByBudgetIDAfterDeleteTransaction(expense.budgetID, expense.amount);
                                    handleClose()
                                    window.location.reload();
                                }}
                                size="sm"
                                variant="outline-danger"
                            >
                                &times;
                            </Button>
                        </Stack>
                    ))}
                </Stack>
            </Modal.Body>
        </Modal>
    )
}
