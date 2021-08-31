const {cardCompare} = require('./index.js');

module.exports = { 
    replacePile,
}

/**
* @param {Array} oldPileArr
* @param {String} newPileStr
* @return
* @throws 
*/
function replacePile(oldPileArr, newPileStr) {
    var parts = newPileStr.split(' ');
    if(parts.length > 4) throw "ERROR: There cannot be more than 4 cards in a pile."

    var newPileArr = [];
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
                throw "ERROR: Invalid pile request.";
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
                throw "ERROR: Invalid pile request.";
        }
        
        newPileArr.push({
            "text": text,
            "rank": p.charAt(0),
            "suit": p.charAt(1),
            "rankVal": rankVal,
            "suitVal": suitVal,
            // "imgURL": '/img/' + p.charAt(0) + p.charAt(1) + '.png'
            "imgURL": '/img/' + text + '.png'
        });
    });
    if(!check(oldPileArr, newPileArr)) {
        throw "ERROR: Invalid pile request.";
    }
    return newPileArr;
}

/**
* Returns a string representation of an array of cards (no limit to array size)
* @param  {Array.<text: String, rank: String, suit: String, rankVal: Number, suitVal: Number>} hand
* - Represents the array of cards in question.
* @return a string representation of the array of cards, such as "Kd 5s Jc Ah Qc" 
*/
function pileAsString(hand) {
    var str = "";
    hand.forEach(c => {
        str += c.text + " ";
    });
    return str;
}

function pileAsURL(hand) {
    var imgs = [];
    hand.forEach(c => {
        imgs.push(c.imgURL);
    });
    return imgs;
}

/**
* 
* @param 
* @return 
*/
function check(oldPileArr, newPileArr) {
    newPileArr.sort((a, b) => cardCompare(b, a));
    
    const checkVal = newPileArr[0].rankVal;
    for(var i = 1; i < newPileArr.length; i++) {
        if(newPileArr[i].rankVal !== checkVal) {
            return false;
        }
    }
    
    if(oldPileArr.length === 0) {
        return true;
    }
    
    if(oldPileArr[0].rankVal <= checkVal && oldPileArr.length === newPileArr.length) {
        return true;
    }
    else if(newPileArr[0].rankVal === 2 && newPileArr.length === 1) {
        return true;
    }
    return false;
}