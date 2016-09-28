/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */

var fs = require("fs");
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
	var cmdChar = "!";

	/* var cmdArr = [
		"list",
		"calc"
	];
	var cmdDescArr = [
		" - Displays this list of commands that I am able to execute.",  // list
		" + calculation (ex. '1 + 2 * 3') - I will evaluate the given calculation for you."  // calc
	]; */

	var cmdArr = [
		{name: "list", desc: " - Displays this list of commands that I am able to execute."},  // list
		{name: "calc", desc: " + calculation (ex. '1 + 2 * 3') - I will evaluate the given calculation for you."},  // calc
		{name: "rps", desc: " + object of choice ('rock'/'stein', 'paper'/'papier', 'scissors'/'schere') - Play 'Rock, Paper, Scissors' with me! Adding 'score' as a parameter will display your scoreboard with me. (English and German available)"},
	];

	var keyWordsArr = {
		maxLength: 5,
		hello:["hello", "hi", "hey", "ey"],
		calc:["calculate", "evaluate", "solve", "berechne", "ausrechnen"]
	};

	var keyWordsExtArr = {
		//person: {user: ["ich","mich"], bot: ["du","dich"]},
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

	var infoArr = [];

	// read / write from rps scoreboard file
	// var rpsScoreF = ("data/rps_scoreboard.txt");
	// if (rpsScoreF) {
	// 	console.log("TETS");
	// }
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

	// console.log(rpsScoreArr);




function curDate(frmt) {  // get date and/or time with format
	return datetime.create().format(frmt);
};

function cmdList() {
		var output = "Every command has to be started with '" + cmdChar + "'.\n";
	for (var count = 0; count < cmdArr.length; count++) {
		var output = output + "'" + cmdArr[count].name + "'" + cmdArr[count].desc + "\n";
	}
		rtm.sendMessage(output, roomID);
};

function cmdCalc(getInfo) {
		//var tmpArr = [ message.text.substr(message.text.search(cmdChar) + 1, message.text.search(" ") - 1) ]
		//inputArr.push(tmpArr.concat(message.text.substr(message.text.search(" ") + 1, message.text.length - 1).replace(/ /g, "").split("")));
			// i cant split every char like here, wont work for numbers.length > 1
	var info = getInfo.replace(/ /g, "");
		console.log(info);
	var numArr = [];
	var opArr = [];
	var prnth = [];


		var numStart = 0; var numEnd = 0;
	for (var count = 0; count < info.length; count++) {
			var curChar = info[count];
		if (curChar === "(" || curChar === ")") {  // add paranthesis if found
			// currently useless, will eventually implement parentheses feature (maybe)
			prnth.push(curChar);
		}
		if (isNaN(curChar) && curChar != "(" && curChar != ")") {
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

	for (var count = 0; count < numArr.length; count++) {  // remove all NaN from numArr
		if (isNaN(numArr[count])) {
			numArr.splice(count, 1);
		}
	}

	if (parseInt(numArr.length - 1) != parseInt(opArr.length)) {
		return "I can't give you an answer. :confused:\nSomething about your calculation doesn't seem right... :thinking_face:";
	}

	console.log(numArr,opArr);

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
						return "I can't give you an answer. :confused:\n\"" + curOp + "\" is not a valid calculation operation! :confounded:";
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
		for (var count = 0; count < 3; count++) {
			if (input == objArr.en.dic[count]) {
				var lang = "en";
			} else if (input == objArr.de.dic[count]) {
				var lang = "de";
			}
		}
	}

		var checkTmp = 0;
	for (var count = 0; count < objArr[lang].dic.length; count++) {
		if (input == objArr[lang].dic[count]) {
			break;
		} else {
			checkTmp++;
		}
	}
		if (checkTmp == objArr[lang].dic.length) {
			return "Invalid game object!";
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
		// return inputArr[inputArr.length - 1][0];

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
		console.log(nlpArr);
		console.log(resArr);
		return resArr.join().replace(/,/g, " ");
};



rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {  // receive message
		console.log('Message:', message);
	user = rtm.dataStore.getUserById(message.user);
	bot = rtm.dataStore.getUserById(rtm.activeUserId);

	inputArr.push(message.text);
	var lastInput = inputArr[inputArr.length - 1];

	if (lastInput.search(cmdChar) == -1) {  // if no cmd char is found

		inputArr.push(lastInput.split(" "));

			var infoTmp = "";
			var calcTmp = false;
			var checkTmp = 0;
		for (var count = 0; count < inputArr[inputArr.length - 1].length; count++) {  // check inputs
			if (inputArr[inputArr.length - 1][count].search(/[.,!?;]/g) != -1) {
				// calcTmp = false;  // stop
			}
			var inputTmp = inputArr[inputArr.length - 1][count].replace(/[,.!?;]/g, "").toLowerCase();

			for (var countKeys = 0; countKeys < keyWordsArr.maxLength; countKeys++) {  // compare with key words

				if (inputTmp == keyWordsArr.hello[countKeys]) {  // hello
					rtm.sendMessage("Hello, " + user.name + "!\nMy name is " + bot.name + "!\n", roomID);

				} else if (calcTmp || inputTmp == keyWordsArr.calc[countKeys]) {  // calculate
					var calcTmp = true;
					var infoTmp = infoTmp + inputTmp.replace(/[a-zA-Z]/g, "");
						break;

				} else {  // person
					var checkTmp = checkTmp + 1;
				}

			}
				console.log(count * countKeys);
		}
				console.log((inputArr[inputArr.length - 1].length) + " * " + (keyWordsArr.maxLength) + " " + (inputArr[inputArr.length - 1].length) * (keyWordsArr.maxLength) + " " + checkTmp);
			if (checkTmp == (inputArr[inputArr.length - 1].length) * (keyWordsArr.maxLength)) {
				rtm.sendMessage(nlp(inputArr[inputArr.length - 1]), roomID);
			}

			if (calcTmp == true) {
				var calcTmp = false;
				rtm.sendMessage(cmdCalc(infoTmp), roomID);
			}

	} else {
		// if cmd char is found
		/* if (lastInput.substr(lastInput.search(cmdChar) + 1, lastInput.search(cmdChar) + 4) == "calc") {
			rtm.sendMessage(cmdCalc(lastInput.substr(lastInput.search(cmdChar) + 5, lastInput.length)), roomID);
		} */

		if (lastInput.search(cmdArr[0].name) != -1) {  // list
			cmdList();

		} else if (lastInput.search(cmdArr[1].name) != -1) {  // calculator
			rtm.sendMessage(cmdCalc(lastInput.substring(lastInput.search(cmdArr[1].name) + cmdArr[1].name.length, lastInput.length)), roomID);

		} else if (lastInput.search(cmdArr[2].name) != -1) {  // rock paper scissors
			rtm.sendMessage(cmdRps(lastInput.substring(lastInput.search(cmdArr[2].name) + cmdArr[2].name.length, lastInput.length)), roomID);
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