import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Scanner;

public class Stereotype {
    private static final String[] group_name = new String[]{"CLOTHING", "BODY", "ALCOHOL", "TRUCKS", "GOD", "FARM"};
    private static final HashMap<String, Integer> wordMap = loadWords();

    public static double[] calculateStereotypes(TrackFromFile track) {
        double[] result = new double[6];
        int[] numStereotype = new int[6];

        Scanner sc = new Scanner(track.lyrics);
        int totalWords = 0;

        while (sc.hasNext()) {
            String word = sc.next().toLowerCase();
            totalWords++;

            Integer type = wordMap.get(word);
            if (type != null) {
                //System.out.println(group_name[type] + "\t" + word);
                numStereotype[type]++;
            }
        }

        for (int i = 0; i < 6; i++) {
            result[i] = (double) numStereotype[i] / totalWords;
        }

        return result;
    }


    private static HashMap<String, Integer> loadWords() {
        try {
            Scanner sc = new Scanner(new File("stereotypeWords.txt"));
            HashMap<String, Integer> result = new HashMap<>();

            int wordType = 0;
            while (sc.hasNextLine()) {
                String[] split = sc.nextLine().split(",");
                for (String word : split) {
                    result.put(word, wordType);
                }

                wordType++;
            }

            sc.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
