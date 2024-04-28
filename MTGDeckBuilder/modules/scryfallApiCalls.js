const dbInteraciton = require("../modules/databaseInteraction");
const mongoose = require("mongoose");
const scryfallApi = "https://api.scryfall.com/"
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const Card = mongoose.model("cards");

function makeAPIRequest(url, method = "GET") {
    var request = new XMLHttpRequest();

    return new Promise(function (resolve, reject) {
        request.onreadystatechange = function () {
            if (request.readyState !== 4) return;

            if (request.status >= 200 && request.status < 300) {
                resolve(request);
            } else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };
        request.open(method, url, true);
        request.send();
    });
};

function loadData(url, method="GET") {
    var request = new XMLHttpRequest;
    request.open("GET", scryfallApi + "scryfallApicards?page=0");
    request.onload = loadComplete;
    request.send();
};

async function loadComplete(evt) {
    var scryfallJson = JSON.parse(request.response);
    console.log(scryfallJson);

}

function thenForAddAndUpdate(req) {
    var scryfallJson = JSON.parse(req.responseText);
    console.log(scryfallJson.next_page);
    for (let index = 0; index < scryfallJson.data.length; index++) {
        const scryfallCard = scryfallJson.data[index];
        // console.log(scryfallCard);
        if(scryfallCard.lang == "en") {
            Card.findOne({ name: scryfallCard.name }, function (err, card) {
                if (err) {
                    console.error(err);
                }
                if (card) {
                    dbInteraciton.updateCardByName(
                        scryfallCard.name,
                        scryfallCard.released_at,
                        (scryfallCard.image_uris ? scryfallCard.image_uris.normal : ""),
                        scryfallCard.mana_cost,
                        scryfallCard.cmc,
                        scryfallCard.type_line,
                        scryfallCard.oracle_text,
                        scryfallCard.power,
                        scryfallCard.toughness,
                        scryfallCard.colors,
                        scryfallCard.color_identity,
                        scryfallCard.legalities,
                        scryfallCard.rarity,
                        (scryfallCard.flavor_text ? scryfallCard.flavor_text : ""),
                        scryfallCard.artist,
                        { usd: scryfallCard.prices.usd, usdFoil: scryfallCard.prices.usd_foil, eur: scryfallCard.prices.eur, tix: scryfallCard.prices.tix },
                        scryfallCard.purchase_uris
                    );
                } else {
                    dbInteraciton.addCard(
                        scryfallCard.name,
                        scryfallCard.released_at,
                        (scryfallCard.image_uris ? scryfallCard.image_uris.normal : ""),
                        scryfallCard.mana_cost,
                        scryfallCard.cmc,
                        scryfallCard.type_line,
                        scryfallCard.oracle_text,
                        scryfallCard.power,
                        scryfallCard.toughness,
                        scryfallCard.colors,
                        scryfallCard.color_identity,
                        scryfallCard.legalities,
                        scryfallCard.rarity,
                        (scryfallCard.flavor_text ? scryfallCard.flavor_text : ""),
                        scryfallCard.artist,
                        { usd: scryfallCard.prices.usd, usdFoil: scryfallCard.prices.usd_foil, eur: scryfallCard.prices.eur, tix: scryfallCard.prices.tix },
                        scryfallCard.purchase_uris
                    );
                }
            });
        }
    }
    if (scryfallJson.has_more == true) {
        makeAPIRequest(scryfallJson.next_page).then(thenForAddAndUpdate);
    }
}

function addAndUpdateAllCards() {
    var currentPage = scryfallApi + "cards?page=1";
        makeAPIRequest(currentPage).then(thenForAddAndUpdate);
};

module.exports = { addAndUpdateAllCards: addAndUpdateAllCards }