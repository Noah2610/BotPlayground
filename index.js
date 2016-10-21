/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */

var fs = require('fs');
var mkdirp = require('mkdirp');
var datetime = require("node-datetime");
var sprintf = require("sprintf-js").sprintf;
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var IncomingWebhook = require('@slack/client').IncomingWebhook;

var url = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/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';
var wh = new IncomingWebhook(url, {username: "ray", iconEmoji: ":robot_face:"});

// test area

// create 'data' dir if doesn't exist
// mkdirp("data", function(err) {
// 	// fs.writeFileSync(tokenDir, "", function (err, fd) {
// 	// 	if (err) {
// 	// 		return console.log(err);
// 	// 	}
// 	// 	return console.log("Please enter your bot token into data/token.txt");
// 	// });
//
// 	fs.openSync(tokenDir, "w");
// 	fs.closeSync(fs.openSync(tokenDir, "w"));
// });

// read token from local file
var tokenDir = "data/token.txt";
var token = process.env.SLACK_API_TOKEN || fs.readFileSync(tokenDir, "utf8").replace(/\n/g, "");

var rtm = new RtmClient(token, {
	logLevel: "info",
	dataStore: new MemoryDataStore()
});

	var inputArr = [];
	var cmdChar = "!";

	var cmdArr = [
		{name: cmdChar+"list", paras: "", desc: "Displays this list of commands that I am able to execute."},  // list
		{name: cmdChar+"calc", paras: "+ calculation (ex. '1 + 2 * 3')", desc: "I will evaluate the given calculation for you."},  // calc
		{name: cmdChar+"rps", paras: "+ object of choice ('rock', 'paper', 'scissors') OR 'score'", desc: "Play 'Rock, Paper, Scissors' with me! Using 'score' as a parameter will display your scoreboard with me. (English and German available)"},
		{name: cmdChar+"rnd", paras: "+ num (+ num) OR list of items (seperated by ',')", desc: "Will output either a random number between the lowest and highest given number (or between 0 and the given number if only one is given) or output any item of the given list."}
	];

	var cmdAttArr = {
		attachments: [
			{
				fallback: "fallback text",

				title: "List of commands I can execute:",
				color: "#7b241c",
			}
		]
	};

	var keyWordsArr = {
		maxLength: 0,
		list: ["list", "help", "commands", "befehle", "hilfe"],
		hello: ["hello", "hi", "hey", "ey"],
		calc: ["calculate", "evaluate", "solve", "berechne", "ausrechnen", "rechne"],
		date: ["date", "today", "day"],
		time: ["time", "clock"],
		rnd: ["random", "between", "zwischen"]
	};
	for (var count in keyWordsArr) {  // set max length for key words
		if (keyWordsArr[count].length > keyWordsArr.maxLength) {
			keyWordsArr.maxLength = keyWordsArr[count].length;
		}
	}


	var keyWordsExtArr = {
		question: {question: ["who","how","do","are"]},
		persons: {
			sg: ["ich","du","er","sie","es"],
			pl: ["wir","ihr","sie"]
		},
		verb:{
			sein: ["bin","bist","ist", "sind","seid","sind"],  // be
			haben: ["habe","hast","hat", "haben","habt","haben"],  // have
			gehen: ["gehe","gehst","geht", "gehen","geht","gehen"],  // like
			essen: ["esse","isst","isst", "essen","esst","essen"]  // eat
		}
	};

	// read / write from rps scoreboard file
	var rpsDir = "data/rps_scoreboard.txt";
	fs.readFile(rpsDir, function (err, data) {
		if (err) {
			fs.open(rpsDir, "w", function (err, fd) {
				if (err) {
					return console.log(err);
				}
			});
		}
		rpsScoreArr = data.toString().split("\n");
	});


function isNum(info) {
	if (info == Number(info)) {
		return true;
	} else {
		return false;
	}
};


function curDate(frmt) {  // get date and/or time with format
	return datetime.create().format(frmt);
};


function cmdList() {
	// 	var output = "Every command has to be started with '" + cmdChar + "'.\n";
	// for (var count = 0; count < cmdArr.length; count++) {
	// 	var output = output + "'" + cmdArr[count].name + "'" + cmdArr[count].desc + "\n";
	// }

	for (var count = 0; count < cmdArr.length; count++) {
		cmdAttArr.attachments[count + 1] = {color: "#21618c", fields: []};
		cmdAttArr.attachments[count + 1].fields[0] = {value: ""};
		cmdAttArr.attachments[count + 1].fields[1] = {title: cmdArr[count].name, short: true};
		cmdAttArr.attachments[count + 1].fields[2] = {title: cmdArr[count].paras, short: true};
		cmdAttArr.attachments[count + 1].fields[3] = {value: cmdArr[count].desc};
		cmdAttArr.attachments[count + 1].fields[4] = {value: ""};

		// cmdAttArr.attachments[count + 1] = {fields: [{title: cmdArr[count].name + "     " + cmdArr[count].paras, value: cmdArr[count].desc, short: true}], color: "#21618c"};
	}

	wh.send(cmdAttArr);
};


function sepStr(info, xtrSep) {
	if (xtrSep != null) {
		var xtrSepActive = true;
	} else {
		var xtrSepActive = false;
		var xtrSep = null;
	}

		var info = info.replace(/ /g, "");
			// console.log(info);
		var numArr = []; var charArr = [];
		// var posStart = {num: 0, char: 0}; var posEnd = {num: 0, char: 0};
		var numPos = {start: 0, end: 0}; var charPos = {start: 0, end: 0};
	for (var count = 0; count < info.length; count++) {
			var curChar = info[count];
				// console.log(count + ": " + curChar);

			if (isNum(curChar) && !isNum(info.substring(numPos.start, count + 1))) {  // check num (only curChar)
				numPos.start = count;
			}

		if (isNum(info.substring(numPos.start, count + 1))) {  // check num
					// console.log(count + ": " + info.substring(numPos.start, count + 1) + " IS num - N: start: " + numPos.start + "  end: " + numPos.end);
				if (count == info.length - 1) {  // last run
					numArr.push(parseFloat(info.substring(numPos.start, count + 1)));
				}
			numPos.end = count + 1;

		} else if (!isNum(curChar) && numPos.start < numPos.end || curChar.search(xtrSep) != -1 && numPos.start < numPos.end) {  // save num
			numArr.push(parseFloat(info.substring(numPos.start, numPos.end)));
				// console.log(count + ": SAVE num - " + numArr[numArr.length - 1] + " - N: start: " + numPos.start + "  end: " + numPos.end);
			numPos.start = count + 1;
			numPos.end = 0;
			charPos.start = count;

		}

		if (curChar != "." && !isNum(curChar) && curChar.search(xtrSep) == -1) {  // check string
					// console.log(count + ": " + info.substring(charPos.start, count + 1) + " IS string - S: start: " + charPos.start + "  end: " + charPos.end);
				if (count == info.length - 1) {  // last run
					charArr.push(info.substring(charPos.start, count + 1));
				}
			charPos.end = count + 1;

		} else if (isNum(curChar) && charPos.start < charPos.end || curChar.search(xtrSep) != -1 && charPos.start < charPos.end) {  // save string
			charArr.push(info.substring(charPos.start, charPos.end));
				// console.log(count + ": SAVE string - " + charArr[charArr.length - 1] + " - S: start: " + charPos.start + "  end: " + charPos.end);
			charPos.start = count + 1;
			charPos.end = 0;
			numPos.start = count;

		}
	}

		return {num: numArr, char: charArr};
};


function cmdCalc(info, numArr, opArr) {
	// var info = info.replace(/ /g, "");
	if (!numArr && !opArr) {
		var tmpArr = sepStr(info);
		var numArr = tmpArr.num;
		var opArr = tmpArr.char;
	}
	var ops = /([+\-*x/:^])/g;
	// 	console.log(numArr);
	// 	console.log(opArr);

	for (var count = numArr.length - 1; count >= 0; count--) {  // remove all NaN or empty elements from numArr
		if (isNaN(numArr[count]) || numArr[count] == "") {
			numArr.splice(count, 1);
		}
	}

	for (var count = opArr.length - 1; count >= 0; count--) {  // remove all empty elements from opArr
		if (opArr[count] == "") {
			opArr.splice(count, 1);
		}
	}

		var prnthAt = {start: 0, end: 0};
	if (opArr[0].replace(/\(/g, "") == "") {
		prnthAt.start = opArr[0].length;
	}
	if (opArr[opArr.length - 1].replace(/\)/g, "") == "") {
		prnthAt.end = opArr[opArr.length - 1].length;
	}

		var opArr = opArr.filter(function (x) {
			return x.search(ops) > -1;
		})
			// console.log(tmpArr);
	if (parseInt(numArr.length - 1) != parseInt(opArr.length)) {  // check if calculation is possible
		return ["I can't give you an answer. :confused:\nSomething about your calculation doesn't seem right... :thinking_face:", "ERROR", "ERROR"];
	}

		var res = 0; var op = ""; replNum = 0;
		var lvl2ops = /[*x/:^]/; var skip = false;
		var prnthPos = -2; var returnTmpArr = [];
		var numTmpArr = []; var opTmpArr = [];
		var prnthLoop = true;
		var securityCounter = 0; var securityMax = 25;

	for (var count = 0; count < opArr.length; count++) {  // create output calculation
		if (count == 0 && prnthAt.start > 0) {
			for (var countTmp = 0; countTmp < prnthAt.start; countTmp++) {
				var op = op + "(";
			}
		}
		if (count == 0) {
			var op = op + " " + numArr[count];
		}

		for (var countAssign = count + 1; countAssign < numArr.length; countAssign++) {  // assign curNum
			if (numArr[countAssign] != "" && isNum(numArr[countAssign])) {
				var curNum = parseFloat(numArr[countAssign]);
				var countCurNum = countAssign;
					break;
			}
		}
		var op = op + " " + opArr[count] + " " + curNum;
	}
		var op = op.replace(/\s/g, "").split("").join(" ");
		var tmp = sepStr(op).num;
		for (var countSpc = 0; countSpc < tmp.length; countSpc++) {
			var op = op.replace(tmp[countSpc].toString().split("").join(" "), tmp[countSpc]);
		}

	for (var count = 0; count < prnthAt.end; count++) {
		var op = op + ")";
	}

	while (prnthLoop == true) {  // process parentheses
		for (var countOp = 0; countOp <= opArr.length; countOp++) {

			if (countOp < opArr.length) {

			var curOp = opArr[countOp];

			if (countOp == 0 && prnthAt.start > 0) {
				var prnthPos = -1;
					// console.log("FOUND 1 (start): " + countOp)
			}

			}

			if (curOp.search(/[)]/g) != -1 && prnthPos != -2 || countOp == opArr.length && prnthAt.end > 0 && prnthPos != -2) {  // check for ')'
					if (countOp == opArr.length && prnthAt.end > 0) {
						var xtr = 0;
					} else {
						var xtr = 0;
					}
						// console.log("FOUND 2: " + countOp);
					if (prnthPos > -1) {
							// console.log("TEST " + prnthPos);
						opArr[prnthPos] = opArr[prnthPos].replace("(", "");
					} else if (prnthPos == -1) {
						opArr[0] = opArr[0].replace("(", "");
					}

					var numTmpArr = []; var opTmpArr = [];
				for (var countPrnth = prnthPos + 1; countPrnth <= countOp + xtr; countPrnth++) {
					numTmpArr.push(numArr[countPrnth]);
					numArr.splice(countPrnth, 1, "");
					if (countPrnth < countOp + xtr) {
						opTmpArr.push(opArr[countPrnth]);
						opArr.splice(countPrnth, 1, "");
					} else {
								// console.log(opArr[countPrnth]);
							if (prnthAt.end == 0 || countOp + xtr < opArr.length) {
								opArr[countPrnth] = opArr[countPrnth].replace(")", "");
							} else if (prnthAt.end > 0 && countOp == opArr.length) {
								opArr[opArr.length - 1] = opArr[opArr.length - 1].replace(")", "");
								prnthAt.end--;
							}
						if (prnthPos == -1) {
							prnthAt.start--;
						}
					}
				}

					// console.log("count: " + countOp);
					// console.log(numTmpArr);
					// console.log(opTmpArr);

				// numArr[prnthPos + 1] = cmdCalc("", numTmpArr, opTmpArr)[1];
				numArr.splice(prnthPos + 1, 1, cmdCalc("", numTmpArr, opTmpArr)[1]);
					var prnthPos = -2;

					// console.log("state num: " + numArr);
					// console.log(opArr);

			}

			if (curOp.search(/[(]/g) != -1 /* && prnthPos != -1*/) {  // check for '('
				var prnthPos = countOp;
					// console.log("FOUND 1: " + countOp);
			}

		}

		var prnthLoop = !opArr.map(function (a) {  // check for parentheses
			return a.search(/[()]/g);
		}).every(function (b) {
			return b == -1;
		});
		if (prnthAt.start > 0 || prnthAt.end > 0) { var prnthLoop = true; }

		// if (prnthLoop && countOp == opArr.length - 1) {
		// 	var count = -1;
			securityCounter++;
		// }
		if (securityCounter == securityMax) {
			return ["An Error Occurred (endless loop)", "ERROR", "ERROR"]
		}

		// console.log(opArr);
	}

	for (var countOpLvl = 0; countOpLvl < 2; countOpLvl++) {
		for (var count = 0; count < opArr.length; count++) {

			var curOp = opArr[count];
				if (curOp != "") {

			for (var countAssign = count + 1; countAssign < numArr.length; countAssign++) {  // assign curNum
				if (numArr[countAssign] != "" && isNum(numArr[countAssign])) {
					var curNum = parseFloat(numArr[countAssign]);
					var countCurNum = countAssign;
						break;
				}
			}
			for (var countAssign = count; countAssign >= 0; countAssign--) {  // assign prevNum
				if (numArr[countAssign] != "" && isNum(numArr[countAssign])) {
					var prevNum = parseFloat(numArr[countAssign]);
					var countPrevNum = countAssign;
						break;
				}
			}

				if (countOpLvl == 0 && curOp.search(lvl2ops) == -1) {
						var skip = true;
				} else if (countOpLvl == 1 && curOp.search(lvl2ops) != -1) {
						var skip = true;
				}

			if (skip == false) {
				switch (curOp) {  // check calculation methods
					case "+":
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
						numArr.splice(countPrevNum, 1, parseFloat(prevNum / curNum));
							break;
					case "^":
						numArr.splice(countPrevNum, 1, parseFloat(Math.pow(prevNum, curNum)));
							break;
					default:
						return ["I can't give you an answer. :confused:\n\"" + curOp + "\" is not a valid calculation operation! :confounded:", "ERROR", "ERROR"];
				}
					numArr.splice(countCurNum, 1, "");
			} else if (skip == true) {
				var skip = false;
			}
				}
					// console.log("normal: " + numArr);

		}
	}

	var op = op + " =";
	for (var count = 0; count < numArr.length; count++) {
		if (!isNaN(numArr[count]) && numArr[count] != "") {
			var res = numArr[count];
				break;
		}
	}

	return ["`" + op + "` " + "*" + res + "*", res, op];

};


function cmdRps(input, lang) {
		var checkTmp = 0;
	for (var count = 0; count < rpsScoreArr.length; count++) {
		if (rpsScoreArr[count].search(roomID) != -1) {
			var rpsScoreTmpArr = [
				parseInt(rpsScoreArr[count].substring(rpsScoreArr[count].search(":") + 1, rpsScoreArr[count].search(","))),
				parseInt(rpsScoreArr[count].substring(rpsScoreArr[count].search(",") + 1, rpsScoreArr[count].length))
			];
			console.log(rpsScoreTmpArr);
				break;
		}
	}
		if (!rpsScoreTmpArr) {
			var newScore = true;
			var rpsScoreTmpArr = [0,0];
		}

	var input = input.replace(" ", "").toLowerCase();

		if (input == "score") {  // display score
			winForm = [];

			var winForm = rpsScoreTmpArr.map(function (x) {
				if (parseInt(x) == 1) {
					return " win!";
				} else {
					return " wins!";
				}
			});

			return "SCORE: (" + user.name + " and " + bot.name + ")\n" + user.name + ": " + rpsScoreTmpArr[0] + winForm[0] + "\n" + bot.name + ": " + rpsScoreTmpArr[1] + winForm[1];
		}

	var objArr = {
		en: {
			dic: ["rock","scissors","paper"],
			rock: "scissors", scissors: "paper", paper: "rock",
			action: {rock: "ROCK crushes SCISSORS", scissors: "SCISSORS cut PAPER", paper: "PAPER encloses ROCK"},
			win: " wins!",
			tie: user.name + " and " + bot.name + " both used " + input.toUpperCase() + ".\n*Stalemate!*",
			use: " uses "
		},
		de: {
			dic: ["stein","schere","papier"],
			stein: "schere", schere: "papier", papier: "stein",
			action: {stein: "STEIN zerschmettert SCHERE", schere: "SCHERE schneidet PAPIER", papier: "PAPIER umschließt STEIN"},
			win: " gewinnt!",
			tie: user.name + " und " + bot.name + " haben beide " + input.toUpperCase() + " verwendet.\n*Unentschieden!*",
			use: " verwendet "
		}
	};

	// determine language
	if (!lang) {
			var checkTmp = 0;
		for (var count = 0; count < 3; count++) {
			if (input == objArr.en.dic[count]) {
				var lang = "en";
					break;
			} else if (input == objArr.de.dic[count]) {
				var lang = "de";
					break;
			} else {
				checkTmp++;
			}
		}
			if (checkTmp == 3) {
				return "\"" + input + "\" is not a valid game object!\nUse \"Rock\", \"Paper\", or \"Scissors\" (or their german equivalent).";
			}
	}

	var botInput = objArr[lang].dic[Math.round(Math.random() * 2)];

	if (objArr[lang][input] == botInput) {
		// player wins
		rpsScoreTmpArr[0]++;
		var winnerArr = {name: user.name, obj: input};
	} else if (objArr[lang][botInput] == input) {
		// bot wins
		rpsScoreTmpArr[1]++;
		var winnerArr = {name: bot.name, obj: botInput};
	} else if (input == botInput) {
		// stalemate
		return objArr[lang].tie;
	}

	if (newScore == true) {
		rpsScoreArr.push(roomID + ":" + rpsScoreTmpArr[0] + "," + rpsScoreTmpArr[1]);
	} else {
		for (var count = 0; count < rpsScoreArr.length; count++) {
			if (rpsScoreArr[count].search(roomID) != -1) {
				rpsScoreArr[count] = roomID + ":" + rpsScoreTmpArr[0] + "," + rpsScoreTmpArr[1];
			}
		}
	}

	fs.writeFile(rpsDir, rpsScoreArr.join("\n"));

	return user.name + objArr[lang].use + input.toUpperCase() + "\n" + bot.name + objArr[lang].use + botInput.toUpperCase() + "\n" + objArr[lang].action[winnerArr.obj] + "\n*" + winnerArr.name + objArr[lang].win + "*";

};


function cmdRnd(info) {

	var numArr = sepStr(info).num; var itemArr = sepStr(info, ",").char;
	var numArr = numArr.sort(function(a,b) {return a-b});
	var chnce = 0;
		// console.log(numArr);
		// console.log(itemArr);

	if (numArr.length == 0) {
		// choose from list of items
			var chnce = sprintf("%.2f", parseFloat(1 / itemArr.length));
			var chnce = parseInt(chnce.substring(chnce.search(".") + 2, chnce.length));
		return " (" + chnce + "% chance)\n" + cmdRndOut(0, 0, itemArr);

	} else if (numArr.length == 1) {
		// random from 0 to num
			var chnce = sprintf("%.2f", parseFloat(1 / (numArr[0] + 1)));
			var chnce = parseInt(chnce.substring(chnce.search(".") + 2, chnce.length));
		return " (" + chnce + "% chance)\n" + cmdRndOut(0, numArr[0], "none");

	} else if (numArr.length >= 2) {
		// random from lowest num to largest num
			var chnce = sprintf("%.2f", parseFloat(1 / (numArr[numArr.length - 1] - numArr[0] + 1)));
			var chnce = parseInt(chnce.substring(chnce.search(".") + 2, chnce.length));
		return " (" + chnce + "% chance)\n" + cmdRndOut(numArr[0], numArr[numArr.length - 1], "none");
	}
};

function cmdRndOut(min, max, itemArr) {
	if (itemArr != "none") {
			var tmp = Math.floor(Math.random() * (itemArr.length));
		return "*" + itemArr[tmp] + "*";

	} else {
		return "*" + parseInt(Math.floor(Math.random() * max) + min).toString() + "*";

	}
};


function nlp(inputTmpArr) {
	var nlpArr = [];
	var respArr = {
		persons: {
			sg: ["du","ich","er","sie","es"],
			pl: ["ihr","wir","sie"]
		},
		verb: {
			sein: ["bist","bin","ist", "seid","sind","sind"],  // sein
			haben: ["hast","habe","hat", "habt","haben","haben"],  // haben
			gehen: ["gehst","gehe","geht", "geht","gehen","gehen"],  // gehen
			essen: ["isst","esse","isst", "esst","essen","essen"]  // essen
		}
	};
	var resArr = [];
	var foundWord = false;

	for (var count = 0; count < inputTmpArr.length; count++) {
		var inputTmp = inputTmpArr[count].replace(/[,.!?;]/g, "").toLowerCase();

		for (g0 in keyWordsExtArr) {
		for (g1 in keyWordsExtArr[g0]) {
			for (word in keyWordsExtArr[g0][g1]) {

				if (keyWordsExtArr[g0][g1][word] == inputTmp) {
					nlpArr.push([g0,g1,keyWordsExtArr[g0][g1][word]]);
					resArr.push(respArr[g0][g1][word]);
					var foundWord = true;
						break;
				}

			}
		}
		}

		if (foundWord == true) {
			foundWord = false;
		} else if (foundWord == false) {
			resArr.push(inputTmp);
		}

	}
		// console.log(nlpArr);
		// console.log(resArr);
		return resArr.join().replace(/,/g, " ");
};



rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {  // receive message
		console.log('Message:', message);
	user = rtm.dataStore.getUserById(message.user);
	bot = rtm.dataStore.getUserById(rtm.activeUserId);
	roomID = message.channel;


	inputArr.push(message.text);
	var lastInput = inputArr[inputArr.length - 1];

	if (lastInput.search(cmdChar) == -1) {  // if no cmd char is found

		var inputLastArr = lastInput.split(" ");

			var infoTmp = "";
			var calcTmp = false;
			var checkTmp = 0;
			var rndTmp = false;
			var rndInfo = "";
		for (var count = 0; count < inputLastArr.length; count++) {  // check inputs
			// if (inputArr[inputArr.length - 1][count].search(/[.,!?;]/g) != -1) {
				// calcTmp = false;  // stop
			// }
			var inputTmp = inputLastArr[count].toLowerCase();

			for (var countKeys = 0; countKeys < keyWordsArr.maxLength; countKeys++) {  // compare with key words

				if (inputTmp.replace(/[,.!?;]/g, "") == keyWordsArr.hello[countKeys]) {  // hello
					rtm.sendMessage("Hello, " + user.name + "!\nMy name is " + bot.name + "!\n", roomID);

				} else if (inputTmp.replace(/[,.!?;]/g, "") == keyWordsArr.list[countKeys]) {  // list
					cmdList();

				} else if (calcTmp || inputTmp.replace(/[,.!?;]/g, "") == keyWordsArr.calc[countKeys]) {  // calculate
					var calcTmp = true;
					var infoTmp = infoTmp + inputTmp.replace(/[a-zA-Z]/g, "");
						break;

				} else if (inputTmp.replace(/[,.!?;]/g, "") == keyWordsArr.date[countKeys]) {  // date
						var numExt = "";
					if (parseInt(curDate("d")[curDate("d").length - 1]) === 1 && parseInt(curDate("d")) != 11) {  // 1st
						var numExt = "st";
					} else if (parseInt(curDate("d")[curDate("d").length - 1]) === 2 && parseInt(curDate("d")) != 12) {  // 2nd
						var numExt = "nd";
					} else if (parseInt(curDate("d")[curDate("d").length - 1]) === 3 && parseInt(curDate("d")) != 13) {  // 3rd
						var numExt = "rd";
					} else {  // 0th
						numExt = "th";
					}
					rtm.sendMessage("Today is a " + curDate("W") + " and it's the " + curDate("d").replace(/0/g, "") + numExt + " of " + curDate("f, Y") + ".\n" + curDate("W, d.m.Y"), roomID);

				} else if (inputTmp.replace(/[,.!?;]/g, "") == keyWordsArr.time[countKeys]) {  // time
					rtm.sendMessage("It's " + curDate("H:M:S"), roomID);

				} else if (rndTmp || inputTmp == keyWordsArr.rnd[countKeys]) {  // random
					var rndTmp = true;
					var rndInfo = rndInfo + " " + inputTmp;
						break;

				} else if (inputTmp == "test") {  // test
					// test stuff goes here
					rtm.sendMessage("* test *", roomID);
						break;

				} else {  // nlp
					var checkTmp = checkTmp + 1;
				}

			}
		}
			if (checkTmp == (inputLastArr.length) * (keyWordsArr.maxLength)) {  // nlp
				rtm.sendMessage(nlp(inputLastArr), roomID);
			}

			if (calcTmp == true) {  // calculate
				var calcTmp = false;
				rtm.sendMessage(cmdCalc(infoTmp)[0], roomID);
			}

			if (rndTmp == true) {  // random
				var rndTmp = false;
				rtm.sendMessage("Random Output: " + cmdRnd(rndInfo.substring(7, rndInfo.length)), roomID);
			}

	} else {
		// if cmd char is found

		if (lastInput.search(cmdArr[0].name) != -1) {  // list
			cmdList();
		}

		if (lastInput.search(cmdArr[1].name) != -1) {  // calculator
			rtm.sendMessage(cmdCalc(lastInput.substring(lastInput.search(cmdArr[1].name) + cmdArr[1].name.length, lastInput.length))[0], roomID);
		}

		if (lastInput.search(cmdArr[2].name) != -1) {  // rock paper scissors
			rtm.sendMessage(cmdRps(lastInput.substring(lastInput.search(cmdArr[2].name) + cmdArr[2].name.length, lastInput.length)), roomID);
		}

		if (lastInput.search(cmdArr[3].name) != -1) {  // random
			rtm.sendMessage("Random Output: " + cmdRnd(lastInput.substring(lastInput.search(cmdArr[3].name) + cmdArr[3].name.length, lastInput.length)), roomID);
		}
	}
});

rtm.on(RTM_EVENTS.USER_TYPING, function userTyping(info) {
	// console.log(info);

// 	if (typeof roomID !== "undefined") {
// 		if (typeof typeTimeStarted === "undefined" || typeTimeStarted == false) {
//
// 				typeTimeStarted = true;
// 			var timePass = 5;
// 			var startTypeTime = [parseInt(curDate("M")), parseInt(curDate("S"))];
// 				console.log("initiated: " + startTypeTime);
// 			if (startTypeTime[1] + timePass > 59) {
// 				endTypeTime = [parseInt(curDate("M") + 1), (startTypeTime[1] + timePass) - 59, true];
// 			} else {
// 				endTypeTime = [parseInt(curDate("M")), startTypeTime[1] + timePass, false];
// 			}
// 				console.log(endTypeTime)
//
// 		} else {
// 				var curTime = [parseInt(curDate("M")), parseInt(curDate("S"))];
// 				console.log("checking: " + curTime);
// 			if (endTypeTime[2] == true && curTime[0] >= endTypeTime[0] && curTime[1] >= endTypeTime[1]) {  // next minute
// 					typeTimeStarted = false;
// 				rtm.sendMessage("TEST", roomID);
// 			} else if (endTypeTime[2] == false && curTime[1] >= endTypeTime[1]) {
// 					typeTimeStarted = false;
// 				rtm.sendMessage("TEST", roomID);
// 			}
// 		}
// 	}
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
