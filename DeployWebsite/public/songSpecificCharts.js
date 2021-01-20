const apiURL = "https://countrymusic.uc.r.appspot.com"

// Load the Visualization API and the corechart package.
const gChartsPromise = google.charts.load('current', { 'packages': ['corechart'] });

const urlParams = new URLSearchParams(window.location.search);
const songId = urlParams.get('songId');

function directBackHome(msg) {
    alert(msg);
    window.location.replace('index.html');
}

console.log(songId);
if (songId == null || isNaN(songId) || songId <= 0) {
    directBackHome("Did not specify a valid song id.");
}

let songData;

fetch(`${apiURL}/getSpecificSong?songId=${songId}`, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.5',
    'Content-Language': 'en-US',
}).then(function(response) {
    if (response.status != 200) {
        directBackHome("Failed to find song.")
    }

    return response.json();
}).then(function(json) {
    songData = json.songData[0];

    console.log(songData);

    addImageIFrame();
    setTimeout(resizeImage(), 200);

    gChartsPromise.then(function() {
        setGeneralStatistics();
        drawStatisticsGraph();
        drawStereotypesGraph();
    });


}).catch(function(error) {
    console.log(error);
    directBackHome('An unknown error has ocurred :(')
});

function drawStatisticsGraph() {
    var data = google.visualization.arrayToDataTable([
        ['popularity', 0, 0.253, 0.253, songData.popularity / 100],
        ['uniqueness', 0, 0.39, 0.39, songData.uniqueness],
        ['diversity', 0, 0.43, 0.43, songData.diversity],
        ['stereotype', 0, 0.037, 0.037, songData.stereotype],
        // Treat first row as data as well.
    ], true);

    let maxHeight = 0.5;
    maxHeight = Math.max(maxHeight, (songData.popularity / 100) + .1);
    maxHeight = Math.max(maxHeight, songData.uniqueness + .1);
    maxHeight = Math.max(maxHeight, songData.diversity + .1);
    maxHeight = Math.max(maxHeight, songData.stereotype + .1);
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
        ['clothing', 0, 0.0014, 0.0014, songData.clothing],
        ['body', 0, 0.0171, 0.0171, songData.body],
        ['alcohol', 0, 0.005, 0.005, songData.alcohol],
        ['trucks', 0, 0.0049, 0.0049, songData.trucks],
        ['god', 0, 0.0046, 0.0046, songData.god],
        ['lifesytle', 0, 0.0043, 0.0043, songData.lifestyle],
        // Treat first row as data as well.
    ], true);

    let maxHeight = 0.02;
    maxHeight = Math.max(maxHeight, songData.clothing + .005);
    maxHeight = Math.max(maxHeight, songData.body + .005);
    maxHeight = Math.max(maxHeight, songData.alcohol + .005);
    maxHeight = Math.max(maxHeight, songData.trucks + .005);
    maxHeight = Math.max(maxHeight, songData.god + .005);
    maxHeight = Math.max(maxHeight, songData.lifestyle + .005);
    maxHeight = maxHeight.toFixed(2);

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

function setGeneralStatistics() {
    const title = document.getElementById('SongTitleArtist');
    const songTitle = songData.title.replaceAll('\"', '');
    title.textContent = `Song: ${songTitle} by ${songData.artist}`;

    const statistics = document.getElementsByClassName("result-number");
    const genreUrl = `genreSpecific.html?genreId=${songData.genre_id}`;
    statistics[0].innerHTML = `<a href=${genreUrl}>${songData.genre}</a>`;

    const artistUrl = `artistspecific.html?artistId=${songData.artist_id}`
    statistics[1].innerHTML = `<a href=${artistUrl}>${songData.artist}</a>`;

    statistics[2].textContent = songData.album;
    statistics[3].textContent = songData.year;
    statistics[4].textContent = songData.num_words;
    statistics[5].textContent = songData.popularity;
    statistics[6].textContent = songData.uniqueness.toFixed(2);
    statistics[7].textContent = songData.diversity.toFixed(2);

    let stereoPercent = songData.stereotype * 100;
    statistics[8].textContent = `${stereoPercent.toFixed(2)}%`;
    statistics[9].textContent = getMostCommonStereotype();



}

function getMostCommonStereotype() {
    const array = [songData.clothing, songData.body, songData.alcohol, songData.trucks, songData.god, songData.lifestyle];
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

function addImageIFrame() {
    const boxShadow = document.getElementsByClassName('box-shadow')[1];

    const img = document.createElement('img');
    img.src = songData.spotify_image_link;
    img.style = "display: block; margin: 0px auto;";
    img.id = "image";

    boxShadow.appendChild(img);

    if (songData.spotify_preview_link != null) {
        const src = document.createElement('source');
        src.src = songData.spotify_preview_link;
        src.type = "audio/mpeg";

        const vid = document.createElement('video');
        vid.controls = "true";
        vid.appendChild(src);

        boxShadow.appendChild(vid);
    } else {
        const div = document.createElement('div');
        const text = document.createTextNode('song preview not available');
        div.appendChild(text);

        div.className = "noPreview";

        boxShadow.appendChild(div);
    }


}

function resizeImage() {
    if (!isMobileDevice()) {
        const img = document.getElementById("image");
        const boxShadow = document.getElementsByClassName("box-shadow")[0];

        const length = boxShadow.offsetWidth; //Math.min(boxShadow.offsetHeight, boxShadow.offsetWidth);
        boxShadow.style.paddingBottom = "0px";
        img.height = length;

        const body = document.getElementsByTagName('body')[0];
        console.log(body.offsetWidth);
        if (body.offsetWidth > 935) {
            boxShadow.style.height = `${boxShadow.offsetWidth - 10}px`;
        } else {
            boxShadow.style.height = 'auto';
        }
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

window.addEventListener('resize', resizeImage, false);