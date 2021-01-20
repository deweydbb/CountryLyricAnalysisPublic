//start of search for song stuff
async function searchForSong(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const title = getTitle(req);
        const artist = getArtist(req);
        if (title == null && artist == null) {
            res.status(400).send({ error: "both artist and title are null" }).end();
            return;
        }

        let songResults;
        if (title != null) {
            songResults = await getSongsByTitle(title, knex);
        } else {
            songResults = await getSongsByArtist(artist, knex);
        }

        if (songResults == null) {
            res.status(400).send({ error: "failed to get results from database" }).end();
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(songResults));
    } catch (err) {
        console.log(err);
        res.status(400);
        res.send("error try/catch");
    }
}

function getTitle(req) {
    let title = req.query.title;
    return title;
}

function getArtist(req) {
    let artist = req.query.artist;
    return artist;
}

async function getSongsByTitle(title, knex) {
    try {
        let dist = 2;
        if (!isStringSafe(title)) {
            return { error: 'String not safe for query' };
        }

        const stmt = `SELECT id, title, artist, artist_id FROM song_data WHERE ` +
            `levenshtein_less_equal(UPPER('${title}'), UPPER(title), ${dist + 1}) <= ${dist} ` +
            `ORDER BY levenshtein(UPPER('${title}'), UPPER(title)), title LIMIT 30;`;

        const obj = await knex.raw(stmt);

        return { results: obj.rows }

    } catch (err) {
        console.log(err);
        return { error: 'unable to get songs from database' }
    }
}

async function getSongsByArtist(artist, knex) {
    if (!isStringSafe(artist)) {
        return { error: 'String not safe for query' };
    }

    const artistFromDB = await getArtistFromDB(artist, knex);
    if (artistFromDB == null) {
        return await getClosestArtistName(artist, knex);
    }

    const stmt = `SELECT id, title, artist, artist_id FROM song_data WHERE artist_id=${artistFromDB.id} ` +
        'ORDER BY title LIMIT 100;';

    const obj = await knex.raw(stmt);

    return { results: obj.rows };
}

async function getArtistFromDB(artist, knex) {
    try {
        let dist = 5;
        if (!isStringSafe(artist)) {
            return { error: 'String not safe for query' };
        }

        const stmt = `SELECT id, name FROM artist_data WHERE UPPER(name)=UPPER('${artist}') LIMIT 1;`;
        const obj = await knex.raw(stmt);

        return obj.rows[0];

    } catch (err) {
        console.log(err);
        return null;
    }
}

async function getClosestArtistName(artist, knex) {
    try {
        let dist = 5;
        if (!isStringSafe(artist)) {
            return { error: 'String not safe for query' };
        }

        const stmt = `SELECT name FROM artist_data WHERE ` +
            `levenshtein_less_equal(UPPER('${artist}'), UPPER(name), ${ dist + 1 }) <= ${ dist }` +
            `ORDER BY levenshtein(UPPER('${artist}'), UPPER(name)), name LIMIT 30;`;

        const obj = await knex.raw(stmt);

        return { error: `Unable to find artist. Did you possibly mean: ${ obj.rows[0].name }?` }
    } catch (err) {
        console.log(err);
        return { error: 'Unable to find artist' }
    }
}

function isStringSafe(string) {
    let numInRow = 0;

    for (let i = 0; i < string.length; i++) {
        const char = string.charAt(i);
        if (char === "'") {
            numInRow++;
        } else {
            if (numInRow != 0 && numInRow % 2 == 1) {
                return false;
            }
            numInRow = 0;
        }
    }

    return numInRow % 2 == 0;
}
// end of search for song stuff

// start of search for artist stuff
async function searchForArtist(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const genreId = getGenreId(req);
        const artistName = getArtistName(req);
        if (genreId == null && artistName == null) {
            res.status(400).send({ error: "both genreId and artist name are null" }).end();
            return;
        }

        let songResults;
        if (genreId != null) {
            songResults = await getArtistsByGenreId(genreId, knex);
        } else {
            songResults = await getArtistsByName(artistName, knex);
        }

        if (songResults == null) {
            res.status(200).send({ error: "failed to get results from database" }).end();
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(songResults));
    } catch (err) {
        console.log(err);
        res.status(400);
        res.send("error try/catch");
    }
}

function getGenreId(req) {
    let genreId = parseInt(req.query.genreId);
    if (isNaN(genreId) || genreId < 0 || genreId > 29) {
        return null;
    }

    return genreId;
}

function getArtistName(req) {
    let artist = req.query.artist;
    return artist;
}

async function getArtistsByGenreId(genreId, knex) {
    try {
        const stmt = `SELECT id, name FROM artist_data WHERE genre_id=${genreId} ORDER BY name LIMIT 200`;
        const obj = await knex.raw(stmt);

        return { results: obj.rows };

    } catch (err) {
        console.log(err);
        return { error: 'failed to get artists from database' };
    }
}

async function getArtistsByName(artistName, knex) {
    try {
        let dist = 4;
        if (!isStringSafe(artistName)) {
            return { error: 'String not safe for query' };
        }

        const stmt = `SELECT id, name FROM artist_data WHERE ` +
            `levenshtein_less_equal(UPPER('${artistName}'), UPPER(name), ${dist + 1}) <= ${dist} ` +
            `ORDER BY levenshtein(UPPER('${artistName}'), UPPER(name)), name LIMIT 30;`;
        const obj = await knex.raw(stmt);

        return { results: obj.rows }

    } catch (err) {
        console.log(err);
        return { error: 'unable to get songs from database' }
    }
}

// end of search for artist stuff


exports.searchForArtist = searchForArtist;
exports.searchForSong = searchForSong;