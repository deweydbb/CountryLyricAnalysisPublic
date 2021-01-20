import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.TreeSet;

public class ArtistTable {

    public static void main(String[] args) {
        String file = "D:/System Folders/Desktop/CountryMusic/cleanedLyrics.txt";
        ArrayList<TrackFromFile> trackFromFiles = TrackFromFile.loadTracksFromFile(file);

        Connection conn = connect();
        if (conn == null) {
            System.exit(1);
        }

        TreeSet<String> artistNames = new TreeSet<>();

        for (TrackFromFile track: trackFromFiles) {
            artistNames.add(track.artist);
        }

        ArrayList<Artist> artists = new ArrayList<>();

        for (String name : artistNames) {
            Artist a = new Artist();
            a.name = name;
            artists.add(a);
        }

        System.out.println("getting all genre ids");
        setAllGenres(artists, conn);

        for (Artist artist : artists) {
            System.out.println("name: " + artist.name);
            ArrayList<Song> songs = getAllArtistsSongs(artist, conn);

            setNumSongs(artist, songs);
            setOverallTotals(artist, songs);
            setAverages(artist, songs);

            artist.updateRow(conn);
        }

    }

    private static void setAllGenres(ArrayList<Artist> artists, Connection conn) {
        final String SELECT_STMT = "SELECT id, name FROM genre_data";

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            HashMap<String, Integer> genreNameIdMap = new HashMap<>();

            while (rs.next()) {
                int id = rs.getInt(1);
                String name = rs.getString(2);

                genreNameIdMap.put(name, id);
            }

            for (Artist artist : artists) {
                String genreName = Genre.getArtistGenre(artist.name);
                artist.genreId = genreNameIdMap.get(genreName);
                artist.genre = genreName;
            }

        } catch (SQLException e) {
            System.out.println("failed in [setAllGenres]");
            System.out.println(e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static ArrayList<Song> getAllArtistsSongs(Artist artist, Connection conn) {
        String selectStmt = "SELECT year, popularity, uniqueness, diversity, stereotype, clothing, body, alcohol, " +
                "trucks, god, lifestyle, num_words FROM song_data WHERE artist='" + artist.name.replaceAll("'", "''") + "';";
        try {
            PreparedStatement pst = conn.prepareStatement(selectStmt);
            ResultSet rs = pst.executeQuery();

            ArrayList<Song> songs = new ArrayList<>();

            while (rs.next()) {
                Song song = new Song();
                song.year = rs.getInt(1);
                song.popularity = rs.getInt(2);
                song.uniqueness = rs.getDouble(3);
                song.diversity = rs.getDouble(4);
                song.stereotype = rs.getDouble(5);
                song.clothing = rs.getDouble(6);
                song.body = rs.getDouble(7);
                song.alcohol = rs.getDouble(8);
                song.trucks = rs.getDouble(9);
                song.god = rs.getDouble(10);
                song.lifestyle = rs.getDouble(11);
                song.numWords = rs.getInt(12);

                songs.add(song);
            }

            return songs;
        } catch (SQLException e) {
            System.out.println("failed in [getAllArtistsSongs]");
            System.out.println(e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }

        return null;
    }

    private static void setNumSongs(Artist artist, ArrayList<Song> songs) {
        final int START_YEAR = 2010;

        for (Song song : songs) {
            int index = song.year - START_YEAR + 1; // plus one offset because 0 index is total of array
            artist.songsOverTime[0]++;
            artist.songsOverTime[index]++;
        }
    }

    private static void setOverallTotals(Artist artist, ArrayList<Song> songs) {
        final int START_YEAR = 2010;

        for (Song song : songs) {
            int index = song.year - START_YEAR + 1; // plus one b/c index 0 is total of array

            artist.popularityOverTime[0] += song.popularity;
            artist.popularityOverTime[index] += song.popularity;

            artist.uniquenessOverTime[0] += song.uniqueness;
            artist.uniquenessOverTime[index] += song.uniqueness;

            artist.diversityOverTime[0] += song.diversity;
            artist.diversityOverTime[index] += song.diversity;

            artist.stereotypeOverTime[0] += song.stereotype;
            artist.stereotypeOverTime[index] += song.stereotype;

            artist.clothingOverTime[0] += song.clothing;
            artist.clothingOverTime[index] += song.clothing;

            artist.bodyOverTime[0] += song.body;
            artist.bodyOverTime[index] += song.body;

            artist.alcoholOverTime[0] += song.alcohol;
            artist.alcoholOverTime[index] += song.alcohol;

            artist.trucksOverTime[0] += song.trucks;
            artist.trucksOverTime[index] += song.trucks;

            artist.godOverTime[0] += song.god;
            artist.godOverTime[index] += song.god;

            artist.lifestyleOverTime[0] += song.lifestyle;
            artist.lifestyleOverTime[index] += song.lifestyle;

            artist.wordsOverTime[0] += song.numWords;
            artist.wordsOverTime[index] += song.numWords;
        }
    }

    private static void setAverages(Artist artist, ArrayList<Song> songs) {

        for (int i = 0; i < artist.songsOverTime.length; i++) {
            if (artist.songsOverTime[i] != 0) {
                artist.popularityOverTime[i] /= artist.songsOverTime[i];
                artist.uniquenessOverTime[i] /= artist.songsOverTime[i];
                artist.diversityOverTime[i] /= artist.songsOverTime[i];
                artist.stereotypeOverTime[i] /= artist.songsOverTime[i];
                artist.clothingOverTime[i] /= artist.songsOverTime[i];
                artist.bodyOverTime[i] /= artist.songsOverTime[i];
                artist.alcoholOverTime[i] /= artist.songsOverTime[i];
                artist.trucksOverTime[i] /= artist.songsOverTime[i];
                artist.godOverTime[i] /= artist.songsOverTime[i];
                artist.lifestyleOverTime[i] /= artist.songsOverTime[i];
                artist.wordsOverTime[i] /= artist.songsOverTime[i];
            }
        }
    }

    private static Connection connect() {
        try {
            return DriverManager.getConnection("", "", "");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    private static class Artist {
        private String name;
        private int genreId;
        private String genre;
        private Integer[] songsOverTime;
        private Double[] popularityOverTime;
        private Double[] uniquenessOverTime;
        private Double[] diversityOverTime;
        private Double[] stereotypeOverTime;
        private Double[] clothingOverTime;
        private Double[] bodyOverTime;
        private Double[] alcoholOverTime;
        private Double[] trucksOverTime;
        private Double[] godOverTime;
        private Double[] lifestyleOverTime;
        private Double[] wordsOverTime;

        @Override
        public String toString() {
            StringBuilder res = new StringBuilder();

            res.append(name);
            res.append("\t");
            res.append(genreId);
            res.append("\n");
            res.append(Arrays.toString(songsOverTime));
            res.append("\n");
            res.append(Arrays.toString(popularityOverTime));
            res.append("\n");
            res.append(Arrays.toString(uniquenessOverTime));
            res.append("\n");
            res.append(Arrays.toString(diversityOverTime));
            res.append("\n");
            res.append(Arrays.toString(stereotypeOverTime));
            res.append("\n");
            res.append(Arrays.toString(clothingOverTime));
            res.append("\n");
            res.append(Arrays.toString(bodyOverTime));
            res.append("\n");
            res.append(Arrays.toString(alcoholOverTime));
            res.append("\n");
            res.append(Arrays.toString(trucksOverTime));
            res.append("\n");
            res.append(Arrays.toString(godOverTime));
            res.append("\n");
            res.append(Arrays.toString(lifestyleOverTime));
            res.append("\n");
            res.append(Arrays.toString(wordsOverTime));
            res.append("\n");

            return res.toString();
        }

        public Artist(){
            songsOverTime = new Integer[]{0,0,0,0,0,0,0,0,0,0,0,0};
            popularityOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            uniquenessOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            diversityOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            stereotypeOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            clothingOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            bodyOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            alcoholOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            trucksOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            godOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            lifestyleOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
            wordsOverTime = new Double[]{0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0};
        }

        private void updateRow(Connection connection) {
            final String SQL_UPDATE = "UPDATE artist_data "
                    + "SET name = ?, songs_over_time = ?, popularity_over_time = ?, uniqueness_over_time = ?, " +
                    "diversity_over_time = ?, stereotype_over_time = ?, clothing_over_time = ?, body_over_time = ?, alcohol_over_time = ?, trucks_over_time = ?," +
                    " god_over_time = ?, lifestyle_over_time = ?, words_over_time = ? "
                    + "WHERE name = ?;";

            try {
                PreparedStatement pstmt = connection.prepareStatement(SQL_UPDATE);
                pstmt.setString(1, name);
                pstmt.setArray(2, connection.createArrayOf("integer", songsOverTime));
                pstmt.setArray(3, connection.createArrayOf("float", popularityOverTime));
                pstmt.setArray(4, connection.createArrayOf("float", uniquenessOverTime));
                pstmt.setArray(5, connection.createArrayOf("float", diversityOverTime));
                pstmt.setArray(6, connection.createArrayOf("float", stereotypeOverTime));
                pstmt.setArray(7, connection.createArrayOf("float", clothingOverTime));
                pstmt.setArray(8, connection.createArrayOf("float", bodyOverTime));
                pstmt.setArray(9, connection.createArrayOf("float", alcoholOverTime));
                pstmt.setArray(10, connection.createArrayOf("float", trucksOverTime));
                pstmt.setArray(11, connection.createArrayOf("float", godOverTime));
                pstmt.setArray(12, connection.createArrayOf("float", lifestyleOverTime));
                pstmt.setArray(13, connection.createArrayOf("float", wordsOverTime));
                pstmt.setString(14, name);

                int affectedRows = pstmt.executeUpdate();

            } catch (SQLException e) {
                System.out.println("ERROR IN UPDATE ROW");
                System.out.println(e.getMessage());
                System.out.println(e.getSQLState());
                System.out.println(e.getErrorCode());
            }
        }
    }

    private static class Song {
        private int year;
        private int popularity;
        private double uniqueness;
        private double diversity;
        private double stereotype;
        private double clothing;
        private double body;
        private double alcohol;
        private double trucks;
        private double god;
        private double lifestyle;
        private double numWords;


    }
}
