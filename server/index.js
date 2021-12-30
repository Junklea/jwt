const express = require("express");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(morgan("dev"));

const users = [
  {
    id: "1",
    uuid: "30a4646a-e0d7-49c6-9d16-42acfb33b66f",
    username: "a",
    password: "a",
    isAdmin: true,
  },
  {
    id: "2",
    uuid: "42dc9adb-56b1-4b7b-aa3f-a0bb1212acbe",
    username: "b",
    password: "b",
    isAdmin: false,
  },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    const accessToken = jwt.sign({ uuid: user.uuid }, "TOPSECRETKEY", {
      expiresIn: "1m",
    });
    res.json({
      uuid: user.uuid,
      username: user.username,
      accessToken,
    });
  } else {
    res.status(400).json("Username or password incorrect");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "TOPSECRETKEY", (err, user) => {
      if (err) {
        res.status(401).json("Token is not valid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated");
  }
};

app.delete("/api/users/:userUuid", verify, (req, res) => {
  if (req.user.uuid === req.params.userUuid) {
    const user = users.find((u) => {
      return u.uuid === req.user.uuid && u.isAdmin;
    });
    if (user) {
      res.status(200).json("User has been deleted");
    } else {
      res.status(403).json("You are not allowed to delete user");
    }
  } else {
    res.status(401).json("You are trying something wrong");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
