'use strict';

class Player {
    constructor(name, cash) {
        this.name = name;
        this.cash = cash;
        this.hand = 0;
    }

    hit() {

    }
}

const deck = [];

function shuffleDeck() {
    deck.push("ac");
    deck.push("ad");
    deck.push("ah");
    deck.push("as");
    for (let i=2; i<=9; i++) {
        deck.push(i+"c");
        deck.push(i+"d");
        deck.push(i+"h");
        deck.push(i+"s");
    }
    deck.push("tc");
    deck.push("td");
    deck.push("th");
    deck.push("ts");
    deck.push("jc");
    deck.push("jd");
    deck.push("jh");
    deck.push("js");
    deck.push("qc");
    deck.push("qd");
    deck.push("qh");
    deck.push("qs");
    deck.push("kc");
    deck.push("kd");
    deck.push("kh");
    deck.push("ks");

    for (let i=deck.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

shuffleDeck();

const card = document.getElementById('card');

function nextCard() {
    let poppedCard = deck.pop();
    card.src = './images/playing_cards_source_by_yozzo/'+poppedCard+'.svg';
    if (deck.length == 0) {
        shuffleDeck();
    }
}