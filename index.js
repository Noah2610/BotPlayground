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
var wh = new IncomingWebhook(url, {username: "ray"});

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

	// var roomID = "D2CDJJQ66";
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
		maxLength: 5,
		list: ["list", "help", "commands", "befehle", "hilfe"],
		hello: ["hello", "hi", "hey", "ey"],
		calc: ["calculate", "evaluate", "solve", "berechne", "ausrechnen"],
		date: ["date", "today", "day"],
		time: ["time", "clock"],
		rnd: ["random", "between", "zwischen"]
	};

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
	}

		var info = info.replace(/ /g, "");
		var numArr = []; var charArr = [];
		var posStart = {num: 0, char: 0}; var posEnd = {num: 0, char: 0};
	for (var count = 0; count < info.length; count++) {
			var curChar = info[count];
		if (xtrSepActive == true && curChar.search(xtrSep) != -1) {
			if (!isNaN(info.substring(posStart.num, posEnd.num + 1))) {
				numArr.push(parseFloat(info.substring(posStart.num, posEnd.num + 1)));
			}
			charArr.push(info.substring(posStart.char, posEnd.char + 1));
				posStart.num = count + 1;
				posEnd.num = count + 1;
				posStart.char = count + 1;
				posEnd.char = count + 1;

		} else if (isNaN(curChar) && count + 1 !== info.length) {  // if is char
			if (!isNaN(info.substring(posStart.num, posEnd.num + 1))) {
				numArr.push(parseFloat(info.substring(posStart.num, posEnd.num + 1)));
					// posStart.char = count;
			}
				posStart.num = count + 1;
				posEnd.num = count + 1;
				posEnd.char = count;

		} else if (count + 1 === info.length) {  // last for run
			if (!isNaN(info.substring(posStart.num, posEnd.num + 2))) {
				numArr.push(parseFloat(info.substring(posStart.num, posEnd.num + 2)));
				// charArr.push(info.substring(posStart.char, posEnd.char + 1));
			} else if (isNaN(info.substring(posStart.num, posEnd.num + 2))) {
				charArr.push(info.substring(posStart.char, posEnd.char + 2));
				// numArr.push(parseFloat(info.substring(posStart.num, posEnd.num + 1)));
			} else {
				// numArr.push(parseFloat(info.substring(posStart.num, posEnd.num + 1)));
				charArr.push(info.substring(posStart.char, posEnd.char + 1));
			}

		} else {  // if is num
			if (isNaN(info.substring(posStart.char, posEnd.char + 1))) {
				charArr.push(info.substring(posStart.char, posEnd.char + 1));
			}
				posEnd.num = count;
				posStart.char = count + 1;
				posEnd.char = count + 1;
		}
	}

		return {num: numArr, char: charArr};
};


function cmdCalc(info) {
	// var info = info.replace(/ /g, "");
	var numArr = sepStr(info).num;
	var opArr = sepStr(info).char;
		console.log(numArr);

	for (var count = 0; count < numArr.length; count++) {  // remove all NaN from numArr
		if (isNaN(numArr[count])) {
			numArr.splice(count, 1);
		}
	}

		console.log(numArr);
		console.log(opArr);
	if (parseInt(numArr.length - 1) != parseInt(opArr.length)) {
		return "I can't give you an answer. :confused:\nSomething about your calculation doesn't seem right... :thinking_face:";
	}

		var res = 0; var op = ""; replNum = 0;
		var lvl2ops = /[*x/:]/; var skip = false;

	for (var countOpLvl = 0; countOpLvl < 2; countOpLvl++) {
		for (var count = 0; count < opArr.length; count++) {

			var curOp = opArr[count];
			if (op == "") {
				var op = numArr[count];
			}

			for (var countAssign = count + 1; countAssign < numArr.length; countAssign++) {  // assign curNum
				if (numArr[countAssign] != "") {
					var curNum = parseFloat(numArr[countAssign]);
					var countCurNum = countAssign;
						break;
				}
			}
			for (var countAssign = count; countAssign >= 0; countAssign--) {  // assign prevNum
				if (numArr[countAssign] != "") {
					var prevNum = parseFloat(numArr[countAssign]);
					var countPrevNum = countAssign;
						break;
				}
			}

				if (countOpLvl == 0 && curOp.search(lvl2ops) == -1) {
						skip = true;
				} else if (countOpLvl == 1 && curOp.search(lvl2ops) != -1) {
						skip = true;
				}

				if (countOpLvl == 0) {
					var op = op + " " + curOp + " " + curNum;
				}

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
						numArr.splice(countPrevNum, 1, parseFloat(prevNum / curNum));
							break;
					default:
						return "I can't give you an answer. :confused:\n\"" + curOp + "\" is not a valid calculation operation! :confounded:";
				}
					numArr.splice(countCurNum, 1, "");
			} else if (skip == true) {
				var skip = false;
			}

		}
	}

	op = op + " = ";
	for (var count = 0; count < numArr.length; count++) {
		if (!isNaN(numArr[count]) && numArr[count] != "") {
			var res = numArr[count];
				break;
		}
	}

	return op + res;

};


function cmdRps(input, lang) {
		var checkTmp = 0;
	for (var count = 0; count < rpsScoreArr.length; count++) {
		if (rpsScoreArr[count].search(roomID) != -1) {
			var rpsScoreTmpArr = [
				rpsScoreArr[count].substring(rpsScoreArr[count].search(":") + 1, rpsScoreArr[count].search(",")),
				rpsScoreArr[count].substring(rpsScoreArr[count].search(",") + 1, rpsScoreArr[count].length)
			];
			rpsScoreArr.splice(count,1);
		}
	}
		if (!rpsScoreTmpArr) {
			var rpsScoreTmpArr = ["0","0"];
		}

	var input = input.replace(" ", "").toLowerCase();

		if (input == "score") {
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
			tie: user.name + " and " + bot.name + " both used " + input.toUpperCase() + ".\nStalemate!",
			use: " uses "
		},
		de: {
			dic: ["stein","schere","papier"],
			stein: "schere", schere: "papier", papier: "stein",
			action: {stein: "STEIN zerschmettert SCHERE", schere: "SCHERE schneidet PAPIER", papier: "PAPIER umschließt STEIN"},
			win: " gewinnt!",
			tie: user.name + " und " + bot.name + " haben beide " + input.toUpperCase() + " verwendet.\nUnentschieden!",
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

	rpsScoreArr.push(roomID + ":" + rpsScoreTmpArr[0] + "," + rpsScoreTmpArr[1]);

	fs.writeFile(rpsDir, rpsScoreArr.join("\n"));

	return user.name + objArr[lang].use + input.toUpperCase() + "\n" + bot.name + objArr[lang].use + botInput.toUpperCase() + "\n" + objArr[lang].action[winnerArr.obj] + "\n" + winnerArr.name + objArr[lang].win;

};


function cmdRnd(info) {

	var numArr = sepStr(info).num; var itemArr = sepStr(info, ",").char;
	var numArr = numArr.sort(function(a,b) {return a-b});
	var chnce = 0;
		console.log(numArr);
		console.log(itemArr);

	if (numArr.length == 0) {
		// choose from list of items
			var chnce = sprintf("%.2f", parseFloat(1 / itemArr.length));
			var chnce = parseInt(chnce.substring(chnce.search(".") + 2, chnce.length));
				console.log(chnce);
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
			var tmp = Math.round(Math.random() * itemArr.length - 1);
			console.log(tmp);
		return itemArr[tmp];

	} else {
		return parseInt(Math.round(min + Math.random() * (max - min))).toString();

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

		inputArr.push(lastInput.split(" "));

			var infoTmp = "";
			var calcTmp = false;
			var checkTmp = 0;
			var rndTmp = false;
			var rndInfo = "";
		for (var count = 0; count < inputArr[inputArr.length - 1].length; count++) {  // check inputs
			if (inputArr[inputArr.length - 1][count].search(/[.,!?;]/g) != -1) {
				// calcTmp = false;  // stop
			}
			var inputTmp = inputArr[inputArr.length - 1][count].toLowerCase();

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
						break;

				} else {  // nlp
					var checkTmp = checkTmp + 1;
				}

			}
		}
			if (checkTmp == (inputArr[inputArr.length - 1].length) * (keyWordsArr.maxLength)) {  // nlp
				rtm.sendMessage(nlp(inputArr[inputArr.length - 1]), roomID);
			}

			if (calcTmp == true) {
				var calcTmp = false;
				rtm.sendMessage(cmdCalc(infoTmp), roomID);
			}

			if (rndTmp == true) {
				var rndTmp = false;
				rtm.sendMessage("Random Output: " + cmdRnd(rndInfo.substring(7, rndInfo.length)), roomID);
			}

	} else {
		// if cmd char is found

		if (lastInput.search(cmdArr[0].name) != -1) {  // list
			cmdList();
		}

		if (lastInput.search(cmdArr[1].name) != -1) {  // calculator
			rtm.sendMessage(cmdCalc(lastInput.substring(lastInput.search(cmdArr[1].name) + cmdArr[1].name.length, lastInput.length)), roomID);
		}

		if (lastInput.search(cmdArr[2].name) != -1) {  // rock paper scissors
			rtm.sendMessage(cmdRps(lastInput.substring(lastInput.search(cmdArr[2].name) + cmdArr[2].name.length, lastInput.length)), roomID);
		}

		if (lastInput.search(cmdArr[3].name) != -1) {  // random
			rtm.sendMessage("Random Output: " + cmdRnd(lastInput.substring(lastInput.search(cmdArr[3].name) + cmdArr[3].name.length, lastInput.length)), roomID);
		}
	}
});

// rtm.on(RTM_EVENTS.USER_TYPING, function userTyping(info) {
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
// });

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
