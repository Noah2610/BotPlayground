/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */

var datetime = require("node-datetime");
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var token = process.env.SLACK_API_TOKEN || 'xoxb-80450208261-X2MXbJE20dyrlOfXHHXvud3Z';
var rtm = new RtmClient(token, {
	logLevel: "info",
	dataStore: new MemoryDataStore()
});

	var roomID = "D2CDJJQ66";
	var inputArr = [];

	var cmdChar = "-";


function curDate(frmt) {  // get date and/or time with format
	return datetime.create().format(frmt);
};

function cmdCalc(getInfo) {
		//var tmpArr = [ message.text.substr(message.text.search(cmdChar) + 1, message.text.search(" ") - 1) ]
		//inputArr.push(tmpArr.concat(message.text.substr(message.text.search(" ") + 1, message.text.length - 1).replace(/ /g, "").split("")));
			// i cant split every char like here, wont work for numbers.length > 1
	var info = getInfo.replace(/ /g, "")
	var infoArr = []
	var numArr = []
	var opArr = []
	var checkFromPos = 0
		console.log(info)


		var numStart = 0; var numEnd = 0;
	for (var count = 0; count < info.length; count++) {
			var curChar = info[count];
		if (isNaN(curChar)) {
			numArr.push(parseFloat(info.substring(numStart, numEnd + 1)));
			opArr.push(curChar);
			numStart = count + 1;
			numEnd = count + 1;
		} else if (count + 1 === info.length) {
			numArr.push(parseFloat(info.substring(numStart, numEnd + 2)));
		} else {
			numEnd = count;
		}
	}

	/* while (checkFromPos < info.length) {
		if (isNaN(info[checkFromPos]) == false) {  // if first check is number

			for (var count = checkFromPos; count < info.length; count++) {  // check how long the number is
				if (isNaN(info.substring(checkFromPos, count + 1))) {  // if NaN
					infoArr.push(info.substring(checkFromPos, count))
						console.log(count, "Not a Number: " + info[count], "\n", info.substring(checkFromPos, count + 1))
					infoArr.push(info[count])
					checkFromPos = count + 1
					break
				}
				if (count >= info.length - 1) {
					var endWhile = true
				}
			}
				if (endWhile == true) {
						console.log("break out")
					break
				}

		} else {  // if first check is NaN

			infoArr.push(info[checkFromPos])
				if (isNaN(info[checkFromPos + 1])) {
					return "Invalid calculation method. (" + info.substr(checkFromPos, checkFromPos + 1) + ")"
				}
			var checkFromPos = checkFromPos + 1
		}
	} */

	/* var operators = /[+|-|*|x|/|:]/
	var finalRepeat = false

	while (info.substr(checkFromPos).search(operators) != -1 || finalRepeat == true) {
		// if (isNaN(info.substring(checkFromPos, info.substr(checkFromPos).search(operators) + info.substring(0,checkFromPos).length - 1)) == false) {

			infoArr.push(info.substring(checkFromPos, info.substr(checkFromPos).search(operators) + info.substring(0,checkFromPos).length - 1))  // insert number
		} else {
			return "Invalid number! (" + info.substring(checkFromPos, info.substr(checkFromPos).search(operators) + info.substring(0,checkFromPos).length - 1) + ")"
		}
		infoArr.push(info[info.substr(checkFromPos).search(operators)])  // insert operator

		if (info.substr(checkFromPos).search(operators) < info.length) {
			checkFromPos = info.substr(checkFromPos).search(operators) + 1  // update checkFromPos
		} else { break }

		if (finalRepeat == true) {
			break
		}
		if (info.substr(checkFromPos).search(operators) == -1) {
			finalRepeat = true
		}
	} */

	console.log(numArr,opArr);

		var res = 0; var op = ""; replNum = 0;
		var lvl2ops = /[*x/:]/; var skip = false;

	for (var countOpLvl = 0; countOpLvl < 2; countOpLvl++) {
		for (var count = 0; count < opArr.length; count++) {

			/* for (var countCheck = 0; countCheck < numArr.length; countCheck++) {
				if (numArr[countCheck] == "") {
					numArr.splice(countCheck, 1);
				}
			} */

			var curOp = opArr[count];
			if (op == "") {
				var op = numArr[count];
			}

			for (var countAssign = count + 1; countAssign < numArr.length; countAssign++) {  // assign curNum
				if (numArr[countAssign] != "") {
					var curNum = parseFloat(numArr[countAssign]);
					// numArr.splice(countAssign,1,"");
					var countCurNum = countAssign;
						break;
				}
			}
			for (var countAssign = count; countAssign >= 0; countAssign--) {  // assign prevNum
				if (numArr[countAssign] != "") {
					var prevNum = parseFloat(numArr[countAssign]);
					// numArr.splice(countAssign,1,"");
					var countPrevNum = countAssign;
						break;
				}
			}
				/* var curNum = parseFloat(numArr[count + 1]);
				var prevNum = parseFloat(numArr[count]); */

				if (countOpLvl == 0 && curOp.search(lvl2ops) == -1) {
						skip = true;
				} else if (countOpLvl == 1 && curOp.search(lvl2ops) != -1) {
						skip = true;
				}

				if (countOpLvl == 0) {
					var op = op + " " + curOp + " " + curNum;
				}
				console.log(skip)
			if (skip == false) {
				switch (curOp) {  // check calculation methods
					case "+":
							console.log(curNum);
						numArr.splice(countPrevNum, 1, parseFloat(prevNum + curNum));
							break;
					case "-":
						numArr.splice(countPrevNum, 1, parseFloat(prevNum - curNum));
							break;
					case "*":
					case "x":
						numArr.splice(countPrevNum, 1, parseFloat(prevNum * curNum));
							break;
					case "/":
					case ":":
							console.log(prevNum + " " + curOp + " " + curNum);
						numArr.splice(countPrevNum, 1, parseFloat(prevNum / curNum));
							break;
					default:
						return "I can't give you an answer.\n\"" + curOp + "\" is not a valid calculation operation!";
				}
					numArr.splice(countCurNum, 1, "");
			} else if (skip == true) {
				var skip = false;
			}

				console.log(countOpLvl + " " + count + ": " + op + " = " + numArr);
		}
	}

		console.log(numArr)
	op = op + " = ";
	for (var count = 0; count < numArr.length; count++) {
		if (!isNaN(numArr[count]) && numArr[count] != "") {
			var res = numArr[count];
				break;
		}
	}

	return op + res;

}

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {  // receive message
		console.log('Message:', message);
	var user = rtm.dataStore.getUserById(message.user);
	var bot = rtm.dataStore.getUserById(rtm.activeUserId);

	inputArr.push(message.text);

	if (inputArr[inputArr.length - 1].search(cmdChar) == -1) {  // if no cmd char is found

			console.log("normal test");
		inputArr.push(inputArr[inputArr.length - 1].split(" "));

		for (var count = 0; count < inputArr[inputArr.length - 1].length; count++) {  // check inputs
				var inputTmp = inputArr[inputArr.length - 1][count].replace(/[,.!?;]/g, "").toLowerCase();
			if (inputTmp == "hello") {
				rtm.sendMessage("Hello, " + user.name + "!\nMy name is " + bot.name + "!", roomID);

			} else if (inputTmp == "test") {
				rtm.sendMessage("any message will do", roomID);
			}
		}
	} else {
			// if cmd char is found

			//inputArr.push(message.text.substr(message.text.search(cmdChar) + 1, message.text.search(" ") - 1)),
			//message.text.substr(message.text.search(" ") + 1, message.text.length - 1).replace(" ", "").split("");

			//inputArr.push(message.text.substr(message.text.search(cmdChar) + 1, message.text.search(" ") - 1).concat(message.text.substr(message.text.search(" ") + 1, message.text.length - 1).replace(" ", "").split("")));

		if (inputArr[inputArr.length - 1].substr(inputArr[inputArr.length - 1].search(cmdChar) + 1, inputArr[inputArr.length - 1].search(cmdChar) + 4) == "calc") {
			console.log("calc test");

			rtm.sendMessage(cmdCalc(inputArr[inputArr.length - 1].substr(inputArr[inputArr.length - 1].search(cmdChar) + 5, inputArr[inputArr.length - 1].length)), roomID);
		}
	}
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
		console.log('Reaction:', reaction);
	if (reaction.item_user == rtm.dataStore.getUserById(rtm.activeUserId).id) {
		rtm.sendMessage(":+1:", roomID);
	}
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
		console.log('Reaction:', reaction);
	if (reaction.item_user == rtm.dataStore.getUserById(rtm.activeUserId).id) {
		rtm.sendMessage(":-1:", roomID);
	}
});

if (parseFloat("test") == NaN) {
	console.log("test");
}
