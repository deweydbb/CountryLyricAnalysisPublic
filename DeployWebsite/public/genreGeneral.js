const apiURL = "https://countrymusic.uc.r.appspot.com"

function directBackHome(msg) {
    alert(msg);
    window.location.replace('index.html');
}

// start of rank by popularity
function rankByPop() {
    const popYear = document.getElementsByName('year')[0].value;
    const popNumRes = document.getElementsByName('results')[0].value;


    fetch(`${apiURL}/rankGenresByPop?popYear=${popYear}&popNumResults=${popNumRes}`, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to rank by popularity.")
        }

        return response.json();
    }).then(function(json) {
        console.log(json.genresByPop)
        addResultsToPop(json);

    }).catch(function(error) {
        console.log(error);
        directBackHome('An unknown error has ocurred :(')
    });
}

function addResultsToPop(json) {
    const orderedList = document.getElementById('popOL');
    orderedList.innerHTML = '';

    const genreArray = json.genresByPop;
    for (let i = 0; i < genreArray.length; i++) {
        const genre = genreArray[i];
        orderedList.appendChild(getLiElement(genre));
    }
}

function getLiElement(genre) {
    const name = document.createTextNode(genre.name);

    const titleLink = document.createElement('a');
    titleLink.appendChild(name);
    titleLink.href = `genreSpecific.html?genreId=${genre.id}`;

    const span1 = document.createElement('span');
    span1.className = "capitalize";
    span1.appendChild(titleLink);

    const span2 = document.createElement('span');
    span2.className = 'result-number';
    span2.appendChild(document.createTextNode(`${genre.popularity_over_time.toFixed(2)}`));

    const div = document.createElement('div');
    div.appendChild(span1);
    div.appendChild(span2);

    const li = document.createElement("LI");
    li.appendChild(div);

    return li;
}
// end of rank by popularity

// start of rank by stat
function rankByStat() {
    const statType = document.getElementsByName('stats-dropdown')[0].value;
    const stereotype = document.getElementsByName('stereotype-dropdown')[0].value;
    const order = document.getElementsByName('order')[0].value;
    const numResults = document.getElementsByName('results')[1].value;


    fetch(`${apiURL}/rankGenresByStat?statsType=${statType}&stereotype=${stereotype}&statsOrder=${order}&statsNumResults=${numResults}`, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to rank by stat.")
        }

        return response.json();
    }).then(function(json) {
        console.log(json.genresByStat)
        addResultsToStat(json, statType, stereotype);


    }).catch(function(error) {
        console.log(error);
        directBackHome('An unknown error has ocurred :(')
    });
}

function addResultsToStat(json, statType, stereotype) {
    const orderedList = document.getElementById('statOL');
    orderedList.innerHTML = '';

    if (statType == 'stereotype' && stereotype != 'overall') {
        statType = stereotype;
    }

    let title = statType;
    if (title == 'num_words') {
        title = 'Number Of Words';
    }

    document.getElementById('statTypeTitle').textContent = title;

    const genreArray = json.genresByStat;
    for (let i = 0; i < genreArray.length; i++) {
        const genre = genreArray[i];
        orderedList.appendChild(getLiElementStat(genre, statType));
    }
}

function getLiElementStat(genre, statType) {
    const titleNode = document.createTextNode(genre.name);

    const titleLink = document.createElement('a');
    titleLink.appendChild(titleNode);
    titleLink.href = `genreSpecific.html?genreId=${genre.id}`;

    const span1 = document.createElement('span');
    span1.className = 'capitalize';
    span1.appendChild(titleLink);

    const span2 = document.createElement('span');
    span2.className = 'result-number';

    let statValue = getStat(genre, statType);
    let statString;
    if (isStereotype(statType)) {
        statValue = statValue * 100;
        statString = `${statValue.toFixed(2)}%`
    } else {
        statString = `${statValue.toFixed(3)}`
    }

    span2.appendChild(document.createTextNode(statString));

    const div = document.createElement('div');
    div.appendChild(span1);
    div.appendChild(span2);

    const li = document.createElement("LI");
    li.appendChild(div);

    return li;
}

function isStereotype(statType) {
    return statType == 'stereotype' ||
        statType == 'clothing' ||
        statType == 'body' ||
        statType == 'alcohol' ||
        statType == 'trucks' ||
        statType == 'god' ||
        statType == 'lifestyle';
}

function getStat(genre, statType) {
    switch (statType) {
        case 'uniqueness':
            return genre.uniqueness_over_time;
        case 'diversity':
            return genre.diversity_over_time;
        case 'stereotype':
            return genre.stereotype_over_time;
        case 'num_words':
            return genre.words_over_time;
        case 'clothing':
            return genre.clothing_over_time;
        case 'body':
            return genre.body_over_time;
        case 'alcohol':
            return genre.alcohol_over_time;
        case 'trucks':
            return genre.trucks_over_time;
        case 'god':
            return genre.god_over_time;
        case 'lifestyle':
            return genre.lifestyle_over_time;
    }
}
// end of rank by stat

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

rankByPop();
rankByStat();
watchDropDown();