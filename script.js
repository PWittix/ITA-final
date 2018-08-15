//jquery call to get the spreadsheet that is published.
//the url: https://spreadsheets.google.com/feeds/list/UNIQUE_KEY_OF_SPREADSHEET/od6/public/values?alt=json
//when the json loads, do the following function, which is passed an argument.
$.getJSON("https://spreadsheets.google.com/feeds/list/1Omn9eF5upJ48fO8yhcatGBGHCqtNwvEw-bdaSMplsiI/od6/public/values?alt=json", function(jsonObj){
//call ingest function, passing argument jsonObj (the spreadsheet as a json)
	ingest(jsonObj);	
});
//create jquery ui tabs
var tabs = $( "#tabs" ).tabs();


//declare an array called ingestJson
var ingestJson = [];

//function ingest with an argument: jsonObj
function ingest(jsonObj){
	//do the following while a counter, 
	//starting at 1 (one) less the length of an array decrements
	//until the counter reaches 0 (zero)
	//this is so that the most recent update is the first on the list.
	for (var n = jsonObj.feed.entry.length -1; n >= 0; n--){
		//declare object data
		var data = {};
		//the data from the json is layered.
		//we want to know about incident, update, date, timestamp, typeofevent
		//these are located in JSON_FILE.feed.entry[counter].gsx$[YOUR ITEM].$t
		//set data.name to titlecase (capatalize the first letter of each word {function is at bottom})
		data.name = titleCase(jsonObj.feed.entry[n].gsx$incident.$t);
		//set data.text, date, time, type to the json file's data for that index.
		data.text = jsonObj.feed.entry[n].gsx$update.$t;
		data.date = jsonObj.feed.entry[n].gsx$date.$t;
		data.time = jsonObj.feed.entry[n].gsx$timestamp.$t;
		data.type = jsonObj.feed.entry[n].gsx$typeofevent.$t;
		//push the data to the array.
		ingestJson.push(data);
	}
	//sort data
	var data = sort(ingestJson);
	//call compare function passing sorted ingestJson as argument
	compare(data);
}
//sort function using underscoreJS library to group data
//passed an argument
function sort(jsonObj){
//create an array grouped data
	var groupedData = [];
	//set grouped data contents _sorted by name. (used underscoreJS)
	groupedData = _.sortBy(jsonObj, 'name');
	//return the sorted data.
	return groupedData;
}
//initialize a counter for 
var counter = 0;
//initialize a DOM object as a new article
var updateField = document.createElement('article');

//function to compare data based on argument
function compare(data){
	//initialize the counter
	counter=0;
	//set variables to null.
	var updateText = null;
	var updateDate = null;
	var updateTime = null;
	var previousName = null;
	
	//populate tabs
	//for counter at 0, counter less than the length of the json, increment.
	for (var i=0; i<ingestJson.length; i++){
		//initialize a DOM object as a new paragraph
		var updateName = document.createElement('p');
			//compare current event name with previous event name
			//if the current name matches the previous name, 
			//(case does not matter because it is run through titleCase)
			//(spelling does matter), add current information to the document.
		if(data[i].name === previousName){
			updateText = data[i].text;
			updateDate = data[i].date;
			updateTime = data[i].time;
			updateName.textContent = updateDate + " " + updateTime + " " + updateText;
			updateField.appendChild(updateName);
			previousName = data[i].name;
			//add to the current tab
			
		}
		//if the counter is 0, it won't match previous because there is no previous.
		//create a new tab and add this data to the current tab's data.
		else if (i === 0){
			updateField.textContent = "";
			updateText = data[i].text;
			updateDate = data[i].date;
			updateTime = data[i].time;
			updateName.textContent = updateDate + " " + updateTime + " " + updateText;
			updateField.appendChild(updateName);
			previousName = data[i].name;
			counter++;
			//create new tab
			addTab(data[i].name);
		}
		//otherwise, the name is different (the data is sorted)
		//so make a new tab and start adding to the new tab :)
		else{
			//moving to new, push out old contents
			pushUpdate(updateField);
			updateField.textContent = "";
			updateText = data[i].text;
			updateDate = data[i].date;
			updateTime = data[i].time;
			updateName.textContent = updateDate + " " + updateTime + " " + updateText;
			updateField.appendChild(updateName);
			previousName = data[i].name;
			//console.log($("a[href='#tab-"+(counter)+"']")[0].innerHTML);
			counter++;
			//create new tab
			addTab(data[i].name);
			

		}	
		
		
		//because the data is outputted when the name moves to a new name,
		//the last index will match the previous name and will never be populated
		//because there is no new name after the end.
		//check if the counter is at the end of the array. 
		//if yes, push that last data
		if(i === ingestJson.length-1){
			//last output
			pushUpdate(updateField);
			console.log($("a[href='#tab-"+(counter)+"']"));
		}
	}
	//open the first tab by default
	tabs.tabs('option', 'active', 0);
	
}

//working
function pushUpdate(update){
	//output formatted data for the tab's data.
	$("<div id='tab-" + counter + "'><p>" + update.innerHTML + "</p></div>").appendTo(tabs);
	tabs.tabs("refresh");
}

//working
function addTab(title){
	//find the tab header
	var ul = tabs.find("ul");
	//create tab header based on name.
	$("<li><a href='#tab-" + counter + "'>" + title + "</a></li>").appendTo(ul);
	tabs.tabs("refresh");
}


//create vars for the interval check
var previous = null;
var current = null;


var currentTab;

function getCurrentTab(){
	//get user's current tab
	 //currentTab = tabs.tabs('option', 'active');
	//get the text element of user's current tab
	var currentTab = $('#tabs .ui-tabs-selected');
	
	console.log(currentTab);
	//console.log(selectedTabTitle);
	/*
	console.log(currentTab);
	console.log($("a[href='#tab-"+(currentTab)+"']"));
	*/
}

//working
setInterval(function() {
	//interval check: check the json file
$.getJSON("https://spreadsheets.google.com/feeds/list/1Omn9eF5upJ48fO8yhcatGBGHCqtNwvEw-bdaSMplsiI/od6/public/values?alt=json", function(json) {
//set data.
current = JSON.stringify(json);            
//check if previous and current exist, and if they do, if the previous is different from the current.
if (previous && current && previous !== current) {
	//if different, reset div
	document.getElementById("tabs").innerHTML = "<ul></ul>";
	//call getCurrentTab
	getCurrentTab();
	
	//destroy the tabs.
	tabs.tabs('destroy');
	//initialize tabs.
	tabs.tabs();
	//reset the json object array.
	ingestJson = [];
	//re-ingest the json file
	ingest(json);
	//check new array for the user's text
	for(var i=0; i<counter; i++){
		console.log(i);
	}
	
	//open the tab the user was previously on while pushing new data
	tabs.tabs("refresh").tabs("option", "active", currentTab);
 }
 //set the previous data to the now current data
  previous = current;
        });                       
		//frequency of checks (in milliseconds)
		//1000 = 1 second. 
    }, 5000);      
	


//function to create capital first letters for any string passed. 
//example: titlecase("that is a cute puppy")
//returns That Is A Cute Puppy
function titleCase(str) {
	//create a variable that holds the string argument,
	//convert all letters to lowercase,
	//split the string at a [space] character.
	//example: that is a cute puppy
	//becomes: [that, is, a, cute, puppy]
   var splitStr = str.toLowerCase().split(' ');
   //for loop to modify the split string, while a counter starting at zero
   //is less than the length of the split string, do the following:
   for (var i = 0; i < splitStr.length; i++) {
	   //capatalize the first letter, then append the rest of the split string.
	   //example from above:
	   //that --> [t] becomes [T].  [hat] is appened to [T] and becomes That.  
	   //repeat for the rest of the words.
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
	   //the counter is incremented by 1
   }
   //return the data, joined by a [space] character. 
   //example: [That, Is, A, Cute, Puppy]
   //becomes: That Is A Cute Puppy
   return splitStr.join(' '); 
}