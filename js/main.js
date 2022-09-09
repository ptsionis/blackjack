'use strict';

const deck = [];
const playerHand = document.getElementById('playerHand');
const dealerHand = document.getElementById('dealerHand');
const bettingContainer = document.getElementById('betting-container');
const buttonContainer = document.getElementById('button-container');
const playerHitBtn = document.getElementById('playerHitBtn');
const playerStandBtn = document.getElementById('playerStandBtn');
const playerCash = document.getElementById('player-cash');
const playerTempBet = document.getElementById('player-bet');
const addBetSound = document.getElementById('addBetSound');
const clearBetSound = document.getElementById('clearBetSound');
const hitCardSound = document.getElementById('hitCardSound');
const shuffleSound = document.getElementById('shuffleSound');

let dealerTurn = false; //It's used to know if the popped card should go to the player or the dealer DOM container
let tempCardSrc = '';
let playerBet = 0;
let confirmedBet = 0;

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

    shuffleSound.play();
}

class Player {
    constructor(name, cash) {
        this.name = name;
        this.cash = cash;
        this.hand = 0;
        this.isSoft = false;
    }

    hit() {
        //If deck is empty, reshuffle it
        if (deck.length == 0) {
            shuffleDeck();
        }

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
        if (newCardValue=='2' || newCardValue=='3' || newCardValue=='4' || newCardValue=='5' || newCardValue=='6' || newCardValue=='7' || newCardValue=='8' || newCardValue=='9') {
            this.hand += parseInt(newCardValue);
        }
        else if (newCardValue=='a') {
            if (this.hand+11 <= 21) {
                this.hand += 11;
                this.isSoft = true;
            }
            else {
                this.hand += 1;
            }
        }
        else {
            this.hand += 10;
        }
        hitCardSound.play();

        //Make hand from soft to hard
        if (this.hand > 21 && this.isSoft==true) {
            this.hand -= 10;
            this.isSoft = false;
        }

        //Check if player reached 21
        if (this.hand == 21) {
            this.stand();
        }

        if (this.hand > 21) {
            //Check if dealer is busted
            if (this.name=='dealer') {
                player.cash += confirmedBet * 2;
                playerCash.innerHTML = 'Cash: &dollar;' + player.cash;
            }
            //Check if player is busted
            else {
                document.getElementById('hidden').src = tempCardSrc;
                playerHitBtn.disabled = true;
                playerHitBtn.style.cursor = 'default';
                playerStandBtn.disabled = true;
                playerStandBtn.style.cursor = 'default';
            }
            //Code to go to the next round
        }
    }

    stand() {
        //If player pressed Stand, disable action buttons and let dealer play
        if (this.name!='dealer') {
            playerHitBtn.disabled = true;
            playerHitBtn.style.cursor = 'default';
            playerStandBtn.disabled = true;
            playerStandBtn.style.cursor = 'default';
            dealerPlays();
        }
    }
}

const player = new Player('demo', 1000);
const dealer = new Player('dealer', 9999);

function newRound() {
    //Clears all cards from the DOM
    while (playerHand.firstChild) {
        playerHand.removeChild(playerHand.firstChild);
    }
    while (dealerHand.firstChild) {
        dealerHand.removeChild(dealerHand.firstChild);
    }

    //Set both hands to zero and isSoft to false
    dealerTurn = false;
    player.hand = 0;
    player.isSoft = false;
    dealer.hand = 0;
    dealer.isSoft = false;

    //If deck length is less than 4, shuffle
    if (deck.length<4) {
        shuffleDeck();
    }

    //Show betting options
    bettingContainer.style.display = 'flex';
    buttonContainer.style.display = 'none';

    //Make Hit, Stand, Double buttons clickable
    playerHitBtn.disabled = false;
    playerHitBtn.style.cursor = 'pointer';
    playerStandBtn.disabled = false;
    playerStandBtn.style.cursor = 'pointer';
}

function addBet(_this) {
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
    addBetSound.play();
    playerTempBet.innerHTML = 'Bet: &dollar;' + playerBet;
}

function confirmBet() {
    //Check if tempBet is less or equal than the total cash amount of the player
    if (player.cash >= playerBet) {
        player.cash -= playerBet;
        confirmedBet = playerBet;
        playerCash.innerHTML = 'Cash: &dollar;' + player.cash;
        //If tempBet is less or equal than the total cash amount of the player, hide betting container, give hands and show actions container
        bettingContainer.style.display = 'none';
        giveHand(player);
        giveHand(dealer);
        buttonContainer.style.display = 'flex'
    }
    else {
        //Add code that says 'Cash not enough' in the DOM
    }
}

function clearBet() {
    //Reset tempBet
    playerBet = 0;
    playerTempBet.innerHTML = 'Bet: &dollar;0'
    clearBetSound.play();
}

function giveHand(_player) {
    let _playerHand;
    if (_player.name!='dealer') {
        _playerHand = playerHand;
    }
    else {
        _playerHand = dealerHand;
    }

    //Share 2 cards
    for (let i=0; i<2; i++) {
        //Create a new card element and add it to the corresponding DOM element
        let newCardElement = document.createElement("img");
        newCardElement.setAttribute('class', 'card');
        _playerHand.appendChild(newCardElement);

        //Pop a card from the deck and add it to the corresponding hand
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
                _player.isSoft = true;
            }
            else {
                _player.hand += 1;
            }
        }
        else {
            _player.hand += 10;
        }

        //Hide dealer's second card
        if (_player.name=='dealer' && i!=0) {
            newCardElement.setAttribute('id', 'hidden');
            tempCardSrc = newCardElement.src;
            newCardElement.src = './images/back.png';
        }
        hitCardSound.play();
    }

    //Check if player got a blackjack
    if (_player.name == 'dealer') {
        if (player.hand==21) {
            //If player got a BJ, disable action buttons, show dealer's second card
            playerHitBtn.disabled = true;
            playerHitBtn.style.cursor = 'default';
            playerStandBtn.disabled = true;
            playerStandBtn.style.cursor = 'pointer';
            document.getElementById('hidden').src = tempCardSrc;

            //Check if dealer has BJ too and add the corresponding cash on player's cash after
            if (dealer.hand==21) {
                player.cash += confirmedBet;
            }
            else {
                player.cash += (confirmedBet*2 + (confirmedBet/2));
            }
            //Code to go to the next round
        }
        else {
            //Check if dealer has a BJ while player does not
            if (dealer.hand==21) {
                document.getElementById('hidden').src = tempCardSrc;
                playerHitBtn.disabled = true;
                playerHitBtn.style.cursor = 'default';
                playerStandBtn.disabled = true;
                playerStandBtn.style.cursor = 'pointer';
                //Code to go to the next round
            }
        }
    }
}

function dealerPlays() {
    dealerTurn = true;
    document.getElementById('hidden').src = tempCardSrc;

    while (dealer.hand<17) {
        dealer.hit();
    }
    
    //Check if player's hand is bigger than dealer's hand
    if (player.hand > dealer.hand) {
        player.cash += confirmedBet * 2;
        playerCash.innerHTML = 'Cash: &dollar;' + player.cash;
    }
    if (player.hand == dealer.hand) {
        player.cash += confirmedBet;
        playerCash.innerHTML = 'Cash: &dollar;' + player.cash;
    }
}

shuffleDeck(); //Initialize the deck for the first time
newRound(); //Set everything up for the first time