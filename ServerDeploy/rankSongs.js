async function setRankSongsByPop(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*')

        const popYear = getPopYear(req);
        const popNumResults = getPopNumResults(req);

        const songsByPop = await getPopularity(knex, popYear, popNumResults);
        if (songsByPop.length != popNumResults) {
            res.status(404).send('get popularity error');
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ songsByPop: songsByPop }));

    } catch (err) {
        console.log(err);
        res.status(400).send('error try/catch');
    }
}

function getPopYear(req) {
    let popYear = parseInt(req.query.popYear);
    if (popYear == null || isNaN(popYear) || popYear < 2010 || popYear > 2020) {
        popYear = 0;
    }

    return popYear;
}

function getPopNumResults(req) {
    let popNumResults = parseInt(req.query.popNumResults);
    if (popNumResults == null || isNaN(popNumResults) ||
        (popNumResults != 15 && popNumResults != 30 && popNumResults != 50 && popNumResults != 100 && popNumResults != 200)) {
        popNumResults = 15;
    }

    return popNumResults;
}

async function getPopularity(knex, popYear, popNumResults) {
    let songsByPop;
    if (popYear == 0) {
        // get all years
        songsByPop = await knex.select('id', 'title', 'artist', 'artist_id', 'popularity')
            .from('song_data')
            .orderBy('popularity', 'desc')
            .limit(popNumResults);
    } else {
        // get specific year
        songsByPop = await knex.select('id', 'title', 'artist', 'artist_id', 'popularity')
            .from('song_data')
            .where({ year: popYear })
            .orderBy('popularity', 'desc')
            .limit(popNumResults);
    }

    return songsByPop;
}

// rank songs by stats 
async function setRankSongsByStats(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*')
        const statsNumResults = getStatsNumResults(req);
        const statsOrder = getStatsOrder(req);
        const statsType = getStatsType(req);
        const stereotype = getStereotype(req);

        const songsByStat = await getStatistics(knex, statsType, stereotype, statsNumResults, statsOrder);
        if (songsByStat.length != statsNumResults) {
            res.status(404).send('get stats error');
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ songsByStat: songsByStat }));
    } catch (err) {
        console.log(err);
        res.status(400).send('error try/catch');
    }
}

function getStatsType(req) {
    let statsType = req.query.statsType;
    if (statsType != 'uniqueness' && statsType != 'diversity' && statsType != 'stereotype' && statsType != 'num_words') {
        statsType = 'uniqueness';
    }

    return statsType;
}

function getStereotype(req) {
    let stereotype = req.query.stereotype;
    if (stereotype != 'overall' && stereotype != 'clothing' && stereotype != 'body' && stereotype != 'alcohol' &&
        stereotype != 'trucks' && stereotype != 'god' && stereotype != 'lifestyle') {
        stereotype = 'overall';
    }

    return stereotype;
}

function getStatsNumResults(req) {
    let popNumResults = parseInt(req.query.statsNumResults);
    if (popNumResults == null || isNaN(popNumResults) ||
        (popNumResults != 15 && popNumResults != 30 && popNumResults != 50 && popNumResults != 100 && popNumResults != 200)) {
        popNumResults = 15;
    }

    return popNumResults;
}

function getStatsOrder(req) {
    let statsOrder = req.query.statsOrder;
    if (statsOrder != 'desc' && statsOrder != 'asc') {
        statsOrder = 'desc';
    }

    return statsOrder;
}

async function getStatistics(knex, statsType, stereotype, numResults, order) {
    let stat = statsType;
    if (stat == 'stereotype' && stereotype != 'overall') {
        stat = stereotype;
    }

    return await knex.select('id', 'title', 'artist', 'artist_id', stat)
        .from('song_data')
        .orderBy(stat, order)
        .limit(numResults);
}

exports.setRankSongsByPop = setRankSongsByPop;
exports.setRankSongsByStats = setRankSongsByStats;