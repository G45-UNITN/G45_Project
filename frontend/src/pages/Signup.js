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
import { FiMail, FiLock, FiUser, FiCalendar } from "react-icons/fi";

//loader
import { ThreeDots } from 'react-loader-spinner';

//auth & redux
import { connect } from "react-redux";
import { signupUser } from "./../auth/actions/userActions"; //forse va totolto userActions
import { useNavigate } from "react-router-dom";

const Signup = ({ signupUser }) => {
    const navigate = useNavigate();
    return (
        <div>
            <StyledFormArea>
                <Avatar image={Logo} />
                <StyledTitle color={colors.theme} size={30}>
                    Member Signup
                </StyledTitle>
                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                        repeatPassword: "",
                        dateOfBirth: "",
                        name: "",

                    }}
                    validationSchema={
                        Yup.object({
                            email: Yup.string().email("Invalid email address").required("Required"),
                            password: Yup.string().min(8, "Password is too short").max(30, "Password is too long").required("Required"),
                            name: Yup.string().required("Required"),
                            dateOfBirth: Yup.date().required("Required"),
                            repeatPassword: Yup.string().required("Required").oneOf([Yup.ref('password')], 'Passwords must match'),
                        })
                    }
                    onSubmit={(values, { setSubmitting, setFieldError }) => {
                        console.log(values);
                        signupUser(values, navigate, setFieldError, setSubmitting)


                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <TextInput
                                name="name"
                                type="text"
                                label="Full Name"
                                placeholder="Name Surname"
                                icon={<FiUser style={{marginTop:"19px"}}/>}
                            />
                            <TextInput
                                name="email"
                                type="text"
                                label="Email Address"
                                placeholder="example@domain.com"
                                icon={<FiMail style={{marginTop:"19px"}}/>}
                            />
                            <TextInput
                                name="dateOfBirth"
                                type="date"
                                label="Date of Birth"
                                icon={<FiCalendar style={{marginTop:"19px"}}/>}
                            />

                            <TextInput
                                name="repeatPassword"
                                type="password"
                                label="Password"
                                placeholder="********"
                                icon={<FiLock style={{marginTop:"19px"}}/>}
                            />
                            <TextInput
                                name="password"
                                type="password"
                                label="Repeat Password"
                                placeholder="********"
                                icon={<FiLock style={{marginTop:"19px"}}/>}
                            />

                            <ButtonGroup>
                                {!isSubmitting && (
                                    <StyledFormButton type="submit">
                                        Signup
                                    </StyledFormButton>)}

                                {isSubmitting && (
                                    <ThreeDots
                                        height="80"
                                        width="80"
                                        radius="9"
                                        color={colors.theme2}
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
                    Already have an account? <TextLink to="/login">Login</TextLink>
                </ExtraText>
            </StyledFormArea>
            <CopyrightText>
                All rights reserved &copy; 2023
            </CopyrightText>
        </div>
    )
}

export default connect(null, { signupUser })(Signup);