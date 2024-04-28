const express = require("express");
const session = require("express-session");

const app = express();
var port = 9999

app.use(session({
    secret: "yawgmoth",
    cookie: { }
}));

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded());

var dataRoutes = require("./routes/dataRoutes.js");
app.use("/data/", dataRoutes);
var routes = require("./routes/routes.js");
app.use("/", routes);
var userRoutes = require("./routes/userRoutes");
app.use("/user/", userRoutes);

app.listen(port, function () {
    console.log("Express started listening on port " + port);
});

//
//const uri = "mongodb+srv://false-admin:<password>@rshawatlascluster-8ambh.mongodb.net/test?retryWrites=true&w=majority";