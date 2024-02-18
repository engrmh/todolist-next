import React, { useState, useEffect } from "react";
import UserModel from "@/models/User";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import connectToDB from "@/configs/db";
import TodoModel from "@/models/Todo";
import { verifyToken } from "@/utils/auth";
import { useRouter } from "next/router";

function Todolist({ user, todos }) {
  const [isShowInput, setIsShowInput] = useState(false);
  const [title, setTitle] = useState("");
  const [allTodos, setAllTodos] = useState([...todos]);
  const route = useRouter();

  const getTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setAllTodos(data.data);
    } catch (err) {
      throw err;
    }
  };
  const addTodo = async () => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        header: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, isCompleted: false }),
      });

      if (res.status === 201) {
        getTodos();
        Swal.fire("Creacted SuccessFully", "", "success");
        setTitle("");
      }
    } catch (err) {
      Swal.fire({
        title: err,
        text: "",
        icon: "error",
      });
    }
  };

  const removeTodo = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        getTodos();
        Swal.fire({
          title: "Deleted Successsfully",
          text: "",
          icon: "success",
        });
      }
    } catch (err) {
      throw err;
    }
  };

  const signOut = async () => {
    const res = await fetch("/api/auth/signout");

    if (res.status === 200) {
      Swal.fire({
        title: "You are Logged Out",
        text: "Redirect to Login Page Automaticaly, Please Wait!!",
        icon: "success",
        timer: 2000,
      });

      setTimeout(() => {
        route.replace("/signin");
      }, 2000);
    }
  };

  return (
    <>
      <h1>Next-Todos</h1>

      <div className="alert">
        <p>⚠ Please add a task first!</p>
      </div>

      <div className="container">
        <div
          className="form-container"
          style={{ display: `${isShowInput ? "block" : "none"}` }}
        >
          <div className="add-form">
            <input
              id="input"
              type="text"
              placeholder="Type your To-Do works..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button type="submit" id="submit" onClick={addTodo}>
              ADD
            </button>
          </div>
        </div>
        <div className="head">
          <div className="date">
            <p>
              {user.firstname} {user.lastname}
            </p>
          </div>
          <div className="add" onClick={() => setIsShowInput(!isShowInput)}>
            <svg
              width="2rem"
              height="2rem"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
              />
              <path
                fillRule="evenodd"
                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
              />
            </svg>
          </div>
          <div className="time">
            <a href="javascript:void(0)" onClick={() => signOut()}>
              Logout
            </a>
          </div>
        </div>
        <div className="pad">
          <div id="todo">
            <ul id="tasksContainer">
              {allTodos.length > 0 &&
                allTodos.map((todo, index) => (
                  <li key={index}>
                    <span className="mark">
                      <input type="checkbox" className="checkbox" />
                    </span>
                    <div className="list">
                      <p>{todo.title}</p>
                    </div>
                    <span className="delete">
                      <FontAwesomeIcon
                        icon={faTrash}
                        onClick={() => removeTodo(todo._id)}
                      />
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  connectToDB();

  const { token } = context.req.cookies;

  if (!token) {
    return {
      redirect: {
        destinition: "/signin",
      },
    };
  }

  const tokenPayload = verifyToken(token);

  if (!tokenPayload) {
    return {
      redirect: {
        destinition: "/signin",
      },
    };
  }

  const user = await UserModel.findOne(
    {
      email: tokenPayload.email,
    },
    "firstname lastname"
  );

  const todos = await TodoModel.find({
    user: user._id,
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
      todos: JSON.parse(JSON.stringify(todos)),
    },
  };
}
export default Todolist;
