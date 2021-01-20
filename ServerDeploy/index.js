'use strict';

const { setSongSpecific } = require('./songSpecific');
const rankSongs = require('./rankSongs');
const { setArtistSpecific } = require('./artistSpecific');
const rankArtists = require('./rankArtists');
const { setGenreSpecific } = require('./genreSpecific');
const rankGenres = require('./rankGenres');
const rankWords = require('./words');
const graphGenres = require('./genresOverTime');
const search = require('./searchForSong');

// Require process, so we can mock environment variables.
const express = require('express');
const process = require('process');

const Knex = require('knex');

const app = express();

// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
let pool;

// [START cloud_sql_postgres_knex_create_socket]
const createUnixSocketPool = config => {
    const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';

    // Establish a connection to the database
    return Knex({
        client: 'pg',
        connection: {
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            host: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
        },
        config
    });
};
// [END cloud_sql_postgres_knex_create_socket]

// Initialize Knex, a Node.js SQL query builder library with built-in connection pooling.
const createPool = () => {
    const config = { pool: {} };
    config.pool.max = 1;
    config.pool.min = 15;
    config.pool.acquireTimeoutMillis = 60000;
    config.createTimeoutMillis = 30000;
    config.idleTimeoutMillis = 600000;
    config.createRetryIntervalMillis = 200;

    return createUnixSocketPool(config);
};

// start of song stuff 
app.get('/getSpecificSong', async function(req, res) {
    pool = pool || createPool();
    await setSongSpecific(req, res, pool);
});

app.get('/rankSongsByPop', async function(req, res) {
    pool = pool || createPool();
    await rankSongs.setRankSongsByPop(req, res, pool);
});

app.get('/rankSongsByStat', async function(req, res) {
    pool = pool || createPool();
    await rankSongs.setRankSongsByStats(req, res, pool);
});
// end of song stuff

//start of artist stuff
app.get('/getSpecificArtist', async function(req, res) {
    pool = pool || createPool();
    await setArtistSpecific(req, res, pool);
});

app.get('/rankArtistsByPop', async function(req, res) {
    pool = pool || createPool();
    await rankArtists.setRankArtistsByPop(req, res, pool);
});

app.get('/rankArtistsByStat', async function(req, res) {
    pool = pool || createPool();
    await rankArtists.setRankArtistsByStats(req, res, pool);
});
// end of artist stuff

// start of genre stuff
app.get('/getSpecificGenre', async function(req, res) {
    pool = pool || createPool();
    await setGenreSpecific(req, res, pool);
});

app.get('/rankGenresByPop', async function(req, res) {
    pool = pool || createPool();
    await rankGenres.setRankGenresByPop(req, res, pool);
});

app.get('/rankGenresByStat', async function(req, res) {
    pool = pool || createPool();
    await rankGenres.setRankGenresByStat(req, res, pool);
});
// end of genre stuff

// start of word stuff
app.get('/rankWordsByUsage', async function(req, res) {
    pool = pool || createPool();
    await rankWords.setRankWordsByUsage(req, res, pool);
});

app.get('/graphWordsOverTime', async function(req, res) {
    pool = pool || createPool();
    await rankWords.graphWordsOverTime(req, res, pool);
});
// end of word stuff

// start of lyrics/genre compare stuff
app.get('/graphGenresOverTime', async function(req, res) {
    pool = pool || createPool();
    await graphGenres.graphGenresOverTime(req, res, pool);
});
// end of lyrics/genre compare stuff

// start of search
app.get('/searchForSong', async function(req, res) {
    pool = pool || createPool();
    await search.searchForSong(req, res, pool);
});

app.get('/searchForArtist', async function(req, res) {
    pool = pool || createPool();
    await search.searchForArtist(req, res, pool);
});
// end of search

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

module.exports = server;