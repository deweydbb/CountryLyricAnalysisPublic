import java.io.File;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Scanner;
import java.util.TreeMap;

public class Uniqueness {
    private static final HashMap<String, WordData> wordMap = getWordMap();
    private static final int HIGHTEST_RANK = getHighestRank(wordMap);

    public static double calculateUniqueness(TrackFromFile track) {
        Scanner sc = new Scanner(track.lyrics);

        int rankSum = 0;
        int numWords = 0;

        while(sc.hasNext()) {
            String word = sc.next().toLowerCase().replaceAll("[()]", "");
            WordData wordData = wordMap.get(word);
            if (wordData == null) {
                System.out.println("WORD IN LYRICS NOT IN WORD SET");
                System.exit(1);
            }

            if (!wordData.ignored && word.length() > 0) {
                numWords++;
                rankSum += wordData.rank;
            }
        }

        return (double) rankSum / (HIGHTEST_RANK * numWords);
    }

    private static HashMap<String, WordData> getWordMap() {
        Connection conn = connect();
        if (conn == null) {
            System.out.println("Failed to connect to database");
            System.exit(1);
        }

        ArrayList<WordData> rawWords = getAllWords(conn);
        rankWords(rawWords);

        HashMap<String, WordData> result = new HashMap<>();

        for (WordData wordData : rawWords) {
            result.put(wordData.word, wordData);
        }

        return result;
    }

    private static int getHighestRank(HashMap<String, WordData> wordMap) {
        int highest = 0;

        for (String word : wordMap.keySet()) {
            WordData w = wordMap.get(word);
            highest = Math.max(highest, w.rank);
        }

        return highest;
    }

    private static void rankWords(ArrayList<WordData> words) {
        TreeMap<Integer, ArrayList<WordData>> rankMap = new TreeMap<>();

        for (WordData wordData : words) {
            if (!wordData.ignored) {
                ArrayList<WordData> wordsWithSameUsage = rankMap.get(wordData.numMentions);
                if (wordsWithSameUsage == null) {
                    wordsWithSameUsage = new ArrayList<>();
                    rankMap.put(wordData.numMentions, wordsWithSameUsage);
                }

                wordsWithSameUsage.add(wordData);
            }
        }

        int uRank = 0;
        int rank = rankMap.size() + 1;
        for (Integer numUses : rankMap.keySet()) {
            uRank++;
            rank--;
            for (WordData wordData : rankMap.get(numUses)) {
                wordData.rank = rank;
                //System.out.println("rank: " + rank + "\t" + wordData.word);
            }
        }
    }

    private static ArrayList<WordData> getAllWords(Connection conn) {
        final String SELECT_STMT = "SELECT word, uses_over_time[1], ignore FROM word_data WHERE genre_id=29;";

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            ArrayList<WordData> words = new ArrayList<>();

            while (rs.next()) {
                String word = rs.getString(1);
                int numMentions = rs.getInt(2);
                boolean ignored = rs.getBoolean(3);
                words.add(new WordData(word, numMentions, ignored));
            }

            return words;

        } catch (SQLException e) {
            System.out.println("failed in [getAllWords]");
            System.out.println(e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }

        return null;
    }

    private static Connection connect() {
        try {
            return DriverManager.getConnection("", "", "");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    private static class WordData {
        private String word;
        private int numMentions;
        private int rank;
        private boolean ignored;

        public WordData(String word, int numMentions, boolean ignored) {
            this.word = word;
            this.numMentions = numMentions;
            this.ignored = ignored;
            rank = -1;
        }

        @Override
        public int hashCode() {
            return word.hashCode();
        }

        @Override
        public boolean equals(Object obj) {
            return word.equals(obj);
        }
    }
}
