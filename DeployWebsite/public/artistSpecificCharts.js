const apiURL = "https://countrymusic.uc.r.appspot.com"

// Load the Visualization API and the corechart package.
const gChartsPromise = google.charts.load('current', { 'packages': ['corechart'] });

const urlParams = new URLSearchParams(window.location.search);
let artistId = urlParams.get('artistId');
let artistData;
let topSongs;

function directBackHome(msg) {
    alert(msg);
    window.location.replace('index.html');
}

console.log(artistId);
if (artistId == null || isNaN(artistId) || artistId <= 0) {
    alert("Did not specify a valid artist id so I am taking you to my favorite artist.");
    artistId = 364;
}

fetch(`${apiURL}/getSpecificArtist?artistId=${artistId}`, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.5',
    'Content-Language': 'en-US',
}).then(function(response) {
    if (response.status != 200) {
        directBackHome("Failed to find artist.")
    }

    return response.json();
}).then(function(json) {
    artistData = json.artistData[0];
    topSongs = json.topSongs;

    console.log(json);

    setGeneralStatistics();
    setTopSongs();

    addImage();
    resizeImage();

    gChartsPromise.then(function() {
        drawSongPerYearChart();
        drawPopularityPerYearChart();
        drawStatisticsGraph();
        drawStereotypesGraph();
        drawStatsOverYears();
    });


}).catch(function(error) {
    console.log(error);
    directBackHome('An unknown error has ocurred :(')
});

function addImage() {
    const boxShadow = document.getElementsByClassName('box-shadow')[1];

    const img = document.createElement('img');
    img.src = artistData.spotify_image_link;
    img.style = "display: block; margin: 0px auto; object-fit: cover; width: 100%";
    img.id = "image";

    boxShadow.appendChild(img);
}

function resizeImage() {
    const img = document.getElementById("image");
    const boxShadow = document.getElementsByClassName("box-shadow")[0];

    const length = boxShadow.offsetWidth;
    boxShadow.style.paddingBottom = "0px";
    img.height = length;

    const body = document.getElementsByTagName('body')[0];
    console.log(body.offsetWidth);
    if (body.offsetWidth > 935 && !isMobileDevice()) {
        boxShadow.style.height = `${boxShadow.offsetWidth - 10}px`;
    } else {
        boxShadow.style.height = 'auto';
    }

    const songsByPop = document.getElementsByClassName('box-shadow')[2];
    const numSongsPerYear = document.getElementsByClassName('box-shadow')[3];


    if (body.offsetWidth > 935 && !isMobileDevice()) {
        songsByPop.style.height = "auto";
        numSongsPerYear.style.height = "auto";

        const height = Math.max(songsByPop.offsetHeight.toFixed(0), numSongsPerYear.offsetHeight.toFixed(0)).toFixed(0);
        songsByPop.style.height = `${height}px`;
        numSongsPerYear.style.height = `${height}px`;
    } else {
        songsByPop.style.height = "auto";
        numSongsPerYear.style.height = "auto";
    }
}

function setGeneralStatistics() {
    const spotifyLink = document.createElement('a');
    spotifyLink.appendChild(document.createTextNode(`${artistData.name}`));
    if (artistData.spotify_artist_id != undefined) {
        spotifyLink.href = `https://open.spotify.com/artist/${artistData.spotify_artist_id}`;
    }
    spotifyLink.target = '_blank';
    spotifyLink.rel = 'noopener noreferrer';

    const title = document.getElementById('artistName');
    title.appendChild(document.createTextNode('Artist: '));
    title.appendChild(spotifyLink);

    let results = document.getElementsByClassName('result-number');
    results[0].firstChild.textContent = artistData.genre;
    results[0].firstChild.href = `genreSpecific.html?genreId=${artistData.genre_id}`

    results[1].textContent = artistData.songs_over_time[0];
    results[2].textContent = artistData.popularity_over_time[0].toFixed(2);
    results[3].textContent = artistData.uniqueness_over_time[0].toFixed(2);
    results[4].textContent = artistData.diversity_over_time[0].toFixed(2);

    let percent = artistData.stereotype_over_time[0] * 100;
    results[5].textContent = `${percent.toFixed(2)}%`;
    results[6].textContent = getMostCommonStereotype();
    results[7].textContent = artistData.words_over_time[0].toFixed(2);

    results[8].textContent = getMostPopularYear();
    results[9].textContent = getYearWithMostSongs();


}

function setTopSongs() {
    let list = document.getElementById("topSongsByPop");

    for (let i = 0; i < topSongs.length; i++) {
        const song = topSongs[i];
        list.appendChild(getLiElement(song));
    }
}

function getLiElement(song) {
    const title = song.title.replaceAll('\"', '');
    const titleNode = document.createTextNode(title);

    const titleLink = document.createElement('a');
    titleLink.appendChild(titleNode);
    titleLink.href = `songSpecific.html?songId=${song.id}`;

    const span1 = document.createElement('span');
    span1.appendChild(titleLink);

    const span2 = document.createElement('span');
    span2.className = 'result-number';
    span2.appendChild(document.createTextNode(`${song.popularity}`));

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

    let startYear = 2010;
    for (let i = 1; i <= 11; i++) {
        data.addRow([`${startYear}`, artistData.songs_over_time[i]]);
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
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('SongsPerYear'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawPopularityPerYearChart() {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    data.addColumn('number', 'Number of songs');

    let startYear = 2010;
    for (let i = 1; i <= 11; i++) {
        data.addRow([`${startYear}`, artistData.popularity_over_time[i]]);
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
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('PopularityPerYear'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawStatisticsGraph() {
    var data = google.visualization.arrayToDataTable([
        ['popularity', 0, 0.253, 0.253, artistData.popularity_over_time[0] / 100],
        ['uniqueness', 0, 0.39, 0.39, artistData.uniqueness_over_time[0]],
        ['diversity', 0, 0.43, 0.43, artistData.diversity_over_time[0]],
        ['stereotype', 0, 0.037, 0.037, artistData.stereotype_over_time[0]],
        // Treat first row as data as well.
    ], true);

    let maxHeight = 0.5;
    maxHeight = Math.max(maxHeight, (artistData.popularity_over_time[0] / 100) + .1);
    maxHeight = Math.max(maxHeight, artistData.uniqueness_over_time[0] + .1);
    maxHeight = Math.max(maxHeight, artistData.diversity_over_time[0] + .1);
    maxHeight = Math.max(maxHeight, artistData.stereotype_over_time[0] + .1);
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
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.CandlestickChart(document.getElementById('StatisticsGraph'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawStereotypesGraph() {
    var data = google.visualization.arrayToDataTable([
        ['clothing', 0, 0.0014, 0.0014, artistData.clothing_over_time[0]],
        ['body', 0, 0.0171, 0.0171, artistData.body_over_time[0]],
        ['alcohol', 0, 0.005, 0.005, artistData.alcohol_over_time[0]],
        ['trucks', 0, 0.0049, 0.0049, artistData.trucks_over_time[0]],
        ['god', 0, 0.0046, 0.0046, artistData.god_over_time[0]],
        ['lifesytle', 0, 0.0043, 0.0043, artistData.lifestyle_over_time[0]],
        // Treat first row as data as well.
    ], true);

    let maxHeight = 0.02;
    maxHeight = Math.max(maxHeight, artistData.clothing_over_time[0] + .005);
    maxHeight = Math.max(maxHeight, artistData.body_over_time[0] + .005);
    maxHeight = Math.max(maxHeight, artistData.alcohol_over_time[0] + .005);
    maxHeight = Math.max(maxHeight, artistData.trucks_over_time[0] + .005);
    maxHeight = Math.max(maxHeight, artistData.god_over_time[0] + .005);
    maxHeight = Math.max(maxHeight, artistData.lifestyle_over_time[0] + .005);
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
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.CandlestickChart(document.getElementById('StereotypesGraph'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function drawStatsOverYears() {
    const statType = getStatToGraph();
    const statArray = getStatArray(statType);

    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    data.addColumn('number', statType);

    let startYear = 2010;
    for (let i = 1; i <= 11; i++) {
        data.addRow([`${startYear}`, statArray[i]]);
        startYear++;
    }

    let format = 'percent';
    if (statType == 'uniqueness' || statType == 'diversity' || statType == 'num_words') {
        format = 'decimal';
    }

    const divWidth = document.getElementById("StatsOverYearGraph").parentNode.offsetWidth;
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
            format: format,
        },
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('StatsOverYearGraph'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function getStatToGraph() {
    const statType = document.getElementsByName('stats-dropdown')[0].value;
    if (statType == 'stereotype') {
        const stereotype = document.getElementsByName('stereotype-dropdown')[0].value;
        return stereotype == 'overall' ? statType : stereotype;
    }

    return statType;
}

function getStatArray(statType) {
    let array = [];

    switch (statType) {
        case 'uniqueness':
            array = artistData.uniqueness_over_time;
            break;
        case 'diversity':
            array = artistData.diversity_over_time;
            break;
        case 'stereotype':
            array = artistData.stereotype_over_time;
            break;
        case 'num_words':
            array = artistData.words_over_time;
            break;
        case 'clothing':
            array = artistData.clothing_over_time;
            break;
        case 'body':
            array = artistData.body_over_time;
            break;
        case 'alcohol':
            array = artistData.alcohol_over_time;
            break;
        case 'trucks':
            array = artistData.trucks_over_time;
            break;
        case 'god':
            array = artistData.god_over_time;
            break;
        case 'lifestyle':
            array = artistData.lifestyle_over_time;
            break;
    }

    return array;
}

function getMostCommonStereotype() {
    const array = [
        artistData.clothing_over_time[0],
        artistData.body_over_time[0],
        artistData.alcohol_over_time[0],
        artistData.trucks_over_time[0],
        artistData.god_over_time[0],
        artistData.lifestyle_over_time[0]
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


    for (let i = 1; i < artistData.popularity_over_time.length; i++) {
        if (artistData.popularity_over_time[i] > highest) {
            index = i;
            highest = artistData.popularity_over_time[i];
        }
    }

    return index + 2010 - 1; //minus because 2010 starts at index 1
}

function getYearWithMostSongs() {
    let highest = -1;
    let index = -1;


    for (let i = 1; i < artistData.songs_over_time.length; i++) {
        if (artistData.songs_over_time[i] > highest) {
            index = i;
            highest = artistData.songs_over_time[i];
        }
    }

    return index + 2010 - 1; //minus because 2010 starts at index 1
}

function watchDropDown() {
    var dropdown = document.getElementsByName('stats-dropdown')[0];
    var categoryDropDown = document.getElementsByName('stereotype-dropdown')[0]
    if (dropdown.value == "stereotype") {
        categoryDropDown.hidden = false;
    } else {
        categoryDropDown.hidden = true;
    }
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

watchDropDown();
window.addEventListener('resize', resizeImage, false);