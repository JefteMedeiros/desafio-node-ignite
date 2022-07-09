const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existingUser = users.find((usersUser) => {
    return usersUser.username === username;
  });

  if (!existingUser) {
    return response.status(400).json({ error: "User does not exist." });
  }

  request.user = existingUser;

  return next();
}

app.post("/users", (request, response) => {
  const { id, name, username, todos } = request.body;

  const customerAlreadyExists = users.find((user) => {
    return user.username === username;
  });

  if (customerAlreadyExists) {
    return response.status(400).send({ error: "User already exists!" });
  }

  users.push({
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  });

  response.status(200).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);
  return response.status(200).json(users);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const taskId = request.params.id;

  const findTaskToUpdate = user.todos.find((task) => task.id === taskId);

  if (findTaskToUpdate) {
    findTaskToUpdate.title = title;
    findTaskToUpdate.deadline = deadline;
    response.status(200).json(user);
  } else {
    response.status(400).json({ error: "Task not found." });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const taskId = request.params.id;

  const findTaskToUpdate = user.todos.find((task) => task.id === taskId);

  if (findTaskToUpdate) {
    findTaskToUpdate.done = true
    response.status(200).json(user);
  } else {
    response.status(400).json({ error: "Task not found." });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const taskId = request.params.id;

  const findTaskToUpdate = user.todos.find((task) => task.id === taskId);
  
  if(findTaskToUpdate) {
    user.todos = user.todos.filter((todo) => todo.id != taskId)
    response.status(200).json(user.todos)
  }
});

module.exports = app;
