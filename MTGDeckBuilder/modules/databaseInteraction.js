const mongoose = require("mongoose");
var uri = "mongodb+srv://false-admin:cake@rshawatlascluster-8ambh.mongodb.net/MTGDeckBuilder?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const Schema = mongoose.Schema;
const ObjectID = mongoose.ObjectId;

const UserSchema = new Schema({
    _id: ObjectID,
    admin: Boolean,
    username: String,
    password: String,
    email: String,
    decks: [
        { deckName: String, cardsByName: [String] }
    ]
});
const User = mongoose.model("users", UserSchema);

async function updateUsername(_id, username) {
    await User.updateOne({ _id: _id }, { $set: { username: username } });
}

async function updatePassword(_id, password) {
    await User.updateOne({ _id: _id }, { $set: { password: password } });
}

async function updateEmail(_id, email) {
    await User.updateOne({ _id: _id }, { $set: { email: email } });
}

async function addDeckToUser(userId, nameOfDeck, deckAdding) {
    await User.findOne({ _id: userId }, function (err, user) {
        if (err) {
            console.error("An error occurred trying to access the user");
        }
        if (user) {
            console.log("User Found: " + user);
            var userDecks = user.decks;
            userDecks.push({ deckName: nameOfDeck, cardsByName: deckAdding });
            User.updateOne({ _id: user._id }, { $set: { decks: userDecks } }, function(err) {
                if(err) console.error(err);
                console.log("Added new Deck to the user");
            });
        } else {
            console.log("User with id of " + userId + " not found")
        }
    })
}

async function addUsers(req, res) {
    if (!req.session.isAdmin) {
        res.redirect("/user/login");
    } else {
        bcrypt.hash("P@ssw0rd", saltRounds, function (err, hash) {
            var newUser = new User(
                {
                    _id: mongoose.Types.ObjectId(),
                    name: "Default Admin User",
                    email: "Admin@here.com",
                    username: "Admin",
                    password: hash,
                    roles: ["Admin"]
                }
            );
            newUser.save();
        });
        res.redirect("/");
    }
};

const CardSchema = new Schema({
    name: String,
    released: String,
    imageUri: String,
    manaCost: String,
    cmc: Number,
    type: String,
    rulesText: String,
    power: String,
    toughness: String,
    colors: [String],
    colorIdentity: [String],
    legalities: {
        standard: String,
        future: String,
        historic: String,
        pioneer: String,
        modern: String,
        legacy: String,
        pauper: String,
        vintage: String,
        penny: String,
        commander: String,
        brawl: String,
        duel: String,
        oldschool: String
    },
    rarity: String,
    flavorText: String,
    artist: String,
    prices: {
        usd: String,
        usdFoil: String,
        eur: String,
        tix: String
    },
    purchaseUris: {
        tcgplayer: String,
        cardmarket: String,
        cardhoarder: String
    }
});
const Card = mongoose.model("cards", CardSchema);

async function addCard(name, released, imageUri, manaCost, cmc, type, rulesText, power, toughness, colors, colorIdentity, legalities, rarity, flavorText, artist, prices, purchaseUris) {
    var newCard = new Card({
        name: name,
        released: released,
        imageUri: imageUri,
        manaCost: manaCost,
        cmc: cmc,
        type: type,
        rulesText: rulesText,
        power: power,
        toughness: toughness,
        colors: colors,
        colorIdentity: colorIdentity,
        legalities: legalities,
        rarity: rarity,
        flavorText: flavorText,
        artist: artist,
        prices: prices,
        purchaseUris: purchaseUris
    });
    await newCard.save();
}

async function updateCardByName(name, newReleased, newImageUri, newManaCost, newCmc, newType, newRulesText, newPower, newToughness, newColors, newColorIdentity, newLegalities, newRarity, newFlavorText, newArtist, newPrices, newPurchaseUris) {
    await Card.updateOne({ name: name },
        {
            released: newReleased,
            imageUri: newImageUri,
            manaCost: newManaCost,
            cmc: newCmc,
            type: newType,
            rulesText: newRulesText,
            power: newPower,
            toughness: newToughness,
            colors: newColors,
            colorIdentity: newColorIdentity,
            legalities: newLegalities,
            rarity: newRarity,
            flavorText: newFlavorText,
            artist: newArtist,
            prices: newPrices,
            purchaseUris: newPurchaseUris
        });
}

module.exports = { 
    addCard: addCard,
    updateCardByName: updateCardByName, 
    addUsers: addUsers, 
    updateUsername: updateUsername,
    updatePassword: updatePassword, 
    updateEmail: updateEmail,
    addDeckToUser: addDeckToUser
};