import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Scanner;

public class GenderUpdate {

    public static void main(String[] args) {
        HashMap<String, Boolean> genderMap = getGenderMap();

        Connection conn = connect();
        if (conn == null) {
            System.out.println("failed to connect to database");
            System.exit(1);
        }

        updateArtists(conn, genderMap);
    }

    private static Connection connect() {
        try {
            return DriverManager.getConnection("", "", "");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    private static HashMap<String, Boolean> getGenderMap() {
        try {
            File input = new File("gender.txt");
            Scanner sc = new Scanner(input);

            HashMap<String, Boolean> result = new HashMap<>();

            while (sc.hasNextLine()) {
                String[] split = sc.nextLine().split("\t");

                result.put(split[1], split[0].length() == 1);
            }

            sc.close();

            return result;
        } catch (Exception e) {
            return null;
        }
    }

    private static void updateArtists(Connection conn, HashMap<String, Boolean> genderMap) {
        try {
            String STMT = "UPDATE artist_data SET is_female = ? WHERE name = ?;";

            PreparedStatement preparedStatement = conn.prepareStatement(STMT);
            conn.setAutoCommit(false);

            for (String artist : genderMap.keySet()) {
                preparedStatement.setBoolean(1, genderMap.get(artist));
                preparedStatement.setString(2, artist);
                preparedStatement.addBatch();
            }

            int[] updateCounts = preparedStatement.executeBatch();

            for (int i : updateCounts) {
                if (i != 1) {
                    System.out.println("failed");
                }
            }

            conn.commit();
            conn.setAutoCommit(true);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
