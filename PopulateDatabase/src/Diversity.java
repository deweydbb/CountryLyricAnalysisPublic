import java.util.HashMap;
import java.util.HashSet;
import java.util.Scanner;

public class Diversity {

    public static double calculateDiversity(TrackFromFile track) {
        HashSet<String> wordSet = new HashSet<>();

        Scanner sc = new Scanner(track.lyrics);

        int totalWords = 0;
        while (sc.hasNext()) {
            totalWords++;
            String word = sc.next().toLowerCase();

            wordSet.add(word);
        }

        return wordSet.size() / (double) totalWords;
    }

}
