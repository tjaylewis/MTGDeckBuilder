const express = require('express');
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://false-admin:cake@rshawatlascluster-8ambh.mongodb.net/MTGDeckBuilder?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = mongoose.Schema;
const objectId = Schema.objectId;

const router = express.Router();

router.route("/").get(
    function (req, res) {
        var model = {
            title: "My Express/Pug Site",
            username: req.session.username,
            userId: req.session.userId,
            isAdmin: req.session.isAdmin
        }
        res.render("index", model);
    }
);



module.exports = router;