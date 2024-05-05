import {
    StyledTitle,
    Avatar,
    StyledButton,
    ButtonGroup,
    StyledFormArea,
    colors
} from "./../components/Styles";

//logo
import Logo from "./../assets/logo.png";

//auth & redux
import {connect} from "react-redux";
import {logoutUser} from "../auth/actions/userActions";
import Navbar from "../components/Navbar";
import "../index.css";


//react router
import {useNavigate} from "react-router-dom";


const Dashboard = ({logoutUser}) => {
    const navigate = useNavigate();
    //<StyledButton to="#" onClick={() => logoutUser(navigate)}>Logout</StyledButton>

    return (

        <div>
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: "transparent",
                width: "100%",
                display: "flex",
                justifyContent: "flex-start"
            }}>

                <Navbar/>
            </div>
            <div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: "transparent",
                    width: "100%",
                    padding: "15px",
                    display: "flex",
                    justifyContent: "flex-start"
                }}>
                    <Avatar image={Logo}/>
                </div>
                <StyledFormArea bg={colors.dark2}>
                    <StyledTitle size={65}>
                        Welcome, User
                    </StyledTitle>
                    <ButtonGroup>
                        <StyledButton to="#" onClick={() => logoutUser(navigate)}>Logout</StyledButton>
                    </ButtonGroup>
                </StyledFormArea>

            </div>
        </div>
    );
}

export default connect(null, {logoutUser})(Dashboard);