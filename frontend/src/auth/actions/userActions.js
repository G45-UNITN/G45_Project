import axios, {request} from "axios";
import {sessionService} from "redux-react-session";

//the remote endpoint and local
const remoteUrl = "http://localhost:4500/";
const localUrl = "http://localhost:4500/";
const currentUrl = localUrl;


export const loginUser = (credentials, navigate, setFieldError, setSubmitting) => {
    //make cheaks and get some data

    return () => {

        axios.post(`${currentUrl}user/signin`,
            credentials,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
            const {data} = response;
            console.log("Server Response:", response);

            if (data.status === "FAILED") {
                console.log("Data", data);
                const {message} = data;
                console.log(`Message: [${message}]`);

                //check for specific error
                if (message.includes("credentials")) {
                    setFieldError("email", message);
                    setFieldError("password", message);
                } else if (message.includes("password")) {
                    setFieldError("password", message);
                } else if (message.toLowerCase().includes("email")) {
                    setFieldError("email", message);
                }


            } else if (data.status === "SUCCESS") {
                const userData = data.data[0];
                let token = userData._id;
                if (token.startsWith('"') && token.endsWith('"')) {
                    token = token.slice(1, -1);
                }
                localStorage.setItem('token', token);
                sessionService.saveSession(token).then(() => {
                    sessionService.saveUser(userData).then(() => {
                        navigate("/budgetpage");
                        // history.push("/dashboard");
                    }).catch(err => console.log(err))
                }).catch(err => console.error(err))
            }

            //complete submission
            setSubmitting(false);


        }).catch(err => console.error(err));
    }

}

export const signupUser = (credentials, navigate, setFieldError, setSubmitting) => {

    return (dispatch) => {

        axios.post(`${currentUrl}user/signup`,
            credentials,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then((response) => {
            const {data} = response;

            if (data.status === "FAILED") {
                const {message} = data;
                //checking for specific error
                if (message.includes("name")) {
                    setFieldError("name", message);
                } else if (message.includes("email")) {
                    setFieldError("email", message);
                } else if (message.includes("date")) {
                    setFieldError("date", message);
                } else if (message.includes("password")) {
                    setFieldError("password", message);
                }

            } else if (data.status === "PENDING") {
                //display message for email verification
                const {email} = credentials;
                navigate(`/emailsent/${email}`);

                dispatch(loginUser({email}, navigate, setFieldError, setSubmitting));

            }
            //complete submission
            setSubmitting(false);

        }).catch(err => console.error(err))
    }
};

export const logoutUser = (navigate) => {
    return () => {
        sessionService.deleteSession();
        sessionService.deleteUser();
        localStorage.clear();
        navigate(`/`);
    }
};

export const forgottenPassword = (credentials, navigate, setFieldError, setSubmitting) => {
    //make cheaks and get some data

    return () => {

        axios.post(`${currentUrl}user/requestPasswordReset`,
            credentials,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
            const {data} = response;
            console.log("Server Response:", response);
            console.log(data);

            if (data.status === "FAILED") {
                console.log("Data", data);
                const {message} = data;
                console.log(`Message: [${message}]`);

                //check for specific error
                if (message.toLowerCase().includes("user") || message.toLowerCase().includes("password") || message.toLowerCase().includes("email")) {
                    setFieldError("email", message);
                }


            } else if (data.status === "PENDING") {
                const {email} = credentials;
                navigate(`/emailsent/${email}/${true}`);
            }

            //complete submission
            setSubmitting(false);


        }).catch(err => console.error(err));
    }

};

//Actual reset
export const resetPassword = (credentials, navigate, setFieldError, setSubmitting) => {
    //make cheaks and get some data

    return () => {

        axios.post(`${currentUrl}user/resetPassword`,
            credentials,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
            const {data} = response;
            console.log("Server Response:", response);

            if (data.status === "FAILED") {
                console.log("Data", data);
                const {message} = data;
                console.log(`Message: [${message}]`);

                //check for specific error
                if (message.toLowerCase().includes("password")) {
                    setFieldError("newPassword", message);
                }


            } else if (data.status === "SUCCESS") {
                navigate("/emailsent");
            }

            //complete submission
            setSubmitting(false);


        }).catch(err => console.error(err));
    }

};

export const addBudget = (credentials) => {
    return axios.post(`${currentUrl}user/budgetAdd`, credentials, {
        headers: {
            "Content-Type": "application/json"
        }
    });
}


export const deleteBudget = (budgetID) => {
    return axios.delete(`${currentUrl}user/budgetDelete/${budgetID}`, {
        headers: {
            "Content-Type": "application/json"
        }
    })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                throw error;
            })
};


export const getBudget = (budgetId) => {
    return axios.get(`${currentUrl}user/budgetGet/${budgetId}`, {
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            throw error;
        });
};

export const getBudgetsByUserID = (userID) => {
    return axios.get(`${currentUrl}user/getBudgetsByUserID/${userID}`, {
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            throw error;
        });
};

export const updateBudgetByBudgetID = (budgetID, value) => {
    return axios.patch(`${currentUrl}user/budgetUpdate/${budgetID}`,
        { value }, {  // Inviare il valore come oggetto con una chiave associata
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            console.log("response: ", response);
            return response.data;
        })
        .catch(error => {
            throw error;
        });
};

export const updateBudgetByBudgetIDAfterDeleteTransaction = (budgetID, value) => {
    return axios.patch(`${currentUrl}user/budgetAfterdeleteTransUpdate/${budgetID}`,
        { value }, {  // Inviare il valore come oggetto con una chiave associata
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            console.log("response: ", response);
            return response.data;
        })
        .catch(error => {
            throw error;
        });
};


export const addTransaction = (credentials) => {

    console.log(credentials);
    return axios.post(`${currentUrl}user/transactionAdd`, credentials,
        {
            headers: {
                "Content-Type": "application/json"
            }
        })
}

export const deleteTransaction = (transID) => {
    return axios.delete(`${currentUrl}user/transactionDelete/${transID}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                throw error;
            })
};


export const getTransaction = (budgetID) => {
    return axios.get(`${currentUrl}user/transactionGet/${budgetID}`, {
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            console.log("response: ", response);
            return response.data;
        })
        .catch(error => {
            throw error;
        });
};