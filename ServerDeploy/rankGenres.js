async function setRankGenresByPop(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*')

        const year = getPopYear(req);
        const numResults = getPopNumResults(req);

        const genresByPop = await getPopularity(knex, year, numResults);
        if (Math.abs(genresByPop.length - numResults) > 1) {
            res.status(404).send('get popularity error');
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ genresByPop: genresByPop }));

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
        (popNumResults != 15 && popNumResults != 30)) {
        popNumResults = 15;
    }

    return popNumResults;
}

async function getPopularity(knex, popYear, popNumResults) {
    //POSGRES ARRAYS ARE INDEX BY 1
    const index = popYear === 0 ? 1 : popYear - 2010 + 2; // plus one because 1 is overall, 2 is 2010 and so on

    let artistsByPop = await knex.select('id', 'name', `popularity_over_time[${index}]`)
        .from('genre_data')
        .orderBy(`popularity_over_time[${index}]`, 'desc')
        .limit(popNumResults);

    return artistsByPop;
}
// end of popularity stuff

// start of stat stuff
async function setRankGenresByStat(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const numResults = getStatsNumResults(req);
        const statsOrder = getStatsOrder(req);
        const statsType = getStatsType(req);
        const stereotype = getStereotype(req);

        const genresByStat = await getStatistics(knex, statsType, stereotype, numResults, statsOrder);
        if (Math.abs(genresByStat.length - numResults) > 1) {
            res.status(404).send('get stats error');
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ genresByStat: genresByStat }));
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
        (popNumResults != 15 && popNumResults != 30)) {
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
    if (stat == 'num_words') {
        stat = 'words';
    }

    stat = `${stat}_over_time[1]`; //POSTGRES ARRAYS ARE INDEX BY 1

    return await knex.select('id', 'name', stat)
        .from('genre_data')
        .orderBy(stat, order)
        .limit(numResults);
}


exports.setRankGenresByPop = setRankGenresByPop;
exports.setRankGenresByStat = setRankGenresByStat;