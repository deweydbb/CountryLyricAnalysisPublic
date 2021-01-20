async function setGenreSpecific(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*')
        const genreId = parseInt(req.query.genreId);

        if (genreId == null || isNaN(genreId) || genreId < 0) {
            res.status(404).send('error');
        } else {
            const genreData = await knex.select('id', 'name', 'num_artists', 'songs_over_time', 'popularity_over_time', 'uniqueness_over_time[1]',
                    'diversity_over_time[1]', 'stereotype_over_time[1]', 'clothing_over_time[1]', 'body_over_time[1]',
                    'alcohol_over_time[1]', 'trucks_over_time[1]', 'god_over_time[1]', 'lifestyle_over_time[1]', 'words_over_time[1]')
                .from('genre_data')
                .where({ id: genreId }).limit(1);

            const topArtists = await getTopArtists(genreId, knex);
            if (genreData.length == 1 && topArtists.length > 0) {
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ genreData: genreData, topArtists: topArtists }));
            } else {
                res.status(404).send('error');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(400).send('error try/catch');
    }
}

async function getTopArtists(genreId, knex) {
    try {
        let topSongs
        if (genreId == 29) {
            topSongs = await knex.select('id', 'name', 'popularity_over_time[1]')
                .from('artist_data')
                .andWhere(function() {
                    this.where('songs_over_time[1]', '>', 5)
                })
                .orderBy('popularity_over_time[1]', 'desc')
                .limit(10);
        } else {
            topSongs = await knex.select('id', 'name', 'popularity_over_time[1]')
                .from('artist_data')
                .where({ genre_id: genreId })
                .andWhere(function() {
                    this.where('songs_over_time[1]', '>', 5)
                })
                .orderBy('popularity_over_time[1]', 'desc')
                .limit(10);
        }

        return topSongs;
    } catch (err) {
        console.log(err);
        return [];
    }
}

exports.setGenreSpecific = setGenreSpecific;