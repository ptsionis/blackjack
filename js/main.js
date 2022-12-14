"use strict";

//All the DOM elements that will be used
const introScreen = document.getElementById('intro');
const popUpMessage = document.getElementById('popup-message');
const playerHand = document.getElementById('playerHand');
const dealerHand = document.getElementById('dealerHand');
const bettingContainer = document.getElementById('betting-container');
const buttonContainer = document.getElementById('button-container');
const playerHitBtn = document.getElementById('playerHitBtn');
const playerStandBtn = document.getElementById('playerStandBtn');
const playerDoubleBtn = document.getElementById('playerDoubleBtn');
const playerCash = document.getElementById('player-cash');
const playerTempBet = document.getElementById('player-bet');
const backgroundMusic = document.getElementById('backgroundMusic');
const addBetSound = document.getElementById('addBetSound');
const hitCardSound = document.getElementById('hitCardSound');
const shuffleSound = document.getElementById('shuffleSound');

const deck = [];
let dealerTurn = false;
let tempCardSrc = '';
let playerBet = 0;
let confirmedBet = 0;
let insuranceAmount = 0;

//Used to shuffle the deck when needed
async function shuffleDeck() {
    //Initialize the cards
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

    //Shuffle the cards
    for (let i=deck.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    //Shuffle pop-up message
    popUpMessage.innerHTML = 'Shuffling...';
    popUpMessage.style.display = 'block';
    shuffleSound.play();
    await sleep(2000);
    popUpMessage.style.display = 'none';
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class Player {
    constructor(name, cash) {
        this.name = name;
        this.cash = cash;
        this.hand = 0;
        this.cardCounter = 2;
        this.isSoft = false;
        this.hasInsurance = false;
        this.hasDouble = false;
    }

    async hit() {
        this.cardCounter++;
        //Disable the Double option if the player chose to hit
        if (this.name=='player' && player.cardCounter>2) {
            playerDoubleBtn.disabled = true;
            playerDoubleBtn.style.cursor = 'default';
        }

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

        if (!player.hasDouble) {
            //Check if player reached 21
            if (this.hand == 21) {
                this.stand();
            }

            if (this.hand > 21) {
                //Check if dealer is busted
                if (this.name=='dealer' && player.hand<=21) {
                    player.cash += confirmedBet * 2;
                    updateCashDisplay();
                }
                //Check if player is busted
                else {
                    disableActionButtons();
                    await sleep(2000);
                    if (!player.hasDouble) {
                        document.getElementById('hidden').src = tempCardSrc;
                        hitCardSound.play();
                    }
                    await sleep(4500);
                    newRound();
                }
            }
        }
        
        //This code will run only when player.hit() was called from player.double() and player.hasDouble == true
        if (player.hasDouble) {
            await sleep(500);
            player.stand();
        }
    }

    stand() {
        //If player pressed Stand, disable action buttons and let dealer play
        if (this.name!='dealer') {
            disableActionButtons();
            setTimeout(dealerPlays, 1000);
        }
    }

    async double() {
        //If player doubles and has enough cash, bet will double, player will hit once, and hit method will auto stand, since hasDouble will be true
        if (player.cash>=confirmedBet) {
            player.cash -= confirmedBet;
            confirmedBet *= 2;
            player.hasDouble = true;
            player.hit();
            player.hasDouble = false;
        }
        //If players doubles and has not enough cash, nothing will happen and a message will appear
        else {
            popUpMessage.innerHTML = 'Not enough cash...';
            popUpMessage.style.display = 'block';
            await sleep(2000);
            popUpMessage.style.display = 'none'
        }
    }

    //Runs when dealer's first card is Ace (it's called from giveHand)
    insurance() {
        insuranceAmount = confirmedBet / 2;
        player.cash -= insuranceAmount;
        player.hasInsurance = true;
        document.getElementById('insurance-container').style.display = 'none';
        buttonContainer.style.visibility = 'visible';
    }
}

const player = new Player('player', 1000);
const dealer = new Player('dealer', 9999);

function newRound() {
    //Clears all cards from the DOM
    while (playerHand.firstChild) {
        playerHand.removeChild(playerHand.firstChild);
    }
    while (dealerHand.firstChild) {
        dealerHand.removeChild(dealerHand.firstChild);
    }

    //Set the turn to player (since dealerTurn becomes false), both hands to zero, card counters to two, isSoft, hasInsuracne and hasDouble to false
    dealerTurn = false;
    player.hand = 0;
    player.cardCounter = 2;
    player.isSoft = false;
    player.hasInsurance = false;
    player.hasDouble = false;
    dealer.hand = 0;
    dealer.cardCounter = 2;
    dealer.isSoft = false;

    //Clears the bet from previous round and updates cash display
    clearBet();
    updateCashDisplay();

    //If deck length is less than 4, shuffle
    if (deck.length<4) {
        shuffleDeck();
    }

    //Show betting options
    bettingContainer.style.display = 'flex';
    buttonContainer.style.display = 'none';
    playerDoubleBtn.disabled = false;
    playerDoubleBtn.style.cursor = 'pointer';

    //Make Hit, Stand, Double buttons clickable
    enableActionButtons();
}

//Runs when player clicks on a token
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
    playerTempBet.innerHTML = '&dollar;' + playerBet;
}

async function confirmBet() {
    //Check if tempBet is less or equal than the total cash amount of the player
    if (player.cash >= playerBet) {
        player.cash -= playerBet;
        confirmedBet = playerBet;
        updateCashDisplay();
        bettingContainer.style.display = 'none';
        buttonContainer.style.visibility = 'hidden';
        setTimeout(giveHand, 500, player);
        setTimeout(giveHand, 1250, dealer);
        buttonContainer.style.display = 'flex';
    }
    else {
        popUpMessage.innerHTML = 'Not enough cash...';
        popUpMessage.style.display = 'block';
        await sleep(2000);
        popUpMessage.style.display = 'none';
    }
}

function clearBet() {
    //Reset tempBet
    playerBet = 0;
    playerTempBet.innerHTML = '&dollar;0';
}

async function giveHand(_player) {
    let _playerHand; //Temp variable that 'points' to the hand that is going to pick the next card
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

        //Ask if player wants insurance
        if (i==0 && _player.name=='dealer' && newCardValue=='a' && player.cash>=confirmedBet/2) {
            document.getElementById('insurance-container').style.display = 'block';
        }

        if (i==1 && _player.name=='dealer' && document.getElementById('insurance-container').style.display!='block') {
            buttonContainer.style.visibility = 'visible';
        }

        await sleep(1500);
    }

    //Check if player got a blackjack
    if (_player.name == 'dealer') {
        if (player.hand==21) {
            //If player got a BJ, disable action buttons, show dealer's second card
            disableActionButtons();
            document.getElementById('hidden').src = tempCardSrc;
            hitCardSound.play();

            //Check if dealer has BJ too and add the corresponding cash on player's cash after
            if (dealer.hand==21) {
                player.cash += confirmedBet;
                payInsurance();
            }
            else {
                player.cash += (confirmedBet*2 + (confirmedBet/2));
            }
            await sleep(4500);
            newRound();
        }
    }
}

async function dealerPlays() {
    dealerTurn = true;
    document.getElementById('hidden').src = tempCardSrc;
    hitCardSound.play();

    //Dealer picks a card while player is not busted and dealer's hand is below 17
    while (dealer.hand<17 && player.hand<=21) {
        await sleep(2000);
        dealer.hit();
    }

    //If player had an insurance and dealer got a BJ, pay the insurance
    payInsurance();
    
    //Check if player's hand is bigger than or equal to dealer's hand
    if (player.hand > dealer.hand && player.hand<=21) {
        player.cash += confirmedBet * 2;
        await sleep(4500);
        newRound();
    }
    if (player.hand == dealer.hand && dealerTurn) {
        player.cash += confirmedBet;
        await sleep(4500);
        newRound();
    }
    if (dealer.hand > player.hand) {
        await sleep(4500);
        newRound();
    }
}

function hideInsurance() {
    document.getElementById('insurance-container').style.display = 'none';
    buttonContainer.style.visibility = 'visible';
}

function payInsurance() {
    //Check if dealer got a blackjack and player had insurance
    if (dealer.hand==21 && dealer.cardCounter==2 && player.hasInsurance==true) {
        player.cash += insuranceAmount*2;
    }
}

function updateCashDisplay() {
    playerCash.innerHTML = '&dollar;' + player.cash;
}

function enableActionButtons() {
    playerHitBtn.disabled = false;
    playerHitBtn.style.cursor = 'pointer';
    playerStandBtn.disabled = false;
    playerStandBtn.style.cursor = 'pointer';
    playerDoubleBtn.disabled = false;
    playerDoubleBtn.style.cursor = 'pointer';
}

function disableActionButtons() {
    playerHitBtn.disabled = true;
    playerHitBtn.style.cursor = 'default';
    playerStandBtn.disabled = true;
    playerStandBtn.style.cursor = 'default';
    playerDoubleBtn.disabled = true;
    playerDoubleBtn.style.cursor = 'default';
}

async function intro() {
    bettingContainer.style.display = 'none';
    buttonContainer.style.display = 'none';
}

async function start() {
    introScreen.style.top = '-100%';
    await sleep(2000);
    introScreen.style.display = 'none';
    shuffleDeck(); //Initialize the deck for the first time
    newRound(); //Set everything up for the first time
    backgroundMusic.play();
}

intro();