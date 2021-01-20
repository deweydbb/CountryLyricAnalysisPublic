async function setArtistSpecific(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*')
        const artistId = parseInt(req.query.artistId);

        if (artistId == null || isNaN(artistId) || artistId < 0) {
            res.status(404).send('error');
        } else {

            const artistData = await knex.select('id', 'name', 'genre', 'genre_id', 'songs_over_time', 'popularity_over_time', 'uniqueness_over_time',
                    'diversity_over_time', 'stereotype_over_time', 'clothing_over_time', 'body_over_time',
                    'alcohol_over_time', 'trucks_over_time', 'god_over_time', 'lifestyle_over_time', 'words_over_time', "spotify_image_link", "spotify_artist_id")
                .from('artist_data')
                .where({ id: artistId }).limit(1);

            const topSongs = await getTopSongs(artistData[0].id, knex);

            if (artistData.length == 1 && topSongs.length > 0) {
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ artistData: artistData, topSongs: topSongs }));
            } else {
                res.status(404).send('error');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(400).send('error try/catch');
    }
}

async function getTopSongs(artistId, knex) {
    try {
        let topSongs = await knex.select('id', 'title', 'popularity')
            .from('song_data')
            .where({ artist_id: artistId })
            .orderBy('popularity', 'desc')
            .limit(10);

        return topSongs;
    } catch (err) {
        console.log(err);
        return [];
    }
}

exports.setArtistSpecific = setArtistSpecific;