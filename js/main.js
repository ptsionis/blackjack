'use strict';

const deck = [];
shuffleDeck();
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

const playerHand = document.getElementById('playerHand');
const dealerHand = document.getElementById('dealerHand');

class Player {
    constructor(name, cash) {
        this.name = name;
        this.cash = cash;
        this.hand = 0;
        this.hasAce = false;
        this.isBusted = false;
    }

    hit() {
        //Create a new card element
        let newCardElement = document.createElement("img");
        newCardElement.setAttribute('class', 'card');
        if (dealerTurn==false) {
            playerHand.appendChild(newCardElement);
        }
        else {
            dealerHand.appendChild(newCardElement);
        }

        //Pick a card from the deck
        let poppedCard = deck.pop();
        newCardElement.src = './images/playing_cards_source_by_yozzo/'+poppedCard+'.svg';
        let newCardValue = poppedCard.slice(0,1);
        if (newCardValue=='2' || newCardValue=='3' || newCardValue=='4' || newCardValue=='5' || newCardValue=='6' || newCardValue=='7' || 
        newCardValue=='8' || newCardValue=='9') {
            this.hand += parseInt(newCardValue);
        }
        else if (newCardValue=='a') {
            if (this.hand+11 <= 21) {
                this.hand += 11;
                this.hasAce = true;
            }
            else {
                this.hand += 1;
            }
        }
        else {
            this.hand += 10;
        }
        if (this.hand > 21 && this.hasAce==true) {
            this.hand -= 10;
            this.hasAce = false;
        }

        //If deck is empty, reshuffle it
        if (deck.length == 0) {
            shuffleDeck();
        }

        //Check if player reached 21
        console.log(this.name + " hand is: " + this.hand);
        if (this.hand == 21) {
            this.stand();
        }

        //Check if player is busted
        if (this.hand > 21) {
            if (this.name=='dealer') {
                console.log("Demo wins");
                player.cash += confirmedBet * 2;
                playerCash.innerHTML = '&dollar; ' + player.cash;
            }
            else {
                console.log("Dealer wins")
            }
            this.isBusted = true;
            document.getElementById('hidden').src = tempCardSrc;
        }
    }

    stand() {
        if (this.name!='dealer') {
            dealerPlays();
        }
    }
}

const player = new Player('demo', 1000);
const dealer = new Player('dealer', 9999);
let dealerTurn = false;
let tempCardSrc = '';
let playerBet = 0;
let confirmedBet = 0;

function newRound() {
    while (playerHand.firstChild) {
        playerHand.removeChild(playerHand.firstChild);
    }
    while (dealerHand.firstChild) {
        dealerHand.removeChild(dealerHand.firstChild);
    }

    //Initialize hands
    dealerTurn = false;
    player.hand = 0;
    dealer.hand = 0;

    if (deck.length<4) {
        shuffleDeck();
    }

    function giveHand(_player) {
        let _playerHand;
        if (_player.name!='dealer') {
            _playerHand = playerHand;
        }
        else {
            _playerHand = dealerHand;
        }
        for (let i=0; i<2; i++) {
            let newCardElement = document.createElement("img");
            newCardElement.setAttribute('class', 'card');
            _playerHand.appendChild(newCardElement);
            let poppedCard = deck.pop();
            newCardElement.src = './images/playing_cards_source_by_yozzo/'+poppedCard+'.svg';
            let newCardValue = poppedCard.slice(0,1);
            if (newCardValue=='2' || newCardValue=='3' || newCardValue=='4' || newCardValue=='5' || newCardValue=='6' || newCardValue=='7' || 
            newCardValue=='8' || newCardValue=='9') {
                _player.hand += parseInt(newCardValue);
            }
            else if (newCardValue=='a') {
                if (_player.hand+11 <= 21) {
                    _player.hand += 11;
                    _player.hasAce = true;
                }
                else {
                    _player.hand += 1;
                }
            }
            else {
                _player.hand += 10;
            }
            if (_player.name=='dealer' && i!=0) {
                newCardElement.setAttribute('id', 'hidden');
                tempCardSrc = newCardElement.src;
                newCardElement.src = './images/back.png';
            }
        }
        console.log(deck);
    }

    //Give player 2 cards
    giveHand(player);

    //Give dealer 2 cards
    giveHand(dealer);

    console.log(player.hand + " " + dealer.hand);

    //Player got a blackjack
    if (player.hand==21) {
        if (dealer.hand==21) {
            console.log("Both dealer and player bj, push");
        }
        else {
            console.log('demo blackjack');
            player.cash += (confirmBet*2 + (confirmedBet/2)*3/2);
        }
    }
}

const playerCash = document.getElementById('player-cash');
const playerTempBet = document.getElementById('player-bet');
function addBet(_this) {
    console.log(_this);
    if (_this.id=='token50') {
        playerBet += 50;
    }
    else if (_this.id=='token100') {
        playerBet += 100;
    }
    else if (_this.id=='token200') {
        playerBet += 200;
    }
    else if (_this.id=='token500') {
        playerBet += 500;
    }
    else {
        playerBet += 1000;
    }
    playerTempBet.innerHTML = '&dollar; ' + playerBet;
}

function confirmBet() {
    if (player.cash >= playerBet) {
        player.cash -= playerBet;
        confirmedBet = playerBet;
        playerCash.innerHTML = '&dollar; ' + player.cash;
    }
    else {
        console.log("not enough cash");
    }
}

function clearBet() {
    playerBet = 0;
    playerTempBet.innerHTML = '&dollar; 0'
}

function dealerPlays() {
    dealerTurn = true;
    document.getElementById('hidden').src = tempCardSrc;

    while (dealer.hand<17) {
        dealer.hit();
    }
    
    if (!player.isBusted && !dealer.isBusted) {
        if (player.hand < dealer.hand) {
            console.log("Dealer wins");
        }
        else if (player.hand > dealer.hand) {
            console.log("Demo wins");
            player.cash += confirmedBet * 2;
            playerCash.innerHTML = '&dollar; ' + player.cash;
        }
        else {
            console.log("Push!");
            player.cash += confirmedBet;
            playerCash.innerHTML = '&dollar; ' + player.cash;
        }
    }
}

newRound();