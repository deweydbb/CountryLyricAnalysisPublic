import java.sql.*;
import java.util.ArrayList;

public class PopulateSongData {


    public static void main(String[] args) {
        String file = "D:/System Folders/Desktop/CountryMusic/cleanedLyrics.txt";
        ArrayList<TrackFromFile> trackFromFiles = TrackFromFile.loadTracksFromFile(file);

        try (Connection conn = DriverManager.getConnection(
                "", "", "")) {

            if (conn != null) {
                System.out.println("Connected to the database!");

                addSongsToDB(conn, trackFromFiles);
            } else {
                System.out.println("Failed to make connection!");
            }

        } catch (SQLException e) {
            System.err.format("SQL State: %s\n%s", e.getSQLState(), e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void addSongsToDB(Connection connection, ArrayList<TrackFromFile> trackFromFiles) {
        final String INSERT_SQL = "INSERT INTO song_data(title, artist, album, lyric_id, year, popularity, genre) "
                + "VALUES(?,?,?,?,?,?,?)";

        for (TrackFromFile track : trackFromFiles) {

            long lyric_id = setLyricRow(connection, track);
            if (lyric_id == -1) {
                continue;
            }

            try {
                PreparedStatement pstmt = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS);

                pstmt.setString(1, track.title);
                pstmt.setString(2, track.artist);
                pstmt.setString(3, track.album);
                pstmt.setLong(4, lyric_id);
                pstmt.setInt(5, track.year);
                pstmt.setInt(6, track.popularity);
                pstmt.setString(7, track.getGenre());

                int affectedRows = pstmt.executeUpdate();

                if (affectedRows > 0) {
                    try (ResultSet rs = pstmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            System.out.println(rs.getLong(1));
                        }
                    } catch (SQLException ex) {
                        System.out.println(ex.getMessage());
                    }
                }


            } catch (SQLException e) {
                System.err.format("SQL State: %s\n%s", e.getSQLState(), e.getMessage());
            }
        }
    }

    // returns id of lyrics in lyrics table
    private static long setLyricRow(Connection connection, TrackFromFile track) {
        final String INSERT_SQL = "INSERT INTO lyrics(lyrics) "
                + "VALUES(?)";

        try {
            PreparedStatement pstmt = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS);

            pstmt.setString(1, track.lyrics);

            int affectedRows = pstmt.executeUpdate();

            if (affectedRows > 0) {
                try (ResultSet rs = pstmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getLong(1);
                    }
                } catch (SQLException ex) {
                    System.out.println(ex.getMessage());
                }
            }


        } catch (SQLException e) {
            System.err.format("SQL State: %s\n%s", e.getSQLState(), e.getMessage());
        }

        System.out.println("Error in Set Lyric Row");
        return -1;
    }
}
