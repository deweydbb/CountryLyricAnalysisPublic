import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.ClientCredentials;
import com.wrapper.spotify.model_objects.specification.Artist;
import com.wrapper.spotify.model_objects.specification.Track;
import com.wrapper.spotify.requests.authorization.client_credentials.ClientCredentialsRequest;
import com.wrapper.spotify.requests.data.artists.GetArtistRequest;
import com.wrapper.spotify.requests.data.tracks.GetTrackRequest;
import org.apache.hc.core5.http.ParseException;

import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;

public class ArtistSpotifyUpdate {
    private static final SpotifyApi spotifyApi = new SpotifyApi.Builder()
            .setClientId("")
            .setClientSecret("")
            .build();

    private static final ClientCredentialsRequest clientCredentialsRequest = spotifyApi.clientCredentials().build();

    private static String lastTrackImage = null;

    public static void main(String[] args) {
        try {
            final ClientCredentials clientCredentials = clientCredentialsRequest.execute();
            spotifyApi.setAccessToken(clientCredentials.getAccessToken());

            Connection conn = connect();
            if (conn == null) {
                System.out.println("failed to connect to database");
                System.exit(1);
            }

            ArrayList<ArtistSQL> allArtists = getArtistsFromDB(conn);


            for (int i = 0; i < allArtists.size(); i++) {
                ArtistSQL artistSQL = allArtists.get(i);

                artistSQL.spotifyId = getArtistSpotifyId(conn, artistSQL.id);
                if (artistSQL.spotifyId == null) {
                    System.exit(1);
                }
                System.out.println(artistSQL.spotifyId);

                Artist artist = getArtist_Sync(artistSQL.spotifyId);
                if (artist.getImages().length > 0) {
                    artistSQL.spotifyImageLink = artist.getImages()[0].getUrl();
                } else {
                    artistSQL.spotifyImageLink = lastTrackImage;
                }
                if (artistSQL.spotifyImageLink == null) {
                    System.exit(1);
                }

                if (i % 20 == 0) {
                    System.out.println(i);
                }
            }

            batchUpdate(allArtists, conn);
        } catch (ParseException | IOException | SpotifyWebApiException e) {
            e.printStackTrace();
        }


    }

    public static void batchUpdate(ArrayList<ArtistSQL> artists, Connection conn) {
        final String UPDATE = "UPDATE artist_data SET spotify_artist_id = ?, spotify_image_link = ? WHERE id = ?";

        try {
            PreparedStatement preparedStatement = conn.prepareStatement(UPDATE);
            conn.setAutoCommit(false);

            for (ArtistSQL artist : artists) {
                preparedStatement.setString(1, artist.spotifyId);
                preparedStatement.setString(2, artist.spotifyImageLink);
                preparedStatement.setInt(3, artist.id);
                preparedStatement.addBatch();
            }

            int[] updateCounts = preparedStatement.executeBatch();
            System.out.println(updateCounts.length);
            conn.commit();
            conn.setAutoCommit(true);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static class ArtistSQL {
        private int id;
        private String spotifyId;
        private String spotifyImageLink;

        public ArtistSQL(int id) {
            this.id = id;
        }
    }

    private static ArrayList<ArtistSQL> getArtistsFromDB(Connection conn) {
        final String SELECT_STMT = "SELECT id FROM artist_data";

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            ArrayList<ArtistSQL> result = new ArrayList<>();

            while (rs.next()) {
                int id = rs.getInt(1);

                result.add(new ArtistSQL(id));
            }

            return result;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String getTrackSpotifyId(Connection conn, int artistId) {
        final String SELECT_STMT = "SELECT spotify_track_id FROM song_data WHERE artist_id='" + artistId + "' LIMIT 1;";

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            while (rs.next()) {
                return rs.getString(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }

    private static Artist getArtist_Sync(String id) {
        try {
            Thread.sleep(50);
            GetArtistRequest getArtistRequest = spotifyApi.getArtist(id).build();
            final Artist artist = getArtistRequest.execute();

            //System.out.println("Name: " + artist.getName());
            return artist;
        } catch (IOException | SpotifyWebApiException | ParseException | InterruptedException e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    private static String getArtistSpotifyId(Connection conn, int artistId) {
        try {
            String trackSpotifyId = getTrackSpotifyId(conn, artistId);

            Track spotifyTrack = getTrack_Sync(trackSpotifyId);

            return spotifyTrack.getArtists()[0].getId();
        } catch (Exception e) {
            return null;
        }
    }

    private static Track getTrack_Sync(String id) {
        try {
            Thread.sleep(50);
            GetTrackRequest getTrackRequest = spotifyApi.getTrack(id).build();
            final Track track = getTrackRequest.execute();

            lastTrackImage = track.getAlbum().getImages()[0].getUrl();

            //System.out.println(track);
            return track;
        } catch (IOException | SpotifyWebApiException | ParseException | InterruptedException e) {
            System.out.println("Error: " + e.getMessage());
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
}
