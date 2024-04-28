const express = require('express');
const mongoose = require('mongoose');
const dbInteraction = require("../modules/databaseInteraction");
const bcrypt = require('bcrypt');
const saltRounds = 15;

const User = mongoose.model("users");
const Card = mongoose.model("cards");

const router = express.Router();

router.route("/buildDeck(/:errorMessage)?").get(
    function (req, res) {
        console.log(req.session);
        if (req.session.username) {
            if ((req.session.currentCards == null || req.session.currentCards == undefined) && (req.session.currentDeckName == null || req.session.currentDeckName == undefined)) {
                req.session.currentCards = "";
                req.session.currentDeckName = "";
            }
            var model = {
                title: "Deck Builder",
                username: req.session.username,
                userId: req.session.userId,
                isAdmin: req.session.isAdmin,
                cards: req.session.currentCards,
                deckName: req.session.currentDeckName,
                message: (req.params.errorMessage ? req.params.errorMessage : null)
            }
            res.render("deckBuilder", model);
        } else {
            res.redirect("/user/Login");
        }
    }
);

router.route("/addCardToList").post(
    function (req, res) {
        if (req.session.username) {
            req.session.currentDeckName = req.body.deckName;
            if (req.body.addCard) {
                if (!req.body.cardView.includes(req.session.currentCards)) req.session.currentCards = req.body.cardView;
                if (req.body.cardView.includes(req.body.addCard)) {
                    var indexOfStartLetter = req.body.cardView.indexOf(req.body.addCard);
                    var cardName = req.body.cardView.slice(indexOfStartLetter, indexOfStartLetter + req.body.addCard.length);
                    let indexOffset = 3
                    var cardNumber = req.body.cardView.slice(indexOfStartLetter - indexOffset, indexOfStartLetter - 2);
                    for (let i = 4; !cardNumber.includes("\n") && req.body.cardView.slice(indexOfStartLetter - i, indexOfStartLetter - 2) != ""; i++) {
                        cardNumber = req.body.cardView.slice(indexOfStartLetter - i, indexOfStartLetter - 2);
                        indexOffset = i;
                    }
                    cardNumber.trim();
                    cardNumber = parseInt(cardNumber) + 1;
                    req.session.currentCards = req.body.cardView.substring(0, indexOfStartLetter - indexOffset) + cardNumber + "x " + cardName + req.body.cardView.substring(indexOfStartLetter + req.body.addCard.length, req.body.cardView.length);
                } else if (req.body.cardView.length == 0) {
                    req.session.currentCards += "1x " + req.body.addCard;
                } else {
                    req.session.currentCards += "_\n1x " + req.body.addCard;
                }
                console.log(req.session.currentCards);
            }
            res.redirect("/user/buildDeck");
        }
    }
);

router.route("/addDeck/:deckName/:cards").get(
    async function (req, res) {
        if (req.session.username) {
            console.log(req.params.deckName);
            console.log(req.params.cards);
            var rawCards = req.params.cards.split("_");
            console.log(rawCards);
            var cardsNames = [];
            for (let i = 0; i < rawCards.length; i++) {
                cardsNames.push(rawCards[i].split("x ")[1]);
            }
            console.log(cardsNames);
            var doesNotExist = [];
            for (let i = 0; i < cardsNames.length; i++) {
                const cardName = cardsNames[i];
                await Card.findOne({ name: cardName }, function (err, card) {
                    if (err) {
                        console.error("An error occurred finding a card");
                    }
                    if (card) {
                        console.log(cardName + " Exists");
                    } else {
                        console.log(cardName + " Does Not Exist");
                        doesNotExist.push(cardName);
                    }
                    if (cardName == cardsNames[cardsNames.length - 1]) {
                        console.log(doesNotExist);
                        if (doesNotExist.length == 0) {
                            req.session.currentCards = null;
                            req.session.currentDeckName = null;
                            dbInteraction.addDeckToUser(req.session.userId, req.params.deckName, rawCards);
                            res.redirect("/");//Change to deck page when made
                        } else {
                            var message = "Did not recognize the cards: "
                            for (let i = 0; i < doesNotExist.length; i++) {
                                if (i != doesNotExist.length - 1) {
                                    message += doesNotExist[i] + ", ";
                                } else {
                                    message += doesNotExist[i];
                                }
                            }
                            console.log(message);
                            res.redirect("/user/buildDeck/" + message);
                        }
                    }
                });
            }
        }
    }
)

router.route("/profile/:userId").get(
    async function (req, res) {
        req.session.currentCards = null;
        req.session.currentDeckName = null;
        if (req.session.username) {
            await User.findOne({ _id: req.session.userId }, function (err, user) {
                if (user) {
                    var model = {
                        title: "User Profile",
                        username: req.session.username,
                        userId: req.session.userId,
                        email: user.email,
                        isAdmin: req.session.isAdmin
                    }

                    res.render("profile", model);
                }
            })
        }
    }
);

router.route("/Register").get(
    function (req, res) {
        req.session.currentCards = null;
        req.session.currentDeckName = null;
        var model = {
            title: "Register a New Account",
            username: req.session.username,
            userId: req.session.userId,
            isAdmin: req.session.isAdmin
        }

        res.render("register", model);
    }
);

router.route("/Register").post(
    function (req, res) {
        var password = req.body.password;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            var newUser = new User(
                {
                    _id: mongoose.Types.ObjectId(),
                    admin: false,
                    username: req.body.username,
                    password: hash,
                    email: req.body.email,
                    decks: []
                }
            );
            newUser.save();
        });
        res.redirect("/user/Login");
    }
);

router.route("/editUsername").get(
    function (req, res) {
        if (req.session.username) {
            var model = {
                title: "Change Email",
                username: req.session.username,
                userId: req.session.userId,
                isAdmin: req.session.isAdmin
            }
            res.render("editUsername", model);
        } else {
            res.redirect("/user/Login");
        }
    }
);

router.route("/editUsername").post(
    async function (req, res) {
        req.session.username = req.body.username;
        await dbInteraction.updateUsername(req.session.userId, req.body.username);
        res.redirect("/user/profile/" + req.session.userId);
    }
);

router.route("/editPassword").get(
    function (req, res) {
        if (req.session.username) {
            var model = {
                title: "Change Email",
                username: req.session.username,
                userId: req.session.userId,
                isAdmin: req.session.isAdmin
            }
            res.render("editPassword", model);
        } else {
            res.redirect("/user/Login");
        }
    }
);

router.route("/editPassword").post(
    async function (req, res) {
        bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
            await dbInteraction.updatePassword(req.session.userId, hash);
            res.redirect("/user/profile/" + req.session.userId);
        });
    }
);

router.route("/editEmail").get(
    async function (req, res) {
        if (req.session.username) {
            await User.findOne({ _id: req.session.userId }, function (err, user) {
                if (err) console.error(err);
                if (user) {
                    var model = {
                        title: "Change Email",
                        username: req.session.username,
                        userId: req.session.userId,
                        isAdmin: req.session.isAdmin,
                        email: user.email
                    }
                    res.render("editEmail", model);
                } else {
                    console.log("User with id of " + req.session.userId + " not found")
                }
            });
        } else {
            res.redirect("/user/Login");
        }
    }
);

router.route("/editEmail").post(
    async function (req, res) {
        await dbInteraction.updateEmail(req.session.userId, req.body.email);
        res.redirect("/user/profile/" + req.session.userId);
    }
);

router.route("/delete").get(

    async function (req, res) {
        if (req.session.username) {
            await User.deleteOne({ _id: req.session.userId }, function (err, user) {
                if (err) {
                    console.log("failed to delete a user");
                } else {
                    req.session.currentCards = null;
                    req.session.currentDeckName = null;
                    req.session.username = null;
                    req.session.userId = null;
                    req.session.isAdmin = null;

                    res.redirect("/");
                }
            });
        }
    }
);

router.route("/Login").get(
    function (req, res) {
        req.session.currentCards = null;
        req.session.currentDeckName = null;
        var model = {
            title: "Login Page",
            username: req.session.username,
            userId: req.session.userId,
            isAdmin: req.session.isAdmin
        }

        res.render("login", model);
    }
);

router.route("/Login").post(
    async function (req, res) {
        req.session.currentCards = null;
        req.session.currentDeckName = null;
        var user = await User.findOne({ username: req.body.username });
        var valid = false;
        if (user) {
            valid = await bcrypt.compare(req.body.password, user.password);
        }

        if (user && valid) {
            console.log(user);
            req.session.username = user.username;
            req.session.userId = user._id;
            req.session.isAdmin = user.admin;
            console.log(req.session);
            res.redirect("/");
        } else {
            req.session.currentCards = null;
            req.session.currentDeckName = null;
            req.session.username = null;
            req.session.userId = null;
            req.session.isAdmin = null;

            var model = {
                title: "Login Page",
                message: "Username or password was incorrect!"
            }

            res.render("login", model);
        }
    }
);

router.route("/Logout").get(
    function (req, res) {
        req.session.currentCards = null;
        req.session.currentDeckName = null;
        req.session.username = null;
        req.session.userId = null;
        req.session.isAdmin = null;

        res.redirect("/");
    }
);

module.exports = router;