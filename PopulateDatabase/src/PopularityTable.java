import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;

public class PopularityTable {

    public static void main(String[] args) {
        Connection conn = connect();
        if (conn == null) {
            System.out.println("failed to connect to database");
            System.exit(1);
        }

        ArrayList<Genre> genres = getAllGenres(conn);
        for (int pop = 0; pop <= 100; pop++) {
            for (Genre genre : genres) {
                // make sure it is not all artists
                if (genre.id != 29) {
                    PopularityRow popularityRow = new PopularityRow();
                    popularityRow.popularity = pop;
                    popularityRow.genre_id = genre.id;

                    setValues(conn, popularityRow);
                    popularityRow.updateRow(conn);
                } else {
                    PopularityRow popularityRow = new PopularityRow();
                    popularityRow.popularity = pop;
                    popularityRow.genre_id = genre.id;

                    setValuesAllGenre(conn, popularityRow);
                    popularityRow.updateRow(conn);
                }
            }
            System.out.println("finished popularity: " + pop);
        }
        
    }

    private static void setValuesAllGenre(Connection conn, PopularityRow popularityRow) {
        for (int year = 2010; year <= 2020; year++) {
            setValuesFromYearAll(conn, popularityRow, year);
        }

        setValuesFromYearAll(conn, popularityRow, 0);
    }

    private static void setValuesFromYearAll(Connection conn, PopularityRow popularityRow, int year) {
        String SELECT_STMT = "SELECT COUNT(id), AVG(uniqueness), AVG(diversity), AVG(stereotype), AVG(clothing), " +
                "AVG(body), AVG(alcohol), AVG(trucks), AVG(god), AVG(lifestyle), AVG(num_words) FROM song_data " +
                "WHERE popularity=" + popularityRow.popularity;

        if (year != 0) {
            SELECT_STMT += " AND year=" + year + ";";
        } else {
            SELECT_STMT += ";";
        }

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            int index = year - 2010 + 1; // plus one because 0 index is for sum
            if (year == 0) {
                index = 0;
            }

            while (rs.next()) {
                popularityRow.songsOverTime[index] = rs.getInt(1);
                popularityRow.uniquenessOverTime[index] = rs.getDouble(2);
                popularityRow.diversityOverTime[index] = rs.getDouble(3);
                popularityRow.stereotypeOverTime[index] = rs.getDouble(4);
                popularityRow.clothingOverTime[index] = rs.getDouble(5);
                popularityRow.bodyOverTime[index] = rs.getDouble(6);
                popularityRow.alcoholOverTime[index] = rs.getDouble(7);
                popularityRow.trucksOverTime[index] = rs.getDouble(8);
                popularityRow.godOverTime[index] = rs.getDouble(9);
                popularityRow.lifestyleOverTime[index] = rs.getDouble(10);
                popularityRow.wordsOverTime[index] = rs.getDouble(11);
            }

        } catch (SQLException e) {
            System.out.println("failed in [setValuesFromYear]");
            System.out.println(e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void setValues(Connection conn, PopularityRow popularityRow) {
        for (int year = 2010; year <= 2020; year++) {
            setValuesFromYear(conn, popularityRow, year);
        }

        setValuesFromYear(conn, popularityRow, 0);
    }

    private static void setValuesFromYear(Connection conn, PopularityRow popularityRow, int year) {
        String SELECT_STMT = "SELECT COUNT(id), AVG(uniqueness), AVG(diversity), AVG(stereotype), AVG(clothing), " +
                "AVG(body), AVG(alcohol), AVG(trucks), AVG(god), AVG(lifestyle), AVG(num_words) FROM song_data " +
                "WHERE popularity=" + popularityRow.popularity + " AND genre_id=" + popularityRow.genre_id;

        if (year != 0) {
            SELECT_STMT += " AND year=" + year + ";";
        } else {
            SELECT_STMT += ";";
        }

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            int index = year - 2010 + 1; // plus one because 0 index is for sum
            if (year == 0) {
                index = 0;
            }

            while (rs.next()) {
                popularityRow.songsOverTime[index] = rs.getInt(1);
                popularityRow.uniquenessOverTime[index] = rs.getDouble(2);
                popularityRow.diversityOverTime[index] = rs.getDouble(3);
                popularityRow.stereotypeOverTime[index] = rs.getDouble(4);
                popularityRow.clothingOverTime[index] = rs.getDouble(5);
                popularityRow.bodyOverTime[index] = rs.getDouble(6);
                popularityRow.alcoholOverTime[index] = rs.getDouble(7);
                popularityRow.trucksOverTime[index] = rs.getDouble(8);
                popularityRow.godOverTime[index] = rs.getDouble(9);
                popularityRow.lifestyleOverTime[index] = rs.getDouble(10);
                popularityRow.wordsOverTime[index] = rs.getDouble(11);
            }

        } catch (SQLException e) {
            System.out.println("failed in [setValuesFromYear]");
            System.out.println(e.getMessage());
            e.printStackTrace();
            System.exit(1);
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

    private static ArrayList<Genre> getAllGenres(Connection conn) {
        final String SELECT_STMT = "SELECT id, name FROM genre_data";

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            ArrayList<Genre> genres = new ArrayList<>();

            while (rs.next()) {
                Genre g = new Genre();
                g.id = rs.getInt(1);
                g.name = rs.getString(2);
                genres.add(g);
            }

            return genres;

        } catch (SQLException e) {
            System.out.println("failed in [setAllGenres]");
            System.out.println(e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }

        return null;
    }

    private static class PopularityRow {
        private int genre_id;
        private int popularity;
        private Integer[] songsOverTime;
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

        public PopularityRow(){
            songsOverTime = new Integer[]{0,0,0,0,0,0,0,0,0,0,0,0};
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
            final String SQL_UPDATE = "UPDATE popularity_data "
                    + "SET songs_over_time = ?, uniqueness_over_time = ?, diversity_over_time = ?, stereotype_over_time = ?, clothing_over_time = ?, " +
                    "body_over_time = ?, alcohol_over_time = ?, trucks_over_time = ?, god_over_time = ?, " +
                    "lifestyle_over_time = ?, words_over_time = ? "
                    + "WHERE popularity = ? AND genre_id = ?;";

            try {
                PreparedStatement pstmt = connection.prepareStatement(SQL_UPDATE);

                pstmt.setArray(1, connection.createArrayOf("integer", songsOverTime));
                pstmt.setArray(2, connection.createArrayOf("float", uniquenessOverTime));
                pstmt.setArray(3, connection.createArrayOf("float", diversityOverTime));
                pstmt.setArray(4, connection.createArrayOf("float", stereotypeOverTime));
                pstmt.setArray(5, connection.createArrayOf("float", clothingOverTime));
                pstmt.setArray(6, connection.createArrayOf("float", bodyOverTime));
                pstmt.setArray(7, connection.createArrayOf("float", alcoholOverTime));
                pstmt.setArray(8, connection.createArrayOf("float", trucksOverTime));
                pstmt.setArray(9, connection.createArrayOf("float", godOverTime));
                pstmt.setArray(10, connection.createArrayOf("float", lifestyleOverTime));
                pstmt.setArray(11, connection.createArrayOf("float", wordsOverTime));
                pstmt.setInt(12, popularity);
                pstmt.setInt(13, genre_id);

                int affectedRows = pstmt.executeUpdate();

            } catch (SQLException e) {
                System.out.println("ERROR IN UPDATE ROW");
                System.out.println(e.getMessage());
                System.out.println(e.getSQLState());
                System.out.println(e.getErrorCode());
            }
        }

        @Override
        public String toString() {
            StringBuilder res = new StringBuilder();

            res.append(popularity);
            res.append("\t");
            res.append(genre_id);
            res.append("\n");
            res.append(Arrays.toString(songsOverTime));
            res.append("\n");
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
    }

    private static class Genre {
        private int id;
        private String name;
        private int numArtists;
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

        public Genre(){
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

        private void updateGenreRow(Connection connection) {
            final String SQL_UPDATE = "UPDATE genre_data "
                    + "SET name = ?, num_artists = ?, songs_over_time = ?, popularity_over_time = ?, uniqueness_over_time = ?, " +
                    "diversity_over_time = ?, stereotype_over_time = ?, clothing_over_time = ?, body_over_time = ?, " +
                    "alcohol_over_time = ?, trucks_over_time = ?, god_over_time = ?, lifestyle_over_time = ?, words_over_time = ?"
                    + "WHERE id = ?;";

            try {
                PreparedStatement pstmt = connection.prepareStatement(SQL_UPDATE);

                pstmt.setString(1, name);
                pstmt.setInt(2, numArtists);
                pstmt.setArray(3, connection.createArrayOf("integer", songsOverTime));
                pstmt.setArray(4, connection.createArrayOf("float", popularityOverTime));
                pstmt.setArray(5, connection.createArrayOf("float", uniquenessOverTime));
                pstmt.setArray(6, connection.createArrayOf("float", diversityOverTime));
                pstmt.setArray(7, connection.createArrayOf("float", stereotypeOverTime));
                pstmt.setArray(8, connection.createArrayOf("float", clothingOverTime));
                pstmt.setArray(9, connection.createArrayOf("float", bodyOverTime));
                pstmt.setArray(10, connection.createArrayOf("float", alcoholOverTime));
                pstmt.setArray(11, connection.createArrayOf("float", trucksOverTime));
                pstmt.setArray(12, connection.createArrayOf("float", godOverTime));
                pstmt.setArray(13, connection.createArrayOf("float", lifestyleOverTime));
                pstmt.setArray(14, connection.createArrayOf("float", wordsOverTime));
                pstmt.setInt(15, id);

                int affectedRows = pstmt.executeUpdate();

            } catch (SQLException e) {
                System.out.println("ERROR IN UPDATE ROW");
                System.out.println(e.getMessage());
                System.out.println(e.getSQLState());
                System.out.println(e.getErrorCode());
            }
        }

        @Override
        public String toString() {
            StringBuilder res = new StringBuilder();

            res.append(name);
            res.append("\t");
            res.append(numArtists);
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
    }
}
