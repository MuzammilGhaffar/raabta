const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const md5 = require("md5");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

var port = process.env.PORT || "5000";
app.set("port", port);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

let db = new sqlite3.Database("coos.db");
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  db.run(
    "CREATE TABLE IF NOT EXISTS Users(id INTEGER PRIMARY KEY, name, password)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS followers(followed_id INTEGER, follower_id INTEGER, FOREIGN KEY(followed_id) REFERENCES Users(id), FOREIGN KEY(follower_id) REFERENCES Users(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS coos(id INTEGER PRIMARY KEY, name, user_id, content TEXT, created, FOREIGN KEY(user_id) REFERENCES Users(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS replies(content TEXT, coo_id INTEGER, user_id INEGER, FOREIGN KEY(coo_id) REFERENCES coos(id), FOREIGN KEY(user_id) REFERENCES Users(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS reacts(coo_id INTEGER, user_id INEGER, FOREIGN KEY(coo_id) REFERENCES coos(id), FOREIGN KEY(user_id) REFERENCES Users(id))"
  );
});
db.close();
app.use(cors());
app.use(express.json());

app.get("/coos", (req, res) => {
  findCoos().then((result) => {
    res.json(result);
  });
});

function insertUser(user) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    db.serialize(() => {
      let stmt = db.prepare("INSERT INTO Users (name, password) VALUES (?,?)");
      stmt.run(user.name, md5(user.password));
      stmt.finalize();
      db.get("SELECT * FROM Users ORDER BY id DESC LIMIT 1", (err, row) => {
        result = {
          id: row.id,
          name: row.name,
          password: row.password,
        };
        db.close();
        resolve(result);
      });
    });
  });
}

function findUser(user) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    db.serialize(() => {
      db.get(
        'SELECT * FROM Users WHERE name = "' +
          user.name +
          '" AND password = "' +
          md5(user.password) +
          '"',
        (err, row) => {
          if (!row) {
            reject(new Error(err));
          } else {
            result = {
              id: row.id,
              name: row.name,
              password: row.password,
            };
            db.close();
            resolve(result);
          }
        }
      );
    });
  });
}
function allUsers() {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    let result = [];
    let dbPromise = new Promise((resolve, reject) => {
      db.serialize(() => {
        db.each(
          "SELECT id, name FROM Users",
          (err, row) => {
            users = {
              id: row.id,
              name: row.name,
            };
            result.push(users);
          },
          resolve
        );
      });
    });
    dbPromise.then((res, rej) => {
      db.close();
      resolve(result);
    });
  });
}

function findFollowers(id) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    let result = [];
    let dbPromise = new Promise((resolve, reject) => {
      db.serialize(() => {
        db.each(
          "SELECT * FROM Users INNER JOIN followers ON followers.follower_id = Users.id",
          (err, row) => {
            if (row) {
              users = {
                id: row.id,
                name: row.name,
              };
              result.push(users);
            } else {
              result = ["No Users"];
            }
          },
          resolve
        );
      });
    });
    dbPromise.then((res, rej) => {
      db.close();
      resolve(result);
    });
  });
}

function findUserCoos(id) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    let result = [];
    let dbPromise = new Promise((resolve, reject) => {
      db.serialize(() => {
        db.each(
          "SELECT content, created FROM coos WHERE user_id = '" + id + "'",
          (err, row) => {
            console.log("coming");
            coo = {
              content: row.content,
              created: row.created,
            };
            result.push(coo);
          },
          resolve
        );
      });
    });
    dbPromise.then((res, rej) => {
      result.reverse();
      db.close();
      resolve(result);
    });
  });
}

function searchUser(user) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    db.serialize(() => {
      db.get(
        'SELECT * FROM Users WHERE name = "' + user.name + '"',
        (err, row) => {
          if (!row) {
            reject(new Error(err));
          } else {
            result = {
              id: row.id,
              name: row.name,
              password: row.password,
            };
            db.close();
            resolve(result);
          }
        }
      );
    });
  });
}

app.post("/searchUser", (req, res) => {
  const user = { name: req.body.username.toString() };
  searchUser(user).then(
    (user) => {
      res.json(user);
    },
    (err) => {
      console.log(err);
    }
  );
});

function follow(users) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    db.serialize(() => {
      let stmt = db.prepare(
        "INSERT INTO followers (follower_id, followed_id) VALUES (?,?)"
      );
      stmt.run(users.following, users.toFollow);
      stmt.finalize();
      resolve({ msg: "Done" });
    });
  });
}

app.post("/follow", (req, res) => {
  const user = { following: req.body.following, toFollow: req.body.toFollow };
  follow(user).then(
    (msg) => {
      res.json(msg);
    },
    (err) => {
      console.log("Not Followed");
    }
  );
});

app.get("/userCoos/:id", (req, res) => {
  findUserCoos(req.params.id).then(
    (coos) => {
      res.json(coos);
    },
    (err) => {
      console.log(err);
    }
  );
});

app.get("/getUsers", (req, res) => {
  allUsers().then(
    (allUsers) => {
      res.json(allUsers);
    },
    (err) => {
      console.log(err);
    }
  );
});

app.post("/getFollowers", (req, res) => {
  const user = req.body.id;
  findFollowers(user).then((followers) => {
    res.json(followers);
  });
});

app.post("/login", (req, res) => {
  const user = {
    name: req.body.name.toString(),
    password: req.body.password.toString(),
  };
  findUser(user).then(
    (createdUser) => {
      console.log("DONE INSERT");
      res.json(createdUser);
    },
    (err) => {
      res.status(400).send(err);
    }
  );
});

function isAlreadyUser(user) {
  let db = new sqlite3.Database("coos.db");
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        "SELECT * FROM Users WHERE name = '" + user.name + "'",
        (err, row) => {
          db.close();
          if (row) {
            resolve(1);
          }
          resolve(0);
        }
      );
    });
  });
}

app.post("/register", async (req, res) => {
  const user = {
    name: req.body.name.toString(),
    password: req.body.password.toString(),
  };
  if (await isAlreadyUser(user)) {
    return res.status(500).send(new Error("User already exists"));
  } else {
    insertUser(user).then((createdUser) => {
      console.log("DONE INSERT");
      res.json(createdUser);
    });
  }
});

function isValidCoo(coo) {
  return (
    coo.name &&
    coo.name.toString().trim() !== "" &&
    coo.content &&
    coo.content.toString().trim() !== ""
  );
}

function findCoos() {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    let result = [];
    let dbPromise = new Promise((resolve, reject) => {
      db.serialize(() => {
        db.each(
          "SELECT id, name, content, created FROM coos",
          (err, row) => {
            coo = {
              id: row.id,
              user_id: row.user_id,
              name: row.name,
              content: row.content,
              created: row.created,
            };
            result.push(coo);
          },
          resolve
        );
      });
    });
    dbPromise.then((res, rej) => {
      result.reverse();
      db.close();
      resolve(result);
    });
  });
}

function insertCoo(coo) {
  return new Promise((resolve, reject) => {
    console.log(coo);
    let db = new sqlite3.Database("coos.db");
    let resultCoo;
    db.serialize(() => {
      let stmt = db.prepare(
        "INSERT INTO coos (user_id, name, content, created) VALUES (?,?,?,?)"
      );
      stmt.run(coo.user_id, coo.name, coo.content, coo.created);
      stmt.finalize();
      db.get("SELECT * FROM coos ORDER BY id DESC LIMIT 1", (err, row) => {
        resultCoo = {
          name: row.name,
          content: row.content,
          created: row.created,
        };
        db.close();
        resolve(resultCoo);
      });
    });
  });
}

async function followInfo(userid) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("coos.db");
    db.serialize(() => {
      let followInfo = { followerCount: null, followingCount: null };
      db.get(
        "SELECT count(Users.id) as followersCount FROM Users INNER JOIN followers ON followers.follower_id = Users.id WHERE followed_id = " +
          userid,
        (err, row) => {
          if (row) {
            followInfo.followerCount = row.followersCount;
          } else {
            followInfo.followerCount = 0;
          }
          db.get(
            "SELECT count(*) as followingCount FROM Users inner JOIN followers ON followers.follower_id = Users.id WHERE follower_id = " +
              userid,
            (err, row) => {
              if (row) {
                followInfo.followingCount = row.followingCount;
              } else {
                followInfo.followingCount = 0;
              }
              db.close();
              resolve(followInfo);
            }
          );
        }
      );
    });
  });
}

app.post("/getFollowInfo", (req, res) => {
  followInfo(req.body.id.toString()).then((followerCount) => {
    res.json(followerCount);
  });
});

app.post("/coos", (req, res) => {
  if (isValidCoo(req.body)) {
    console.log(req.body);
    const coo = {
      user_id: req.body.user_id.toString(),
      name: req.body.name.toString(),
      content: req.body.content.toString(),
      created: new Date(),
    };
    insertCoo(coo).then((createdCoo) => {
      console.log("DONE INSERT");
      res.json(createdCoo);
    });
  } else {
    res.status(422);
    res.json({
      message: "Hey! Name and Content is required!",
    });
  }
});

app.post("/user-login", (req, res) => {
  console.log("Registering user");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
io.on("connection", (socket) => {
  socket.on("inform all", (user) => {
    console.log("Tweet from " + user);
    socket.emit("informed", "There is a tweet from " + user);
  });
});
