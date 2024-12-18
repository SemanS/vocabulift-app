import React, { FC } from "react";
import {
  Button,
  Divider,
  Form,
  Input,
  Tooltip,
  Typography,
  notification,
} from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LoginParams } from "@/models/login";
import styles from "./index.module.less";
import { ReactComponent as LogoSvg } from "@/assets/logo/logo_tooltip.svg";
import { getGoogleUrl } from "@/utils/getGoogleUrl";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { ReactComponent as GoogleIcon } from "@/assets/logo/google_icon.svg";

const LoginForm: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = ((location.state as any)?.from.pathname as string) || "/library";
  const [password, setPassword] = React.useState("");
  const [partnerCode, setPartnerCode] = React.useState("");

  type ValidateStatus =
    | ""
    | "success"
    | "warning"
    | "error"
    | "validating"
    | undefined;

  const [passwordStatus, setPasswordStatus] = React.useState<{
    validateStatus: ValidateStatus;
    help: string;
  }>({
    validateStatus: undefined,
    help: "",
  });

  const [passwordRequirements, setPasswordRequirements] = React.useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
  });

  const validatePassword = (password: string) => {
    const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegEx.test(password);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;

    setPassword(password);

    setPasswordRequirements({
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
    });

    if (validatePassword(password)) {
      setPasswordStatus({
        validateStatus: "success",
        help: "",
      });
    }
    return password;
  };

  const generateRequirementStatus = (isValid, requirement) => {
    return isValid ? (
      <div style={{ color: "green" }}>
        <CheckCircleOutlined /> {requirement}
      </div>
    ) : (
      <div style={{ color: "red" }}>
        <CloseCircleOutlined /> {requirement}
      </div>
    );
  };

  const onFailure = (response: any) => {
    console.error(response);
  };

  const onFinished = async (form: LoginParams) => {
    const { email } = form;
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT
        }/api/sessions/checkUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          credentials: "include",
        }
      );
      if (response.status === 400) {
        notification.info({
          placement: "top",
          message: "Info",
          description:
            "There is no user record corresponding to this email, please register.",
        });
      } else {
        const response2 = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT
          }/api/sessions/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password: password,
              partnerCode: partnerCode,
            }),
            credentials: "include",
          }
        );
        if (response2.status === 200) {
          navigate("/library");
        }
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        description: "An error occurred while attempting to login.",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.header}>
          <Link to="/">
            <LogoSvg className={styles.logo} />
            <span className={styles.title}>VocabuLift</span>
          </Link>
        </div>
        <div className={styles.desc}>
          Words that last, vocabulary that stays
        </div>
      </div>
      <div className={styles.main}>
        <Form<LoginParams>
          onFinish={onFinished}
          /* action={`${
            import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT
          }/api/sessions/login`}
          method="POST" */
        >
          <Form.Item
            name="partner"
            rules={[
              {
                required: false,
                message: "Enter the code provided by your partner.",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Partner's program code"
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
            />
          </Form.Item>
          <Divider />
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please enter email" }]}
          >
            <Input size="large" placeholder="user@email.com" />
          </Form.Item>
          <Form.Item
            hasFeedback
            name="password"
            /* rules={[
              {
                required: true,
                message: passwordStatus.help,
              },
            ]} */
            validateStatus={passwordStatus.validateStatus}
          >
            <Tooltip
              title={
                passwordStatus.validateStatus === "error" ? (
                  <div>
                    {generateRequirementStatus(
                      passwordRequirements.length,
                      "At least 8 characters"
                    )}
                    {generateRequirementStatus(
                      passwordRequirements.number,
                      "Contains a number"
                    )}
                    {generateRequirementStatus(
                      passwordRequirements.uppercase,
                      "Contains an uppercase letter"
                    )}
                    {generateRequirementStatus(
                      passwordRequirements.lowercase,
                      "Contains a lowercase letter"
                    )}
                  </div>
                ) : (
                  ""
                )
              }
              open={
                passwordStatus.validateStatus === "error" &&
                (passwordRequirements.length ||
                  passwordRequirements.number ||
                  passwordRequirements.uppercase ||
                  passwordRequirements.lowercase)
              }
            >
              <Input
                type="password"
                size="large"
                placeholder="password"
                onChange={handlePasswordChange}
              />
            </Tooltip>
          </Form.Item>
          <Form.Item>
            <Button
              size="large"
              className={styles.mainLoginBtn}
              htmlType="submit"
              type="primary"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text className={styles.signInLink}>
          Not a member yet? <Link to="/registration">Sign up now.</Link>
        </Typography.Text>
        <Divider plain>OR</Divider>
        <Button
          size="large"
          href={getGoogleUrl(from, partnerCode)}
          style={{ textDecoration: "none" }}
          className={`${styles.mainLoginBtn} ${styles.flexContainer}`}
        >
          <GoogleIcon className={styles.googleIcon} />
          <Typography.Text className={styles.flexItem}>
            Continue with Google
          </Typography.Text>
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
