import java.io.File;
import java.util.ArrayList;
import java.util.Scanner;

public class TrackFromFile {

    public String artist;
    public String title;
    public String lyrics;
    public int year;
    public String album;
    public int popularity;
    public String genre;

    public TrackFromFile(String artist, String title, String lyrics, int year, String album, int popularity, String genre) {
        this.artist = artist;
        this.title = title;
        this.lyrics = lyrics;
        this.year = year;
        this.album = album;
        this.popularity = popularity;
        this.genre = genre;
    }

    public String getGenre() {
        if (genre != null && genre.length() > 1) {
            String[] split = genre.split(",");
            return split[0].replaceAll("\"", "");
        }

        return null;
    }

    public String getGenreByIndex(int index) {
        if (genre != null && genre.length() > 1) {
            String[] split = genre.split(",");

            if (index < split.length) {
                String genre = split[index].replaceAll("\"", "");
                if (genre.startsWith(" ")) {
                    genre = genre.substring(1);
                }
                return genre;
            }
        }

        return null;
    }

    private static TrackFromFile getTrack(String line) {
        String[] split = line.split("\t");

        String artist = split[0];
        String title = split[1];
        String lyrics = split[2];
        int year = Integer.parseInt(split[3]);
        String album = split[4];
        int popularity = Integer.parseInt(split[5]);
        String genre = null;
        if (split.length > 6) {
            genre = split[6];
        }

        return new TrackFromFile(artist, title, lyrics, year, album, popularity, genre);
    }

    public static ArrayList<TrackFromFile> loadTracksFromFile(String file) {
        try {
            File inputFile = new File(file);
            Scanner sc = new Scanner(inputFile);

            ArrayList<TrackFromFile> result = new ArrayList<>();

            while (sc.hasNextLine()) {
                String line = sc.nextLine();

                result.add(getTrack(line));
            }

            sc.close();

            return result;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public int hashCode() {
        return artist.hashCode() + title.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof TrackFromFile) {
            TrackFromFile other = (TrackFromFile) obj;
            return  (other.artist.equals(artist) && other.title.equals(title) && album.equals(other.album) && other.year == year && other.popularity == popularity);
        }

        return false;
    }
}
