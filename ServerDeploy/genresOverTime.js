const { graphWordsOverTime } = require("./words");

async function graphGenresOverTime(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');

        const statType = getStatType(req);
        const numGenres = getNumGenres(req);
        if (numGenres == -1) {
            console.log("invalid number of genres")
            res.status(400).send('error invalid number of genres').end();
            return;
        }

        let genreArray = getGenreArray(req, numGenres);
        if (genreArray == null) {
            console.log("error with genre parameters");
            res.status(400).send('error with genre parameters').end();
            return;
        }

        genreArray = await getGenreOverTimeFromDB(genreArray, statType, knex);
        if (genreArray == null) {
            console.log("failed to genres from database");
            res.status(400).send('error with genre parameters').end();
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ genres: genreArray, error: null }));
    } catch (err) {
        console.log(err);
        res.status(400);
        res.send("error try/catch");
    }

}

function getStatType(req) {
    let statsType = `${req.query.statType}`;

    if (statsType != 'uniqueness' && statsType != 'diversity' && statsType != 'stereotype' && statsType != 'num_words' &&
        statsType != 'clothing' && statsType != 'body' && statsType != 'alcohol' &&
        statsType != 'trucks' && statsType != 'god' && statsType != 'lifestyle') {

        statsType = 'uniqueness';
    }

    if (statsType == 'num_words') {
        statsType = 'words';
    }

    return statsType + '_over_time';
}

function getNumGenres(req) {
    let numGenres = parseInt(req.query.numGenres);

    if (numGenres == null || isNaN(numGenres) || numGenres < 1 || numGenres > 7) {
        return -1;
    }

    return numGenres
}

function getGenreArray(req, numGenres) {
    const genreArray = [];

    for (let i = 0; i < numGenres; i++) {
        const genreObject = getGenreObject(req, i);
        if (genreObject == null) {
            return null;
        }

        genreArray.push(genreObject);
    }

    return genreArray;
}

function getGenreObject(req, i) {
    let field = `genreId${i}`;

    let genreId = parseInt(req.query[field]);

    if (genreId == null || isNaN(genreId) || genreId < 0 || genreId > 29) {
        console.log("genre id is null");
        return null;
    }

    field = `min${i}`;
    let min = parseInt(req.query[field]);
    if (min == null || isNaN(min) || min < 0 || min > 100) {
        console.log("min is null");
        return null;
    }

    field = `max${i}`;
    let max = parseInt(req.query[field]);
    if (max == null || isNaN(max) || max < 0 || max > 100) {
        console.log("max is null");
        return null;
    }

    if (max < min) {
        console.log("max is less than min");
        return null;
    }

    return {
        genre_id: genreId,
        min: min,
        max: max,
    }
}

async function getGenreOverTimeFromDB(genreArray, statType, knex) {
    try {
        for (let i = 0; i < genreArray.length; i++) {
            const genre = genreArray[i];
            const stmt = getSelectStmt(genre, statType);
            const query = await knex.raw(stmt);
            const row = query.rows[0];
            genre.stat_over_time = [];

            for (let year = 2010; year <= 2020; year++) {
                const field = `year${year}`;
                genre.stat_over_time.push(row[field]);
            }
        }

        return genreArray
    } catch (err) {
        console.log(err);
        return null;
    }
}

function getSelectStmt(genre, statType) {
    let stmt = 'SELECT ';

    for (let i = 2; i < 13; i++) {
        stmt += `SUM(${statType}[${i}] * songs_over_time[${i}]) / NULLIF(SUM(songs_over_time[${i}]), 0) as year${i + 2010 - 2}`
        if (i != 12) {
            stmt += ',';
        }

        stmt += ' ';
    }

    stmt += `FROM popularity_data WHERE`
    stmt += ` (genre_id = ${genre.genre_id} AND popularity >= ${genre.min} AND popularity <= ${genre.max}) `;
    return stmt;
}



exports.graphGenresOverTime = graphGenresOverTime;