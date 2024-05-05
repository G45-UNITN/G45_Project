import React, { useState } from "react";
import {Stack} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {TextBudget, StyledAddBudgetButton} from "./../components/Styles";
import BudgetCard from "../components/budgetComponents/BudgetCard";
import AddBudgetModal from "../components/budgetComponents/AddBudgetModal";
import AddExpenseModal from "../components/budgetComponents/AddExpenseModal";
import AddExpCardSpec from "../components/budgetComponents/AddExpCardSpec";
import ViewExpensesModal from "../components/budgetComponents/ViewExpensesModal";
import Navbar from "../components/Navbar";
import "../index.css";
import {useBudgets} from "../context/BudgetContext";

export default function BudgetPage(){
    const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

    const [viewExpensesModalBudgetId, setViewExpensesModalBudgetId] = useState(false)
    const [viewFetchBudgetId, setviewFetchBudgetId] = useState();

    const [showAddExpCardSpec, setShowAddExpCardSpec] = useState(false);
    const [addExpCardSpecId, setAddExpCardSpecId] = useState()

    const { budgets } = useBudgets();

    function openAddExpenseModal(budgetId) {
        setShowAddExpCardSpec(true)
        setAddExpCardSpecId(budgetId)
    }
    function openViewModel(budgetId) {
        setViewExpensesModalBudgetId(true)
        setviewFetchBudgetId(budgetId)
    }

    return (
        <>
            <Navbar />
            <Container className="my-4" >
                <Stack direction="horizontal" gap="2" className="mb-4" >
                    <TextBudget >
                        Budget
                    </TextBudget>
                    <StyledAddBudgetButton onClick={() => setShowAddBudgetModal(true)}>
                        Add Budget
                    </StyledAddBudgetButton>
                    <StyledAddBudgetButton onClick={() => setShowAddExpenseModal(true)}>
                        Add Expense
                    </StyledAddBudgetButton>
                </Stack>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                        alignItems: "flex-start",
                    }}
                > </div>




                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                        alignItems: "flex-start",
                    }}
                >
                    {budgets.map(budget => {
                        return (
                            <BudgetCard
                                key={budget._id}
                                name={budget.name}
                                amount={budget.current}
                                max={budget.amount}
                                functionBudgetCard={() => openAddExpenseModal(budget._id)}
                                onViewExpensesClick={() => openViewModel(budget._id)}
                            />

                        )
                    })}
                </div>



            </Container>
            <AddBudgetModal
                show={showAddBudgetModal}
                handleClose={() => setShowAddBudgetModal(false)}
            />
            <AddExpenseModal
                show={showAddExpenseModal}
                handleClose={() => setShowAddExpenseModal(false)}
            />
            <AddExpCardSpec
            show={showAddExpCardSpec}
            defaultBudgetId={addExpCardSpecId}
            handleClose={() => setShowAddExpCardSpec(false)}>
            </AddExpCardSpec>
            <ViewExpensesModal
                show={viewExpensesModalBudgetId}
                budgetId={viewFetchBudgetId}
                handleClose={() => setViewExpensesModalBudgetId(false)}
            />
        </>
    );
}



