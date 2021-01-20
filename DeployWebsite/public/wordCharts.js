const apiURL = "https://countrymusic.uc.r.appspot.com"

// Load the Visualization API and the corechart package.
const gChartsPromise = google.charts.load('current', { 'packages': ['corechart'] });

function directBackHome(msg) {
    alert(msg);
    window.location.replace('index.html');
}

let wordRankings;
let wordsOverTime;

let genreNameArray = [
    "blank",
    "indie",
    "country",
    "new americana",
    "banjo",
    "red dirt",
    "arkansas country",
    "alternative country",
    "deep new americana",
    "none",
    "canadian country",
    "country dawn",
    "classic country pop",
    "australian country",
    "alberta country",
    "country pop",
    "americana",
    "canadian contemporary country",
    "outlaw country",
    "country rap",
    "folk",
    "bluegrass",
    "texas country",
    "contemporary country",
    "country rock",
    "indie folk",
    "country road",
    "acoustic pop",
    "modern country rock",
    "all artists"
]

async function fetchWordRanks() {
    const numResults = document.getElementsByName('results')[0].value;
    const genreId = document.getElementsByName('genres')[0].value;

    fetch(`${apiURL}/rankWordsByUsage?numResults=${numResults}&genreId=${genreId}}`, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to get words.")
        }

        return response.json();
    }).then(function(json) {
        wordRankings = json.wordData;

        console.log(json.wordData);

        gChartsPromise.then(function() {
            drawRankWordByGenre();
        });


    }).catch(function(error) {
        console.log(error);
        directBackHome('An unknown error has ocurred :(')
    });
}

function drawRankWordByGenre() {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Word');
    data.addColumn('number', 'Number of words');


    for (let i = 0; i < wordRankings.length; i++) {
        const word = wordRankings[i];
        data.addRow([word.word, word.uses_over_time]);
    }

    const divWidth = document.getElementById("RankWordsByGenre").parentNode.offsetWidth;
    let divHeight = wordRankings.length * 30;
    var options = {
        width: "100%",
        height: divHeight,
        annotations: {
            textStyle: {
                fontSize: 8,
            }
        },
        backgroundColor: "#f7f7f7",
        chartArea: {
            height: "100%",
            width: "100%",
            top: 48,
            left: 70,
            right: 16,
            bottom: 48,
        },
        legend: { position: "none" },
        hAxis: {
            slantedText: true,
            textStyle: {
                fontSize: 12,
            },
        },
        vAxis: {
            textStyle: {
                fontSize: 12,
            },
        },
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.BarChart(document.getElementById('RankWordsByGenre'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawWordUsageOverTime() {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');

    let numWordsFound = 0;

    for (let i = 0; i < wordsOverTime.length; i++) {
        const word = wordsOverTime[i];
        if (!word.isBlank && word.found) {
            data.addColumn('number', `${word.word}: ${genreNameArray[word.genre_id]}`);
            numWordsFound++;
        }
    }

    if (numWordsFound < 1) {
        return;
    }

    const startYear = 2010;
    const endYear = 2020;

    for (let year = startYear; year <= endYear; year++) {
        const row = [`${year}`];

        const yearIndex = year - startYear + 1; // plus 1 because index 0 is overall average

        for (let i = 0; i < wordsOverTime.length; i++) {
            const word = wordsOverTime[i];
            if (!word.isBlank && word.found) {
                row.push(word.uses_over_time[yearIndex]);
            }
        }

        data.addRow(row);
    }

    const divWidth = document.getElementById("GraphWordUsageOverTime").parentNode.offsetWidth;
    let divHeight = divWidth * (2 / 5);
    if (divHeight < 300) {
        divHeight = 300;
    }
    var options = {
        width: "100%",
        height: divHeight,
        annotations: {
            textStyle: {
                fontSize: 8,
            }
        },
        backgroundColor: "#f7f7f7",
        chartArea: {
            height: "100%",
            width: "70%",
            top: 48,
            left: 70,
            bottom: 48,
        },
        legend: {
            position: 'right',
        },
        vAxis: {
            minValue: 0,
        },
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('GraphWordUsageOverTime'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function addWordRow() {
    const boxShadow = document.getElementsByClassName('box-shadow')[1];
    const numWordRows = boxShadow.getElementsByClassName('word-row').length;

    if (numWordRows < 7) {

        const wordRowString = `<div class="word-row"><p style="display: inline;">Word ${numWordRows + 1}: </p>` +
            '<input type="text" class="text-input"> <select name="genres" class="dropdown">' +
            '<option value="29" selected>All Artists</option>' +
            '<option value="27">Acoustic Pop</option>' +
            '<option value="14">Alberta Country</option>' +
            '<option value="7">Alternative Country</option>' +
            '<option value="16">Americana</option>' +
            '<option value="6">Arkansas Country</option>' +
            '<option value="13">Australian Country</option>' +
            '<option value="4">Banjo</option>' +
            '<option value="21">Bluegrass</option>' +
            '<option value="17">Canadian Contemporary Country</option>' +
            '<option value="10">Canadian Country</option>' +
            '<option value="12">Classic Country Pop</option>' +
            '<option value="23">Contemporary Country</option>' +
            '<option value="2">Country</option>' +
            '<option value="11">Country Dawn</option>' +
            '<option value="15">Country Pop</option>' +
            '<option value="19">Country Rap</option>' +
            '<option value="26">Country Road</option>' +
            '<option value="24">Country Rock</option>' +
            '<option value="8">Deep New Americana</option>' +
            '<option value="20">Folk</option>' +
            '<option value="1">Indie</option>' +
            '<option value="25">Indie Folk</option>' +
            '<option value="28">Modern Country Rock</option>' +
            '<option value="3">New Americana</option>' +
            '<option value="9">None</option>' +
            '<option value="18">Outlaw Country</option>' +
            '<option value="5">Red Dirt</option>' +
            '<option value="22">Texas Country</option> </select> ' +
            `<button class="btn remove-btn" type="button" onclick="removeWordRow(${numWordRows})">Remove</button></div>`

        boxShadow.insertBefore(htmlToElement(wordRowString), boxShadow.children[numWordRows]);

    } else {
        alert('The maximum number of words you can compare is 7.');
    }
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function removeWordRow(numberToRemove) {
    const wordRowList = document.getElementsByClassName('word-row');
    if (wordRowList.length > 1) {

        const boxShadow = document.getElementsByClassName('box-shadow')[1];
        boxShadow.removeChild(boxShadow.children[numberToRemove]);


        for (let i = 0; i < wordRowList.length; i++) {
            wordRowList[i].children[3].onclick = function() { removeWordRow(i) };
            wordRowList[i].children[0].textContent = `Word: ${i + 1} `;
        }

    } else {
        alert('You cannot remove the last word.')
    }
}

function getWordsOverTime() {
    const wordRowList = document.getElementsByClassName('word-row');
    let url = `${apiURL}/graphWordsOverTime?numWords=${wordRowList.length}`;


    for (let i = 0; i < wordRowList.length; i++) {
        const word = wordRowList[i].children[1].value.toLowerCase();
        const genre_id = wordRowList[i].children[2].value;
        url = url + `&word${i}=${word}&genreId${i}=${genre_id}`;
    }

    console.log(url);

    fetch(url, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            alert("Failed to get words.");
            return;
        }

        return response.json();
    }).then(function(json) {
        console.log(json);

        if (json.error != null) {
            alert(`ERROR: ${json.error}`);
        } else {
            wordsOverTime = json.words;

            gChartsPromise.then(function() {
                drawWordUsageOverTime()
            });
        }



    }).catch(function(error) {
        console.log(error);
        alert("an unknown error has occured :(");
        directBackHome('An unknown error has ocurred :(')
    });
}

// start of code to make mobile look good
function isMobileDevice() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function changeStylesForMobileDevice() {
    let floatingDivs = document.getElementsByClassName('chart-left');

    for (let i = floatingDivs.length - 1; i >= 0; i--) {
        floatingDivs[i].classList.add('full-width')
        floatingDivs[i].classList.remove('chart-left');
    }

    floatingDivs = document.getElementsByClassName('chart-right');

    for (let i = floatingDivs.length - 1; i >= 0; i--) {
        floatingDivs[i].classList.add('full-width')
        floatingDivs[i].classList.remove('chart-right');
    }

    setNavBarToDrawer();
}

function setNavBarToDrawer() {
    const checkBtn = document.getElementsByClassName('checkbtn')[0];
    checkBtn.style.display = 'block';

    checkBtn.checkBoxClicked = () => { onCheckBoxClicked(); };

    const nav = document.getElementsByTagName('nav')[0];
    const list = nav.getElementsByTagName('ul')[0];
    list.style.position = 'fixed';
    list.style.width = '100%';
    list.style.height = '100vh';
    list.style.backgroundColor = '#555';
    list.style.top = '80px';
    list.style.left = '-130%';
    list.style.textAlign = 'center';
    list.style.transition = 'all 500ms';
    list.style.paddingLeft = '0px';

    const liList = list.children;
    for (let i = 0; i < liList.length; i++) {
        const li = liList[i];
        li.style.display = 'block';
        li.style.height = '70px';

        const a = li.getElementsByTagName('a')[0];
        a.style.fontSize = '40px';
        a.style.padding = "0px";
    }
}

function onCheckBoxClicked() {
    const nav = document.getElementsByTagName('nav')[0];
    const list = nav.getElementsByTagName('ul')[0];

    const check = document.getElementById('check');

    if (list.style.left != '0px') {
        list.style.left = '0px';
    } else {
        list.style.left = '-130%';
    }
}

if (isMobileDevice()) {
    changeStylesForMobileDevice();
}
// end of code to make mobile look good

fetchWordRanks();
getWordsOverTime();
setTimeout(drawWordUsageOverTime, 1000);