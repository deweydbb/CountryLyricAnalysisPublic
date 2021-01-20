import java.io.*;
import java.util.*;

public class CalculateWordData {
    public static void main(String[] args) {
        String file = "D:/System Folders/Desktop/CountryMusic/cleanedLyrics.txt";
        ArrayList<TrackFromFile> trackFromFiles = TrackFromFile.loadTracksFromFile(file);

        HashMap<String, WordData> wordMap = new HashMap<>();

        for (TrackFromFile track : trackFromFiles) {
            Scanner sc = new Scanner(track.lyrics);

            while (sc.hasNext()) {
                String word = sc.next().toLowerCase().replaceAll("[()]", "");
                if (word.length() > 0) {
                    WordData wordData = wordMap.get(word);
                    if (wordData != null) {
                        wordData.incrementUsage(track.year);
                    } else {
                        wordData = new WordData(word);
                        wordData.incrementUsage(track.year);
                        wordMap.put(word, wordData);
                    }
                }
            }

            sc.close();
        }

        rankWordData(wordMap);
        for (int i = 0; i < 11; i++) {
            rankWordDataByYear(wordMap, i);
        }

        try {
            FileOutputStream out = new FileOutputStream(new File("wordData.txt"));

            for (String word : wordMap.keySet()) {
                out.write(wordMap.get(word).toByteArray());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void rankWordData(HashMap<String, WordData> wordMap) {
        TreeMap<Integer, ArrayList<WordData>> rankMap = new TreeMap<>();

        for (String word : wordMap.keySet()) {
            WordData wordData = wordMap.get(word);

            ArrayList<WordData> wordsWithSameUsage = rankMap.get(wordData.totalUses);
            if (wordsWithSameUsage == null) {
                wordsWithSameUsage = new ArrayList<>();
                rankMap.put(wordData.totalUses, wordsWithSameUsage);
            }

            wordsWithSameUsage.add(wordData);
        }

        System.out.println(rankMap.size());

        int uRank = 0;
        int rank = rankMap.size() + 1;
        for (Integer numUses : rankMap.keySet()) {
            uRank++;
            rank--;
            for (WordData wordData : rankMap.get(numUses)) {
                //System.out.println("rank: " + rank + " uRank: " + uRank + "\t" + wordData.word);
                wordData.uniqueRank = uRank;
                wordData.totalRank = rank;
            }
        }
    }

    private static void rankWordDataByYear(HashMap<String, WordData> wordMap, int year) {
        if (year < 0 || year > 11) {
            System.out.println("YEAR IS OUT OF RANGE");
            return;
        }

        TreeMap<Integer, ArrayList<WordData>> rankMap = new TreeMap<>();

        for (String word : wordMap.keySet()) {
            WordData wordData = wordMap.get(word);

            ArrayList<WordData> wordsWithSameUsage = rankMap.get(wordData.usesOverTime[year]);
            if (wordsWithSameUsage == null) {
                wordsWithSameUsage = new ArrayList<>();
                rankMap.put(wordData.usesOverTime[year], wordsWithSameUsage);
            }

            wordsWithSameUsage.add(wordData);
        }

        int rank = 0;
        for (Integer numUses : rankMap.descendingKeySet()) {
            rank++;
            for (WordData wordData : rankMap.get(numUses)) {
                //System.out.println("rank: " + rank + "\t" + wordData.word);
                wordData.rankOverTime[year] = rank;
            }
        }
    }

    private static class WordData {
        private final String word; // is set correctly
        private int totalUses; //is set correctly
        private final int[] usesOverTime; // is set correctly
        private int totalRank; // is set correctly
        private final int[] rankOverTime;
        private int uniqueRank; // is set correctly

        public WordData(String word) {
            this.word = word;
            usesOverTime = new int[11];
            rankOverTime = new int[11];
        }

        public byte[] toByteArray() {
            StringBuilder s = new StringBuilder();
            s.append(word);
            s.append(",");
            s.append(totalUses);
            s.append(",");

            for (int i = 0; i < usesOverTime.length; i++) {
                s.append(usesOverTime[i]);
                s.append(",");
            }

            s.append(totalRank);
            s.append(",");

            for (int i = 0; i < rankOverTime.length; i++) {
                s.append(rankOverTime[i]);
                s.append(",");
            }

            s.append(uniqueRank);
            s.append("\n");

            return s.toString().getBytes();
        }

        //precon: year must be in range [2010, 2020]
        void incrementUsage(int year) {
            if (year < 2010 || year > 2020) {
                return;
            }

            int index = year - 2010;
            usesOverTime[index]++;
            totalUses++;
        }

        public int hashCode() {
            return word.hashCode();
        }

        public boolean equals(Object obj) {
            return word.equals(obj);
        }
    }
}
