async function setRankWordsByUsage(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const genreId = getGenreId(req);
        const numResults = getNumResults(req);

        const wordData = await getWordData(knex, genreId, numResults);
        if (wordData.length != numResults) {
            res.status(404).send('get words error');
            return;
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ wordData: wordData }));
    } catch (err) {
        console.log(err);
        res.status(400);
        res.send("error try/catch");
    }
}

function getGenreId(req) {
    let genreId = parseInt(req.query.genreId);

    if (genreId == null || isNaN(genreId) || genreId < 0) {
        genreId = 29;
    }

    return genreId;
}

function getNumResults(req) {
    let numResults = parseInt(req.query.numResults);
    if (numResults == null || isNaN(numResults) ||
        (numResults != 15 && numResults != 30 && numResults != 50 && numResults != 100 && numResults != 200)) {
        numResults = 15;
    }

    return numResults;
}

async function getWordData(knex, genreId, numResults) {
    try {
        return await knex.select('id', 'word', 'uses_over_time[1]')
            .from('word_data')
            .where({ genre_id: genreId })
            .andWhere({ ignore: false })
            .orderBy('uses_over_time[1]', 'desc')
            .limit(numResults);
    } catch (err) {
        console.log(err);
        return [];
    }
}


// start of compare words over time stuff
async function graphWordsOverTime(req, res, knex) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const numWords = getNumWords(req);
        if (numWords == -1) {
            console.log("problem with num words");
            res.status(400);
            res.send("incorrect number of words");
            return;
        }

        const wordArray = getWordArray(req, numWords);
        if (wordArray == null) {
            console.log("problem with params")
            res.status(400);
            res.send("error parsing params");
            return;
        }

        const wordDataFromDB = await getWordOverTimeFromDB(wordArray, knex);
        if (wordDataFromDB == null) {
            console.log("problem getting db rows");
            res.status(400);
            res.send("error getting words from database");
            return;
        }

        matchWordToDBRow(wordArray, wordDataFromDB.rows);
        const wordNotFound = firstWordNotFound(wordArray)
        if (wordNotFound != null) {
            console.log("word not found", wordNotFound);
            res.status(200);
            res.send(JSON.stringify({ error: `Could not find word: ${wordNotFound}` }));
            return;
        }

        // all words have been found or are blank
        // now it is necessary to divide uses_over_time by songs_over_time for the appropriate genre
        const genreSongsOverTime = Array.apply(null, Array(30)).map(function() {});
        await divideUsesBySongs(wordArray, genreSongsOverTime, knex);

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ words: wordArray, error: null }));
    } catch (err) {
        console.log(err);
        res.status(400);
        res.send("error try/catch");
    }
}

function getNumWords(req) {
    let numWords = parseInt(req.query.numWords);

    if (numWords == null || isNaN(numWords) || numWords < 1 || numWords > 7) {
        return -1;
    }

    return numWords
}

function getWordArray(req, numWords) {
    const wordArray = [];

    for (let i = 0; i < numWords; i++) {
        const wordObject = getWordObject(req, i);
        if (wordObject == null) {
            return null;
        }

        wordArray.push(wordObject);
    }

    return wordArray;
}

function getWordObject(req, i) {
    let field = `genreId${i}`;

    let genreId = parseInt(req.query[field]);

    if (genreId == null || isNaN(genreId) || genreId < 0) {
        return null;
    }

    field = `word${i}`;
    let word = `${req.query[field]}`;

    if (word == null) {
        return null;
    }

    if (!isStringSafe(word)) {
        console.log(typeof word);
        word = word.replace(/'/g, "''");
    }

    return {
        id: i,
        word: word,
        genre_id: genreId,
        isBlank: word == '',
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

async function getWordOverTimeFromDB(wordArray, knex) {
    try {
        let stmt = 'SELECT word, genre_id, uses_over_time FROM word_data WHERE ';
        for (let i = 0; i < wordArray.length; i++) {
            const word = wordArray[i];
            if (!word.isBlank) {
                stmt = stmt + `(word='${word.word}' AND genre_id=${word.genre_id}) OR`
            }

            word.word = word.word.replace(/''/g, "'");
        }

        stmt = stmt + ' id=0;'
        console.log((await knex.raw(stmt)).rows);
        return await knex.raw(stmt);

    } catch (err) {
        console.log(err);
    }

    return [];
}

function matchWordToDBRow(wordArray, dbRows) {
    for (let wordIndex = 0; wordIndex < wordArray.length; wordIndex++) {
        const wordObject = wordArray[wordIndex];
        if (wordObject.isBlank) {
            wordObject.found = false;
        } else {
            matchWordObject(wordObject, dbRows);
        }
    }
}

function matchWordObject(wordObject, dbRows) {
    for (let dbIndex = 0; dbIndex < dbRows.length; dbIndex++) {
        const row = dbRows[dbIndex];
        if (wordObject.word == row.word && wordObject.genre_id == row.genre_id) {
            wordObject.found = true;
            wordObject.uses_over_time = row.uses_over_time.slice();

            return;
        }

    }

    wordObject.found = false;
    wordObject.uses_over_time = null;
}

function firstWordNotFound(wordArray) {
    for (let i = 0; i < wordArray.length; i++) {
        const word = wordArray[i];
        if (word.found == false && word.isBlank == false) {
            return word.word;
        }
    }

    return null;
}

async function divideUsesBySongs(wordArray, genreSongsOverTime, knex) {
    for (let i = 0; i < wordArray.length; i++) {
        const word = wordArray[i];
        let genreNumSongs = genreSongsOverTime[word.genre_id];

        if (genreNumSongs == null) {
            // genre uses not cached in array, fetch from database
            genreNumSongs = await getGenreSongs(word.genre_id, knex);
            if (genreNumSongs == null) {
                return false;
            }
        }

        divide(word, genreNumSongs);
    }

    return true;
}

async function getGenreSongs(genreId, knex) {
    try {
        const array = await knex.select('songs_over_time')
            .from('genre_data')
            .where({ id: genreId })
            .limit(1);

        return array[0].songs_over_time;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function divide(word, genreNumSongs) {
    try {
        for (let i = 0; i < word.uses_over_time.length; i++) {
            word.uses_over_time[i] /= genreNumSongs[i];
        }
    } catch (err) {

    }
}

exports.setRankWordsByUsage = setRankWordsByUsage;
exports.graphWordsOverTime = graphWordsOverTime;