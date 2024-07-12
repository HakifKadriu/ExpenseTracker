import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../../api";
import "./Register.css";
import { useHistory } from "react-router-dom";

const Register = () => {
  const history = useHistory();

  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/user/register", {
        username,
        email,
        password,
      });

      Swal.fire({
        title: "User registered successfully!",
        icon: "success",
      });
      history.push("/login")
    } catch (error) {
      Swal.fire({
        title: "User already exists!",
        icon: "error",
      });
    }
  };

  return (
    <div className="registerBody">
      <h1 style={{ color: "white", fontFamily: "poppins_bold" }}>
        Register an account
      </h1>

      <div className="registerModal">
        <form className="registerFormContainer">
          <label className="registerLabels" style={{ marginTop: 0 }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Username"
            className="registerInputs"
            value={username}
            onChange={(event) => setusername(event.target.value)}
          />
          <label className="registerLabels">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="registerInputs"
            value={email}
            onChange={(event) => setemail(event.target.value)}
          />
          <label className="registerLabels" style={{ marginTop: "1rem" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="registerInputs"
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
            Already have an account?{" "}
            <span onClick={() => history.push("/login")} style={{cursor: 'pointer'}}>Log In</span>
          </p>

          <button
            type="submit"
            className="registerButton"
            onClick={handleSubmit}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
