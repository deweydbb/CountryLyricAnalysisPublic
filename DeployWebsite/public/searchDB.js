const apiURL = "https://countrymusic.uc.r.appspot.com"

function directBackHome(msg) {
    alert(msg);
    window.location.replace('index.html');
}

function searchForSongByTitle() {
    const titleInput = document.getElementById('songTitle');
    let title = titleInput.value;
    title = title.replaceAll("\", ");
    title = title.replaceAll("''", "'");
    title = title.replaceAll("''", "'");
    title = title.replaceAll("'", "''");

    if (title.length < 1) {
        alert('Please enter a title');
        return;
    }

    const url = `${apiURL}/searchForSong?title=${title}`

    fetch(url, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to get songs.")
        }


        return response.json();
    }).then(function(json) {
        console.log(json);

        if (json.error != null || json.results.length == 0) {
            if (json.results != null && json.results.length == 0) {
                json.error = 'Found 0 songs.';
            }

            const errorText = document.getElementById('errorMsgSong');
            errorText.innerText = json.error;
            errorText.hidden = false;

            setTimeout(() => {
                errorText.hidden = true;
            }, 7000);
        } else {
            addSongsToSongSearch(json.results);
        }

    }).catch(function(error) {
        console.log(error);
        directBackHome('An unknown error has ocurred :(')
    });
}

function searchForSongByArtist() {
    const artistInput = document.getElementById('songArtist');
    let artist = artistInput.value;
    artist = artist.replaceAll("\", ");
    artist = artist.replaceAll("''", "'");
    artist = artist.replaceAll("''", "'");
    artist = artist.replaceAll("'", "''");

    if (artist.length < 1) {
        alert('Please enter an artist');
        return;
    }

    let url = `${apiURL}/searchForSong?artist=${artist}`;
    url = url.replaceAll("+", "%2B");
    url = url.replaceAll("&", "%26");

    console.log(url);
    fetch(url, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to get songs.")
        }

        return response.json();
    }).then(function(json) {
        console.log(json);

        if (json.error != null || json.results.length == 0) {
            if (json.results != null && json.results.length == 0) {
                json.error = 'Found 0 songs.';
            }


            const errorText = document.getElementById('errorMsgSong');
            errorText.innerText = json.error;
            errorText.hidden = false;

            setTimeout(() => {
                errorText.hidden = true;
            }, 7000);
        } else {
            addSongsToSongSearch(json.results);
        }

    }).catch(function(error) {
        console.log(error);
        directBackHome('An unknown error has ocurred :(')
    });
}

function addSongsToSongSearch(songs) {
    const list = document.getElementById('songResults');
    list.innerHTML = "";

    for (let i = 0; i < songs.length; i++) {
        list.appendChild(getSongLI(songs[i]));
    }
}

function getSongLI(song) {
    song.title = song.title.replaceAll('"', "");
    const li = `<li><a href=songSpecific.html?songId=${song.id}>${song.title}</a> by ` +
        `<a href=artistspecific.html?artistId=${song.artist_id}>${song.artist}</a></li>`;
    return htmlToElement(li);
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function searchForArtistByName() {
    let artistName = document.getElementById('artistNameInput').value;
    artistName = artistName.replaceAll("\", ");
    artistName = artistName.replaceAll("''", "'");
    artistName = artistName.replaceAll("''", "'");
    artistName = artistName.replaceAll("'", "''");

    if (artistName.length < 1) {
        alert('Please enter a title');
        return;
    }

    const url = `${apiURL}/searchForArtist?artist=${artistName}`;

    fetch(url, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to get artists.")
        }

        return response.json();
    }).then(function(json) {
        console.log(json);

        if (json.error != null || json.results.length == 0) {
            if (json.results != null && json.results.length == 0) {
                json.error = 'Found 0 artists.';
            }

            const errorText = document.getElementById('errorMsgArtist');
            errorText.innerText = json.error;
            errorText.hidden = false;

            setTimeout(() => {
                errorText.hidden = true;
            }, 7000);
        } else {
            addArtistsToResults(json.results);
        }

    }).catch(function(error) {
        console.log(error);
        directBackHome('An unknown error has ocurred :(')
    });
}

function searchForArtistByGenre() {
    const genreId = document.getElementById('genreDropDown').value;

    const url = `${apiURL}/searchForArtist?genreId=${genreId}`;

    fetch(url, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Language': 'en-US',
    }).then(function(response) {
        if (response.status != 200) {
            directBackHome("Failed to get artists.")
        }

        return response.json();
    }).then(function(json) {
        console.log(json);

        if (json.error != null || json.results.length == 0) {
            if (json.results != null && json.results.length == 0) {
                json.error = 'Found 0 artists.';
            }

            const errorText = document.getElementById('errorMsgArtist');
            errorText.innerText = json.error;
            errorText.hidden = false;

            setTimeout(() => {
                errorText.hidden = true;
            }, 7000);
        } else {
            addArtistsToResults(json.results);
        }

    }).catch(function(error) {
        console.log(error);
        directBackHome('An unknown error has ocurred :(')
    });
}

function addArtistsToResults(artists) {
    const list = document.getElementById('artistList');
    list.innerHTML = "";

    for (let i = 0; i < artists.length; i++) {
        list.appendChild(getArtistLI(artists[i]));
    }
}

function getArtistLI(artist) {
    const li = `<li><a href=artistspecific.html?artistId=${artist.id}>${artist.name}</a>`;
    return htmlToElement(li);
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

const songTitleInput = document.getElementById('songTitle');
songTitleInput.addEventListener("keyup", function(event) {
    if (event.key == "Enter") {
        searchForSongByTitle();
    }
});

const songArtistInput = document.getElementById('songArtist');
songArtistInput.addEventListener("keyup", function(event) {
    if (event.key == "Enter") {
        searchForSongByArtist();
    }
});

const artistNameInput = document.getElementById('artistNameInput');
artistNameInput.addEventListener("keyup", function(event) {
    if (event.key == "Enter") {
        searchForArtistByName();
    }
});