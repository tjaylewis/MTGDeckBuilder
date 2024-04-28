const express = require("express");
const mongoose = require("mongoose");
const dbInteraction = require("../modules/databaseInteraction");
const bcrypt = require("bcrypt");
const saltRounds = 15;
const scryfall = require("../modules/scryfallApiCalls");

const Card = mongoose.model("cards")
const User = mongoose.model("users");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const router = express.Router();

router.route("/addAdmin").get(function (req, res) {
    if (!req.session.isAdmin) {
        res.redirect("/user/login");
    } else {
        bcrypt.hash("P@ssw0rd", saltRounds, async function (err, hash) {
            var newUser = new User(
                {
                    _id: mongoose.Types.ObjectId(),
                    admin: true,
                    username: "Admin",
                    password: hash,
                    email: "Admin@here.com",
                    decks: []
                }
            );
            await newUser.save();
        });
        res.redirect("/");
    }
});

router.route("/searchCards").get(
    function (req, res) {
        var model = {
            title: "Looking for something?",
            username: req.session.username,
            userId: req.session.userId,
            isAdmin: req.session.isAdmin
        }

        res.render("cardDatabase", model);
    }
);

router.route("/searchCards").post(
    async function (req, res) {
        var filter = req.body.nameFilter;
        await Card.find({ name: filter }).limit(50).exec(function (err, cards) {
            if (err) {
                console.log(err);
                console.log("could not find cards");
            } else {
                console.log(cards);
                var model = {
                    title: "Looking for something?",
                    username : req.session.username,
                    userId : req.session.userId,
                    isAdmin : req.session.isAdmin,
                    foundCards : cards
                }

                res.render("cardDatabase", model);
            }
        });
    }
);

router.route("/updateDatabase").get(function (req, res) {
    if (req.session.isAdmin) {
        scryfall.addAndUpdateAllCards();
        res.redirect("/");
    } else {
        res.redirect("/user/Login");
    }
});

module.exports = router;