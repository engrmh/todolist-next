import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

function Index() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((res) => {
      if (res.status === 200) {
        router.replace("/todos");
      }
    });
  }, []);

  const signIn = async (event) => {
    event.preventDefault();

    const user = { identifier, password };

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (res.status === 200) {
      setIdentifier("");
      setPassword("");
      Swal.fire({
        title: "Login SuccessFully",
        text: "Redirect to Todos Page Automaticaly, Please Wait!!",
        icon: "success",
        timer: 2000,
      });
      setTimeout(() => {
        router.replace("/todos");
      }, 2000);
    } else if (res.status === 404) {
      Swal.fire({
        title: "User Not Found!!",
        text: "",
        icon: "error",
      });
    } else if (res.status === 422) {
      Swal.fire({
        title: "username or password is not correct :((",
        text: "Try Again!!",
        icon: "error",
      });
    } else if (res.status === 500) {
      Swal.fire({
        title: "Server Error",
        text: "Try Again Later!!",
        icon: "error",
      });
    }
  };

  return (
    <div className="box">
      <h1 align="center">Login Form</h1>
      <form role="form" method="post">
        <div className="inputBox">
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="off"
            required
          />
          <label>Username | Email</label>
        </div>
        <div className="inputBox">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="off"
            required
          />
          <label>Password</label>
        </div>

        <input
          type="submit"
          className="register-btn"
          value="Sign In"
          onClick={signIn}
        />
      </form>
    </div>
  );
}

export default Index;
