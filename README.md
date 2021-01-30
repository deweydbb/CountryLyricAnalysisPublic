# Public Lyric Analysis Public

Websites
- [CountryLyricAnalysis.com](CountryLyricAnalysis.com)
- [Whiskey Riff Article](https://www.whiskeyriff.com/2021/01/19/trucks-tan-legs-and-beer-analyzing-the-lyrics-of-14500-country-songs-from-the-past-10-years/)

## Project File Description
 - DeployWebsite/public
     -  Holds all html/css/javascript for the [website](https://countrylyricanalysis.com/)
 - PopulateDatabase/
     - Some of the java files used to insert and update values into the database
 - ServerDeploy/
     - NodeJS project that is the backend service for the website. Connects database to website
     
## Database table desccriptions

### Song Data
|        Column        |          Type          | Collation | Nullable |
|----------------------|------------------------|-----------|----------|
| id                   | integer                |           | not null |
| title                | character varying(255) |           | not null |
| artist               | character varying(255) |           | not null |                                 
| album                | character varying(255) |           | not null |
| lyric_id             | integer                |           |          |
| year                 | integer                |           | not null |
| popularity           | integer                |           | not null |
| genre                | character varying(50)  |           |          |
| artist_id            | integer                |           |          |
| genre_id             | integer                |           |          |
| uniqueness           | double precision       |           |          |
| diversity            | double precision       |           |          |
| stereotype           | double precision       |           |          |
| clothing             | double precision       |           |          |
| body                 | double precision       |           |          |
| alcohol              | double precision       |           |          |
| trucks               | double precision       |           |          |
| god                  | double precision       |           |          |
| lifestyle            | double precision       |           |          |
| num_words            | smallint               |           |          |
| spotify_track_id     | text                   |           |          |
| spotify_image_link   | text                   |           |          |
| spotify_preview_link | text                   |           |          |

- Indexes:
  -  "song_data_pkey" PRIMARY KEY, btree (id)
- Foreign-key constraints:
  -  "song_data_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artist_data(id)
  -  "song_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
  -  "song_data_lyric_id_fkey" FOREIGN KEY (lyric_id) REFERENCES lyrics(id)
  
### Artist Data
|          Column      |          Type          | Collation | Nullable |                 
|----------------------|------------------------|-----------|----------|
| id                   | integer                |           | not null |
| name                 | character varying(255) |           | not null |
| genre_id             | integer                |           |          |
| songs_over_time      | integer[]              |           |          |
| popularity_over_time | double precision[]     |           |          |
| uniqueness_over_time | double precision[]     |           |          |
| diversity_over_time  | double precision[]     |           |          |
| stereotype_over_time | double precision[]     |           |          |
| clothing_over_time   | double precision[]     |           |          |
| body_over_time       | double precision[]     |           |          |
| alcohol_over_time    | double precision[]     |           |          |
| trucks_over_time     | double precision[]     |           |          |
| god_over_time        | double precision[]     |           |          |
| lifestyle_over_time  | double precision[]     |           |          |
| words_over_time      | double precision[]     |           |          |
| genre                | character varying(255) |           |          |
| spotify_artist_id    | text                   |           |          |
| spotify_image_link   | text                   |           |          |
| is_female            | boolean                |           |          |
- Indexes:
  -  "artist_data_pkey" PRIMARY KEY, btree (id)
  -  "artist_data_name_key" UNIQUE CONSTRAINT, btree (name)
- Foreign-key constraints:
  -  "artist_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
- Referenced by:
  -  TABLE "song_data" CONSTRAINT "song_data_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artist_data(id)
  
### Genre Data
|         Column       |         Type          | Collation | Nullable |                
|----------------------|-----------------------|-----------|----------|
| id                   | integer               |           | not null | 
| name                 | character varying(50) |           | not null |
| num_artists          | smallint              |           |          |
| songs_over_time      | integer[]             |           |          |
| popularity_over_time | double precision[]    |           |          |
| uniqueness_over_time | double precision[]    |           |          |
| diversity_over_time  | double precision[]    |           |          |
| stereotype_over_time | double precision[]    |           |          |
| clothing_over_time   | double precision[]    |           |          |
| body_over_time       | double precision[]    |           |          |
| alcohol_over_time    | double precision[]    |           |          |
| trucks_over_time     | double precision[]    |           |          |
| god_over_time        | double precision[]    |           |          |
| lifestyle_over_time  | double precision[]    |           |          |
| words_over_time      | double precision[]    |           |          |
- Indexes:
  -  "genre_data_pkey" PRIMARY KEY, btree (id)
  -  "genre_data_name_key" UNIQUE CONSTRAINT, btree (name)
- Referenced by:
  -  TABLE "artist_data" CONSTRAINT "artist_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
  -  TABLE "popularity_data" CONSTRAINT "popularity_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
  -  TABLE "song_data" CONSTRAINT "song_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
  -  TABLE "word_data" CONSTRAINT "word_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
  
### Word Data
|     Column     |   Type    | Collation | Nullable |                
|----------------|-----------|-----------|----------|
| id             | integer   |           | not null |
| word           | text      |           | not null |
| genre_id       | integer   |           |          |
| uses_over_time | integer[] |           |          |
| ignore         | boolean   |           | not null |
- Indexes:
  -  "word_data_pkey" PRIMARY KEY, btree (id)
  -  "word_data_word_genre_id_key" UNIQUE CONSTRAINT, btree (word, genre_id)
- Foreign-key constraints:
  -  "word_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
  
### Popularity Data
|         Column       |        Type        | Collation | Nullable |                   
|----------------------|--------------------|-----------|----------|
| id                   | integer            |           | not null |
| popularity           | integer            |           |          |
| genre_id             | integer            |           |          |
| songs_over_time      | integer[]          |           |          |
| uniqueness_over_time | double precision[] |           |          |
| diversity_over_time  | double precision[] |           |          |
| stereotype_over_time | double precision[] |           |          |
| clothing_over_time   | double precision[] |           |          |
| body_over_time       | double precision[] |           |          |
| alcohol_over_time    | double precision[] |           |          |
| trucks_over_time     | double precision[] |           |          |
| god_over_time        | double precision[] |           |          |
| lifestyle_over_time  | double precision[] |           |          |
| words_over_time      | double precision[] |           |          |
- Indexes:
  -  "popularity_data_pkey" PRIMARY KEY, btree (id)
  -  "popularity_data_popularity_genre_id_key" UNIQUE CONSTRAINT, btree (popularity, genre_id)
- Foreign-key constraints:
  -  "popularity_data_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre_data(id)
  
  
### Lyrics
| Column |  Type   | Collation | Nullable |              
|--------|---------|-----------|----------|
| id     | integer |           | not null | 
| lyrics | text    |           | not null |
- Indexes:
  -  "lyrics_pkey" PRIMARY KEY, btree (id)
- Referenced by:
  -  TABLE "song_data" CONSTRAINT "song_data_lyric_id_fkey" FOREIGN KEY (lyric_id) REFERENCES lyrics(id)
