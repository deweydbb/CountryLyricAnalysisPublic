const apiURL = "https://countrymusic.uc.r.appspot.com"

// Load the Visualization API and the corechart package.
const gChartsPromise = google.charts.load('current', { 'packages': ['corechart'] });

function directBackHome(msg) {
    alert(msg);
    window.location.replace('index.html');
}

/*
    drawSongPerYearChart();
    drawPopularityPerYearChart();
    drawStatisticsGraph();
    drawStereotypesGraph();
*/

const urlParams = new URLSearchParams(window.location.search);
let genreId = urlParams.get('genreId');
let genreData;
let topArtists;

console.log(genreId);
if (genreId == null || isNaN(genreId) || genreId <= 0) {
    directBackHome("Did not specify a valid genre id.")
}

fetch(`${apiURL}/getSpecificGenre?genreId=${genreId}`, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.5',
    'Content-Language': 'en-US',
}).then(function(response) {
    if (response.status != 200) {
        directBackHome("Failed to find the genre.")
    }

    return response.json();
}).then(function(json) {
    genreData = json.genreData[0];
    topArtists = json.topArtists;

    console.log(json);

    setGeneralStatistics();
    setTopArtists();

    gChartsPromise.then(function() {
        drawSongPerYearChart();
        drawPopularityPerYearChart();
        drawStatisticsGraph();
        drawStereotypesGraph();
    });


}).catch(function(error) {
    console.log(error);
    directBackHome('An unknown error has ocurred :(')
});

function setGeneralStatistics() {
    document.getElementById('genreName').textContent = genreData.name;

    let results = document.getElementsByClassName('result-number');
    results[0].textContent = genreData.num_artists;

    results[1].textContent = genreData.songs_over_time[0];
    results[2].textContent = genreData.popularity_over_time[0].toFixed(2);
    results[3].textContent = genreData.uniqueness_over_time.toFixed(2);
    results[4].textContent = genreData.diversity_over_time.toFixed(2);

    let percent = genreData.stereotype_over_time * 100;
    results[5].textContent = `${percent.toFixed(2)}%`;
    results[6].textContent = getMostCommonStereotype();
    results[7].textContent = genreData.words_over_time.toFixed(2);

    results[8].textContent = getMostPopularYear();
    results[9].textContent = getYearWithMostSongs();


}

function setTopArtists() {
    let list = document.getElementById("topArtistsOL");

    for (let i = 0; i < topArtists.length; i++) {
        const artist = topArtists[i];
        list.appendChild(getLiElement(artist));
    }
}

function getLiElement(artist) {
    const titleNode = document.createTextNode(artist.name);

    const titleLink = document.createElement('a');
    titleLink.appendChild(titleNode);
    titleLink.href = `artistspecific.html?artistId=${artist.id}`;

    const span1 = document.createElement('span');
    span1.appendChild(titleLink);

    const span2 = document.createElement('span');
    span2.className = 'result-number';
    span2.appendChild(document.createTextNode(`${artist.popularity_over_time.toFixed(2)}`));

    const div = document.createElement('div');
    div.appendChild(span1);
    div.appendChild(span2);

    const li = document.createElement("LI");
    li.appendChild(div);

    return li;
}

function drawSongPerYearChart() {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    data.addColumn('number', 'Number of songs');

    let numSongsPerYear = [14504, 1363, 1410, 1211, 1338, 1212, 1247, 1660, 1447, 1313, 1393, 910];
    let startYear = 2010;
    for (let i = 1; i <= 11; i++) {
        data.addRow([`${startYear}`, genreData.songs_over_time[i] / numSongsPerYear[i]]);
        startYear++;
    }

    const divWidth = document.getElementById("SongsPerYear").parentNode.offsetWidth;
    let divHeight = divWidth / (5 / 3);
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
            left: 48,
            right: 16,
            bottom: 48,
        },
        legend: { position: "none" },
        hAxis: {
            slantedText: true,
        },
        vAxis: {
            viewWindow: {
                min: 0
            },
            format: 'percent',
        },
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('SongsPerYear'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawPopularityPerYearChart() {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    data.addColumn('number', 'Avg. Popularity');

    let startYear = 2010;
    for (let i = 1; i <= 11; i++) {
        data.addRow([`${startYear}`, genreData.popularity_over_time[i]]);
        startYear++;
    }

    const divWidth = document.getElementById("PopularityPerYear").parentNode.offsetWidth;
    let divHeight = divWidth / (5 / 3);
    var options = {
        width: "100%",
        height: divHeight,
        backgroundColor: "#f7f7f7",
        chartArea: {
            height: "100%",
            width: "100%",
            top: 48,
            left: 48,
            right: 16,
            bottom: 48,
        },
        legend: { position: "none" },
        hAxis: {
            slantedText: true,
        },
        vAxis: {
            viewWindow: {
                min: 0
            },
        },
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('PopularityPerYear'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawStatisticsGraph() {
    var data = google.visualization.arrayToDataTable([
        ['popularity', 0, 0.253, 0.253, genreData.popularity_over_time[0] / 100],
        ['uniqueness', 0, 0.39, 0.39, genreData.uniqueness_over_time],
        ['diversity', 0, 0.43, 0.43, genreData.diversity_over_time],
        ['stereotype', 0, 0.037, 0.037, genreData.stereotype_over_time],
        // Treat first row as data as well.
    ], true);

    let maxHeight = 0.5;
    maxHeight = Math.max(maxHeight, (genreData.popularity_over_time[0] / 100) + .1);
    maxHeight = Math.max(maxHeight, genreData.uniqueness_over_time + .1);
    maxHeight = Math.max(maxHeight, genreData.diversity_over_time + .1);
    maxHeight = Math.max(maxHeight, genreData.stereotype_over_time + .1);
    maxHeight = maxHeight.toFixed(1);

    const divWidth = document.getElementById("StatisticsGraph").parentNode.offsetWidth;
    let divHeight = divWidth / (5 / 3);
    var options = {
        width: "100%",
        height: divHeight,
        backgroundColor: "#f7f7f7",
        chartArea: {
            height: "100%",
            width: "100%",
            top: 48,
            left: 48,
            right: 16,
            bottom: 48,
        },
        //legend: { position: "none" },
        candlestick: {
            risingColor: {
                fill: '#de5246',
                stroke: '#de5246',
                strokeWidth: '0',
            },
        },
        bar: {
            groupWidth: '10',
        },
        vAxis: {
            viewWindow: {
                min: 0,
                max: maxHeight
            }
        },
        enableInteractivity: false,
    };

    var chart = new google.visualization.CandlestickChart(document.getElementById('StatisticsGraph'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawStereotypesGraph() {
    var data = google.visualization.arrayToDataTable([
        ['clothing', 0, 0.0014, 0.0014, genreData.clothing_over_time],
        ['body', 0, 0.0171, 0.0171, genreData.body_over_time],
        ['alcohol', 0, 0.005, 0.005, genreData.alcohol_over_time],
        ['trucks', 0, 0.0049, 0.0049, genreData.trucks_over_time],
        ['god', 0, 0.0046, 0.0046, genreData.god_over_time],
        ['lifesytle', 0, 0.0043, 0.0043, genreData.lifestyle_over_time],
        // Treat first row as data as well.
    ], true);

    let maxHeight = 0.02;
    maxHeight = Math.max(maxHeight, genreData.clothing_over_time + .005);
    maxHeight = Math.max(maxHeight, genreData.body_over_time + .005);
    maxHeight = Math.max(maxHeight, genreData.alcohol_over_time + .005);
    maxHeight = Math.max(maxHeight, genreData.trucks_over_time + .005);
    maxHeight = Math.max(maxHeight, genreData.god_over_time + .005);
    maxHeight = Math.max(maxHeight, genreData.lifestyle_over_time + .005);
    maxHeight = maxHeight.toFixed(3);

    const divWidth = document.getElementById("StereotypesGraph").parentNode.offsetWidth;
    let divHeight = divWidth / (5 / 3);
    var options = {
        width: "100%",
        height: divHeight,
        backgroundColor: "#f7f7f7",
        chartArea: {
            height: "100%",
            width: "100%",
            top: 48,
            left: 48,
            right: 16,
            bottom: 48,
        },
        legend: { position: "none" },
        candlestick: {
            risingColor: {
                fill: '#de5246',
                stroke: '#de5246',
                strokeWidth: '0',
            },
        },
        bar: {
            groupWidth: '10',
        },
        enableInteractivity: false,
        vAxis: {
            format: 'percent',
            viewWindow: {
                min: 0,
                max: maxHeight
            },
        },
    };

    var chart = new google.visualization.CandlestickChart(document.getElementById('StereotypesGraph'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    function drawChart() {
        chart.draw(data, options);
    }
}

function getMostCommonStereotype() {
    const array = [
        genreData.clothing_over_time,
        genreData.body_over_time,
        genreData.alcohol_over_time,
        genreData.trucks_over_time,
        genreData.god_over_time,
        genreData.lifestyle_over_time
    ];
    const res = ["CLOTHING", "BODY", "ALCOHOL", "TRUCKS", "GOD", "LIFESTYLE"];

    let highest = -1;
    let highIndex = -1;
    for (let i = 0; i < array.length; i++) {
        if (array[i] > highest) {
            highest = array[i];
            highIndex = i;
        }
    }

    return res[highIndex];
}

function getMostPopularYear() {
    let highest = -1;
    let index = -1;


    for (let i = 1; i < genreData.popularity_over_time.length; i++) {
        if (genreData.popularity_over_time[i] > highest) {
            index = i;
            highest = genreData.popularity_over_time[i];
        }
    }

    return index + 2010 - 1; //minus because 2010 starts at index 1
}

function getYearWithMostSongs() {
    let highest = -1;
    let index = -1;


    for (let i = 1; i < genreData.songs_over_time.length; i++) {
        if (genreData.songs_over_time[i] > highest) {
            index = i;
            highest = genreData.songs_over_time[i];
        }
    }

    return index + 2010 - 1; //minus because 2010 starts at index 1
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