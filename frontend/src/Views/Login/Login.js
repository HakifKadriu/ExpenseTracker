import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api";
import "./Login.css";
import { useHistory } from "react-router-dom";

const Login = () => {
  const history = useHistory();

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  useEffect(() => {
    if(localStorage.getItem("token")){
      history.push("/myexpenses/private")
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // me thirr backendin me ja dergu emailin edhe paswrodin
    try {
      const response = await api.post("user/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userID", response.data.userId);
      history.push("/myexpenses/private");

    } catch (error) {
      Swal.fire({
        title: "Invalid email or password!",
        icon: "error",
      });
    }
  };

  return (
    <div className="loginBody">
      <h1 style={{ color: "white", fontFamily: "poppins_bold" }}>Log in</h1>

      <div className="loginModal">
        <form className="loginFormContainer">
          <label className="loginLabels">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="loginInputs"
            value={email}
            onChange={(event) => setemail(event.target.value)}
          />
          <label className="loginLabels" style={{ marginTop: "1rem" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="loginInputs"
            value={password}
            onChange={(event) => setpassword(event.target.value)}
          />
          <p
            style={{
              marginTop: "10px",
              alignSelf: "flex-start",
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            Dont have an account?{" "}
            <span
              onClick={() => history.push("/register")}
              style={{ cursor: "pointer" }}
            >
              Register
            </span>
          </p>

          <button
            type="submit"
            className="loginButton"
            onClick={handleSubmit}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
