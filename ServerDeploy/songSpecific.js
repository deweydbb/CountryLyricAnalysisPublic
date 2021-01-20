async function setSongSpecific(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*')
        const songId = parseInt(req.query.songId);

        if (songId == null || isNaN(songId) || songId < 0) {
            res.status(404).send('error');
        } else {


            const songData = await knex.select('id', 'title', 'artist', 'artist_id', 'genre', 'genre_id', 'year', 'album', 'num_words', 'popularity',
                    'uniqueness', 'diversity', 'stereotype', 'clothing', 'body', 'alcohol', 'trucks', 'god', 'lifestyle', "spotify_image_link", "spotify_preview_link")
                .from('song_data')
                .where({ id: songId }).limit(1);

            if (songData.length == 1) {
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ songData: songData }));
            } else {
                res.status(404).send('error');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(400).send('error try/catch');
    }
}

exports.setSongSpecific = setSongSpecific;