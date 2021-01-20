const apiURL = "https://countrymusic.uc.r.appspot.com"

const gChartsPromise = google.charts.load('current', { 'packages': ['corechart'] });

function directBackHome(msg) {
    alert(msg);
    window.location.replace('index.html');
}

let genresOverTime;
let genreNameArray = [
    "Blank",
    "Indie",
    "Country",
    "New Americana",
    "Banjo",
    "Red Dirt",
    "Arkansas Country",
    "Alternative Country",
    "Deep New Americana",
    "None",
    "Canadian Country",
    "Country Dawn",
    "Classic Country Pop",
    "Australian Country",
    "Alberta Country",
    "Country Pop",
    "Americana",
    "Canadian Contemporary Country",
    "Outlaw Country",
    "Country Rap",
    "Folk",
    "Bluegrass",
    "Texas Country",
    "Contemporary Country",
    "Country Rock",
    "Indie Folk",
    "Country Road",
    "Acoustic Pop",
    "Modern Country Rock",
    "All Artists"
]

function drawCompareGenreStats() {
    let statType = document.getElementsByName('stats-dropdown')[0].value;
    const stereotype = document.getElementsByName('stereotype-dropdown')[0].value;

    let format = 'percent';
    if (statType == 'uniqueness' || statType == 'diversity' || statType == 'num_words') {
        format = 'decimal';
    }

    if (statType == 'stereotype' && stereotype != "overall") {
        statType = stereotype;
        format = 'percent';
    }

    const title = document.getElementById('graphTitle');
    if (statType == 'num_words') {
        statType = 'Number of words';
    }
    title.textContent = statType;


    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');

    for (let i = 0; i < genresOverTime.length; i++) {
        const genre = genresOverTime[i];
        console.log(genre);
        data.addColumn('number', `${genreNameArray[genre.genre_id]} ${genre.min}-${genre.max}`);
    }

    const startYear = 2010;
    const endYear = 2020;

    for (let year = startYear; year <= endYear; year++) {
        const row = [`${year}`];

        const yearIndex = year - startYear;
        for (let i = 0; i < genresOverTime.length; i++) {
            const genre = genresOverTime[i];
            row.push(genre.stat_over_time[yearIndex]);
        }

        data.addRow(row);
    }

    const divWidth = document.getElementById("GraphGenreStats").parentNode.offsetWidth;
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
            format: format,
            minValue: 0,
        },
        animation: {
            startup: true,
            duration: 2000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('GraphGenreStats'));

    drawChart();
    window.addEventListener('resize', drawChart, false);

    options.animation.duration = 1;

    function drawChart() {
        chart.draw(data, options);
    }
}

function addGenreRow() {
    const boxShadow = document.getElementsByClassName('box-shadow')[0];
    const numGenreRows = boxShadow.getElementsByClassName('genre-pop-row').length;

    if (numGenreRows < 7) {

        const genreRowString = '<div class="genre-pop-row">' +
            `<p style="display: inline;">Genre ${numGenreRows + 1}:</p>` +
            '<select name="genres" class="dropdown">' +
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
            '<option value="22">Texas Country</option>' +
            '</select>' +
            '<br>' +
            '<p>Genre Popularity Range:</p>' +
            '<br>' +
            '<span style="margin-left: 15px;">min:</span>' +
            '<input type="number" value="0">' +
            '<br>' +
            '<span style="margin-left: 15px;">max:</span>' +
            '<input type="number" value="100">' +
            '<br>' +
            `<button class="btn" type="button" onclick="removeGenreRow(${numGenreRows})">Remove</button>` +
            '</div>'

        boxShadow.insertBefore(htmlToElement(genreRowString), boxShadow.children[numGenreRows]);

    } else {
        alert('The maximum number of genres you can compare is 7.');
    }
}

function removeGenreRow(numberToRemove) {
    const genreRowList = document.getElementsByClassName('genre-pop-row');
    if (genreRowList.length > 1) {

        const boxShadow = document.getElementsByClassName('box-shadow')[0];
        boxShadow.removeChild(boxShadow.children[numberToRemove]);

        for (let i = 0; i < genreRowList.length; i++) {
            genreRowList[i].children[11].onclick = function() { removeGenreRow(i) };
            genreRowList[i].children[0].textContent = `Genre: ${i + 1} `;
        }

    } else {
        alert('You cannot remove the last word.')
    }
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function getGenresOverTime() {
    const genreRowList = document.getElementsByClassName('genre-pop-row');
    let url = `${apiURL}/graphGenresOverTime?numGenres=${genreRowList.length}`;

    let statType = document.getElementsByName('stats-dropdown')[0].value;
    const stereotype = document.getElementsByName('stereotype-dropdown')[0].value;

    if (statType == 'stereotype' && stereotype != "overall") {
        statType = stereotype;
    }

    console.log(statType);

    url = url + `&statType=${statType}`;

    url = completeUrl(url, genreRowList);
    if (url == null) {
        return;
    }

    console.log(url);
    fetch(url, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to get genres.")
        }

        return response.json();
    }).then(function(json) {
        console.log(json);

        if (json.error != null) {
            alert(`ERROR: ${json.error}`);
        } else {
            genresOverTime = json.genres;

            gChartsPromise.then(function() {
                drawCompareGenreStats();
            });
        }

    }).catch(function(error) {
        console.log(error);
        alert("an unknown error has occured :(");
        //directBackHome('An unknown error has ocurred :(')
    });
}

function completeUrl(url, genreRowList) {
    for (let i = 0; i < genreRowList.length; i++) {
        const genreChildren = genreRowList[i].children;

        const genre_id = genreChildren[1].value;
        const min = parseInt(genreChildren[6].value);
        const max = parseInt(genreChildren[9].value);

        if (min < 0 || min > 100) {
            alert(`For Genre ${i}, the min must be between 0 and 100 inclusive.`);
            return null;
        }
        if (max < 0 || max > 100) {
            alert(`For Genre ${i}, the max must be between 0 and 100 inclusive.`);
            return null;
        }
        if (max < min) {
            console.log(max < min, max, "<", min);
            alert(`For Genre ${i}, the max must be greater than or equal to the min.`);
            return null;
        }
        if (isNaN(min)) {
            alert(`For Genre ${i}, the min must be a number.`);
            return null;
        }
        if (isNaN(max)) {
            alert(`For Genre ${i}, the max must be a number.`);
            return null;
        }

        url = url + `&genreId${i}=${genre_id}&min${i}=${min}&max${i}=${max}`;
    }

    return url;
}

function watchDropDown() {
    let dropdown = document.getElementsByName('stats-dropdown')[0];
    let categoryDropDown = document.getElementsByName('stereotype-dropdown')[0]
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

getGenresOverTime();
watchDropDown();