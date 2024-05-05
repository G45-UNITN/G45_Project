//styled components
import {
    StyledFormArea,
    StyledFormButton,
    Avatar,
    StyledTitle,
    colors,
    ButtonGroup,
    ExtraText,
    TextLink,
    CopyrightText
}
    from "./../components/Styles";

import Logo from "./../assets/logo.png";

//formik
import { Formik, Form } from "formik";
import { TextInput } from "./../components/FormLib";
import * as Yup from "yup";

//icons
import { FiMail, FiLock } from "react-icons/fi";

//loader
import { ThreeDots } from 'react-loader-spinner';

//auth & redux
import { connect } from "react-redux";
import { loginUser } from "./../auth/actions/userActions";
import { useNavigate, useParams } from "react-router-dom";

const Login = ({loginUser}) => {
        const navigate = useNavigate();
        const {userEmail} = useParams();
    return (
        <div>
            <StyledFormArea>
                <Avatar image={Logo} />
                <StyledTitle color={colors.theme} size={30}>
                    Member Login
                </StyledTitle>
                <Formik
                    initialValues={{
                        email: userEmail,
                        password: "",
                    }}
                    validationSchema={
                        Yup.object({
                            email: Yup.string().email("Invalid email address").required("Required"),
                            password: Yup.string().min(8, "Password is too short").max(30, "Password is too long").required("Required"),
                        })
                    }
                    onSubmit={(values, { setSubmitting, setFieldError }) => {
                        console.log(values);
                        loginUser(values, navigate, setFieldError, setSubmitting);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <TextInput
                                name="email"
                                type="text"
                                label="Email Address"
                                placeholder="example@domain.com"
                                icon={<FiMail style={{marginTop:"19px"}}/>}
                            />

                            <TextInput
                                name="password"
                                type="password"
                                label="Password"
                                placeholder="********"
                                icon={<FiLock style={{marginTop:"19px"}}/>}
                            />

                            <ButtonGroup>
                                {!isSubmitting && (
                                <StyledFormButton type="submit">
                                    Login
                                </StyledFormButton>)}

                                {isSubmitting && (
                                    <ThreeDots
                                        height="80"
                                        width="80"
                                        radius="9"
                                        color= {colors.theme2}
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClassName=""
                                        visible={true}
                                    />
                                )}
                            </ButtonGroup>
                        </Form>
                    )}
                </Formik>
                <ExtraText>
                    Forgotten password? <TextLink to="/forgottenpassword">Reset it</TextLink>
                </ExtraText>
                <ExtraText>
                    New here? <TextLink to="/signup">Signup</TextLink>
                </ExtraText>
            </StyledFormArea>
            <CopyrightText>
                All rights reserved &copy; 2023
            </CopyrightText>
        </div>
    )
}

export default connect(null, {loginUser})(Login);