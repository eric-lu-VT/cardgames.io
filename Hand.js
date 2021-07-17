const {cardCompare} = require('./index.js');

module.exports = { 
    makeHand, 
    handAsString,
    handAsURL,
    handCompare
}

/**
* Creates a new hand from the given string.
* A hand can consist of anywhere from one to five Cards.
* A newly created Hand is automatically sorted to proper Poker format.
* @param {String} str - the string to create the hand from, such as "Kd 5s Jc Ah Qc"
* @return the newly created hand (as an array of Cards)
* @throws Will throw an error if there is a request for a more than 5 card hand.
*/
function makeHand(str) {
    var parts = str.split(' ');
    if(parts.length > 5) throw "There cannot be more than 5 cards in a hand."

    var hand = [];
    parts.forEach(p => {
        var text = "";
        var rankVal = -1;
        var suitVal = -1;

        switch(p.charAt(0)) {
            case '2':
                rankVal = 2;
                text = "2_of_"
                break;
            case '3':
                rankVal = 3;
                text = "3_of_"
                break;
            case '4':
                rankVal = 4;
                text = "4_of_"
                break;
            case '5':
                rankVal = 5;
                text = "5_of_"
                break;
            case '6':
                rankVal = 6;
                text = "6_of_"
                break;
            case '7':
                rankVal = 7;
                text = "7_of_"
                break;
            case '8':
                rankVal = 8;
                text = "8_of_"
                break;
            case '9':
                rankVal = 9;
                text = "9_of_"
                break;
            case 'T':
                rankVal = 10;
                text = "10_of_"
                break;
            case 'J':
                rankVal = 11;
                text = "jack_of_"
                break;
            case 'Q':
                rankVal = 12;
                text = "queen_of_"
                break;
            case 'K':
                rankVal = 13;
                text = "king_of_"
                break;
            case 'A':
                rankVal = 14;
                text = "ace_of_"
                break;
            default:
                throw "ERROR: invalid_hand";
        }

        switch(p.charAt(1)) {
            case '?':
                suitVal = 0;
                text += "null";
                break;
            case 'c':
                suitVal = 1;
                text += "clubs";
                break;
            case 'd':
                suitVal = 2;
                text += "diamonds";
                break;
            case 'h':
                suitVal = 3;
                text += "hearts";
                break;
            case 's':
                suitVal = 4;
                text += "spades";
                break;
            default:
                throw "ERROR: invalid_hand";
        }
        
        hand.push({
            "text": text,
            "rank": p.charAt(0),
            "suit": p.charAt(1),
            "rankVal": rankVal,
            "suitVal": suitVal,
            // "imgURL": '/img/' + p.charAt(0) + p.charAt(1) + '.png'
            "imgURL": '/img/' + text + '.png'
        });
    });
    check(hand);
    return hand;
}

/**
* Returns a string representation of an array of cards (no limit to array size)
* @param  {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the array of cards in question.
* @return a string representation of the array of cards, such as "Kd 5s Jc Ah Qc" 
*/
function handAsString(hand) {
    var str = "";
    hand.forEach(c => {
        str += c.text + " ";
    });
    return str;
}

function handAsURL(hand) {
    var imgs = [];
    hand.forEach(c => {
        imgs.push(c.imgURL);
    });
    return imgs;
}

/**
* Compares two hands based on their Poker ranking.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand1
* - Represents the first hand in question.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand1
* - Represents the second hand in question.
* @return 1 if hand1 is better than hand2, -1 if hand1 is worse than hand2, 0 if equal
*/
function handCompare(hand1, hand2) {
    const p1 = check(hand1);
    const p2 = check(hand2);
    if(p1 > p2) return 1;
    else if(p1 < p2) return -1
    else {
        for(var i = 0; i < 5; i++) {
            if(i >= hand1.length) {
                return -1;
            }
            if(i >= hand2.length) {
                return 1;
            }
            if(cardCompare(hand1[i], hand2[i]) >= 1) return 1;
            else if(cardCompare(hand1[i], hand2[i]) <= -1) return -1;
        }
    }
    return 0;
}

/**
* Determines the rank of the inputted hand, and sorts it to proper Poker format.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return An integer indicating the hand's rank value.
*/
function check(hand) {
    hand.sort((a, b) => cardCompare(b, a));
    if(isStraightFlush(hand)) return 8;
    if(isFourKind(hand)) return 7;
    if(isFullHouse(hand)) return 6;
    if(isFlush(hand)) return 5;
    if(isStraight(hand)) return 4;
    if(isThreeKind(hand)) return 3;
    if(isTwoPair(hand)) return 2;
    if(isOnePair(hand)) return 1;
    return 0;
}

/**
* Determines if the inputted hand is a straight flush; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand 
* - Represents the hand in question.
* @return true if the hand is a straight flush; false otherwise.
*/
function isStraightFlush(hand) {
    return isFlush(hand) && isStraight(hand);
}

/**
* Determines if the inputted hand is a four of a kind; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return true if the hand is a four of a kind; false otherwise.
*/
function isFourKind(hand) {
    if(hand.length < 4) return false;
    if(hand[0].rankVal === hand[1].rankVal && hand[1].rankVal === hand[2].rankVal && hand[2].rankVal === hand[3].rankVal) {
        return true; // x x x x, x x x x y
    }
    else if(hand.length === 4) { // Equivalent to (!hand[1] && hand.length == 4)
        return false;
    }
    if(hand[1].rankVal === hand[2].rankVal && hand[2].rankVal === hand[3].rankVal && hand[3].rankVal === hand[4].rankVal) {
        // y x x x x
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        const c3 = hand[3];
        const c4 = hand[4];
        hand[0] = c1;
        hand[1] = c2;
        hand[2] = c3;
        hand[3] = c4;
        hand[4] = c0;
        return true;
    }
    return false;
}

/**
* Determines if the inputted hand is a straight full house; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return true if the hand is a full house; false otherwise.
*/
function isFullHouse(hand) {
    if(hand.length != 5) return false;

    if(hand[0].rankVal === hand[1].rankVal && hand[2].rankVal === hand[3].rankVal && hand[3].rankVal === hand[4].rankVal) {
        // y y x x x
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        const c3 = hand[3];
        const c4 = hand[4];
        hand[0] = c2;
        hand[1] = c3;
        hand[2] = c4;
        hand[3] = c0;
        hand[4] = c1;
        return true;
    }
    return(hand[0].rankVal === hand[1].rankVal && hand[1].rankVal === hand[2].rankVal && hand[3].rankVal === hand[4].rankVal);
}

/**
* Determines if the inputted hand is a flush; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return true if the hand is a flush; false otherwise.
*/
function isFlush(hand) {
    if(hand.length != 5) return false;
    hand.forEach(c => {
        if(c.suitVal === 0) { // Cannot make a flush out of null suits.
            return false;
        }
    });
    return hand[0].suitVal === hand[1].suitVal && hand[1].suitVal === hand[2].suitVal && hand[2].suitVal === hand[3].suitVal && hand[3].suitVal === hand[4].suitVal;
}

/**
* Determines if the inputted hand is a straight; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return true if the hand is a straight; false otherwise.
*/
function isStraight(hand) {
    if(hand.length != 5) return false;
    if(hand[0].rankVal === 14) { // Wrap around straight
        var a1 = hand[1].rankVal === 5 && hand[2].rankVal === 4 && hand[3].rankVal === 3 && hand[2].rankVal === 2;
        var a2 = hand[1].rankVal === 13 && hand[2].rankVal === 12 && hand[3].rankVal === 11 && hand[2].rankVal === 10;
        return a1 || a2;
    }
    else {
        var tgt = hand[0].rankVal;
        for(var i = 0; i < 5; i++) {
            tgt--;
            if(hand[i].rankVal != tgt) {
                return false;
            }
        }
    }
    return true;
}

/**
* Determines if the inputted hand is a three of a kind; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return true if the hand is a three of a kind; false otherwise.
*/
function isThreeKind(hand) {
    // Do not need to check isFourKind or isFullHouse, since use of this method should come after those ones
    if(hand.length < 3) return false;
    if(hand[0].rankVal === hand[1].rankVal && hand[1].rankVal === hand[2].rankVal) return true; // x x x, x x x y, x x x y z
    else if(hand.length === 3) return false;
    if(hand[1].rankVal === hand[2].rankVal && hand[2].rankVal === hand[3].rankVal) {
        // y x x x, y x x x z
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        const c3 = hand[3];
        hand[0] = c1;
        hand[1] = c2;
        hand[2] = c3;
        hand[3] = c0;
        return true;
    }
    else if(hand.length === 4) return false;
    if(hand[2].rankVal === hand[3].rankVal && hand[3].rankVal === hand[4].rankVal) {
        // y z x x x
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        const c3 = hand[3];
        const c4 = hand[4];
        hand[0] = c2;
        hand[1] = c3;
        hand[2] = c4;
        hand[3] = c0;
        hand[4] = c1;
        return true;
    }
    return false;
}

/**
* Determines if the inputted hand is a two pair; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return true if the hand is a two pair; false otherwise.
*/
function isTwoPair(hand) {
    // Do not need to check isFourKind or isFullHouse or isThreeKind, since use of this method should come after those ones
    if(hand.length < 4) return false;
    if(hand[0].rankVal === hand[1].rankVal && hand[2].rankVal === hand[3].rankVal) return true; // x x y y, x x y y z
    else if(hand.length === 4) return false;
    if(hand[0].rankVal === hand[1].rankVal && hand[3].rankVal === hand[4].rankVal) {
        // x x z y y
        const c2 = hand[2];
        const c3 = hand[3];
        const c4 = hand[4];
        hand[2] = c3;
        hand[3] = c4;
        hand[4] = c2;
        return true;
    }
    else if(hand[1].rankVal === hand[2].rankVal && hand[3].rankVal === hand[4].rankVal) {
        // z x x y y
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        const c3 = hand[3];
        const c4 = hand[4];
        hand[0] = c1;
        hand[1] = c2;
        hand[2] = c3;
        hand[3] = c4;
        hand[4] = c0;
        return true;
    }
    return false;
}

/**
* Determines if the inputted hand is a one pair; sorts it to proper Poker format.
* This method assumes that arr is sorted from highest rank to lowest.
* @param {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the hand in question.
* @return true if the hand is a one pair; false otherwise.
*/
function isOnePair(hand) {
    if(hand.length < 2) return false;
    if(hand[0].rankVal === hand[1].rankVal) return true; // x x, x x w, x x w y, x x w y z
    else if(hand.length === 2) return false;
    if(hand[1].rankVal === hand[2].rankVal) {
        // w x x, w x x y, w x x y z
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        hand[0] = c1;
        hand[1] = c2;
        hand[2] = c0;
        return true;
    }
    else if(hand.length === 3) return false;
    if(hand[2].rankVal === hand[3].rankVal) {
        // w y x x, w y x x z
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        const c3 = hand[3];
        hand[0] = c2;
        hand[1] = c3;
        hand[2] = c0;
        hand[3] = c1;
        return true;
    }
    else if(hand.length === 4) return false;
    if(hand[3].rankVal === hand[4].rankVal) {
        // w y z x x
        const c0 = hand[0];
        const c1 = hand[1];
        const c2 = hand[2];
        const c3 = hand[3];
        const c4 = hand[4];
        hand[0] = c3;
        hand[1] = c4;
        hand[2] = c0;
        hand[3] = c1;
        hand[4] = c2;
        return true;
    }
    return false;
}