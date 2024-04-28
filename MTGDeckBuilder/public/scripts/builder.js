window.onload = function() {
    this.document.getElementById("saveDeckButton").addEventListener("click", onDeckSubmit);

    function onDeckSubmit(e) {
        if(e.preventDefault) e.preventDefault();
        var deckName = document.getElementsByName("deckName")[0].value;
        var cards = document.getElementsByName("cardView")[0].value;
        console.log(deckName);
        console.log(cards);
        if(deckName) {
            window.location.replace("/user/addDeck/" + deckName + "/" + cards);
        } else {
            window.location.replace("/user/buildDeck/%20Deck%20Name%20cannot%20be%20blank");
        }
    }
}