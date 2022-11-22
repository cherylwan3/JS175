const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const TodoList = require("./lib/todolist");
const { sortTodoLists, sortTodos } = require("./lib/sort");

const app = express();
const host = "localhost";
const port = 3000;

let todoLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
}));

app.use(flash());
// Extract session info
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// Find a todo list with the indicated ID. Returns `undefined` if not found.
// Note that `todoListId` must be numeric.
const loadTodoList = todoListId => {
  return todoLists.find(todoList => todoList.id === todoListId);
};

// Find todo with indicated ID. Returns `undefined` if not found.
// Note that `todoId` must be numeric.
const loadTodo = (todoList, todoId) => {
  return todoList.todos.find(todo => todo.id === todoId);
}

app.get("/", (req, res) => {
  res.redirect("/lists");
});

// Render the list of todo lists
app.get("/lists", (req, res) => {
  res.render("lists", {
    todoLists: sortTodoLists(todoLists),
  });
});

// Render new todo list page
app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

// Create a new todo list
app.post("/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The list title is required.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
      .custom(title => {
        let duplicate = todoLists.find(list => list.title === title);
        return duplicate === undefined;
      })
      .withMessage("List title must be unique."),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash("success", "The todo list has been created.");
      res.redirect("/lists");
    }
  }
);

// Add this code just before the `app.listen()` call at the bottom of the file.

// Render individual todo list and its todos
app.get("/lists/:todoListId", (req, res, next) => {
  let todoListId = req.params.todoListId;
  let todoList = loadTodoList(+todoListId);
  if (todoList === undefined) {
    next(new Error("Not found."));
  } else {
    res.render("list", {
      todoList: todoList,
      todos: sortTodos(todoList),
    });
  }
});

// toggle todo completion status
app.post("/lists/:todoListId/todos/:todoId/toggle", (req, res, next) => {
  let todoListId = req.params.todoListId;
  let todoList = loadTodoList(+todoListId);
  let todoId =  req.params.todoId;
  let todo = loadTodo(todoList, +todoId);
  if (todo === undefined) {
    next(new Error("Not found."));
  } else {
    todo.done = !todo.done;
    res.render("list", {
      todoList: todoList,
      todos: sortTodos(todoList),
    });
  }
});

// Error handler
app.use((err, req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.status(404).send(err.message);
}); 

// Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});
