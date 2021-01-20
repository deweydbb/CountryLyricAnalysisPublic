import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.ClientCredentials;
import com.wrapper.spotify.model_objects.specification.Track;
import com.wrapper.spotify.model_objects.specification.TrackSimplified;
import com.wrapper.spotify.requests.authorization.client_credentials.ClientCredentialsRequest;
import com.wrapper.spotify.requests.data.tracks.GetTrackRequest;
import org.apache.hc.core5.http.ParseException;

import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;

public class UpdateSpotifyData {

    private static final SpotifyApi spotifyApi = new SpotifyApi.Builder()
            .setClientId("")
            .setClientSecret("")
            .build();

    private static final ClientCredentialsRequest clientCredentialsRequest = spotifyApi.clientCredentials().build();

    public static void main(String[] arg) {
        try {
            final ClientCredentials clientCredentials = clientCredentialsRequest.execute();
            spotifyApi.setAccessToken(clientCredentials.getAccessToken());

            Connection conn = connect();
            if (conn == null) {
                System.out.println("failed to connect to database");
                System.exit(1);
            }

            ArrayList<TrackSQL> allTracks = getAllTracksFromDB(conn);
            setSpotifyData(allTracks);

            batchUpdate(allTracks, conn);
        } catch (ParseException | IOException | SpotifyWebApiException e) {
            e.printStackTrace();
        }
    }

    private static void setSpotifyData(ArrayList<TrackSQL> allTracks) {
        for (int i = 0; i < allTracks.size(); i++)  {
            TrackSQL track = allTracks.get(i);

            Track spotifyTrack = getTrack_Sync(track.spotifyId);
            if (spotifyTrack == null) {
                System.exit(1);
            }

            track.popularity = spotifyTrack.getPopularity();

            track.spotifyPreviewLink = spotifyTrack.getPreviewUrl();
            track.spotifyImageLink = spotifyTrack.getAlbum().getImages()[0].getUrl();

            if (i % 100 == 0) {
                System.out.println(i);
            }
        }
    }

    private static Track getTrack_Sync(String id) {
        try {
            Thread.sleep(100);
            GetTrackRequest getTrackRequest = spotifyApi.getTrack(id).build();
            final Track track = getTrackRequest.execute();

            //System.out.println(track);
            return track;
        } catch (IOException | SpotifyWebApiException | ParseException | InterruptedException e) {
            System.out.println("Error: " + e.getMessage());
        }

        return null;
    }

    private static class TrackSQL {
        int id;
        int popularity;
        String spotifyId;
        String spotifyImageLink;
        String spotifyPreviewLink;


        public TrackSQL(int id, int popularity, String spotifyId, String spotifyImageLink, String spotifyPreviewLink) {
            this.id = id;
            this.popularity = popularity;
            this.spotifyId = spotifyId;
            this.spotifyImageLink = spotifyImageLink;
            this.spotifyPreviewLink = spotifyPreviewLink;
        }
    }

    private static ArrayList<TrackSQL> getAllTracksFromDB(Connection conn) {
        final String SELECT_STMT = "SELECT id, spotify_track_id FROM song_data";

        try {
            PreparedStatement pst = conn.prepareStatement(SELECT_STMT);
            ResultSet rs = pst.executeQuery();

            ArrayList<TrackSQL> result = new ArrayList<>();

            while (rs.next()) {
                int id = rs.getInt(1);
                String spotifyTrackId = rs.getString(2);

                result.add(new TrackSQL(id, 0, spotifyTrackId, null, null));
            }

            return result;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static void batchUpdate(ArrayList<TrackSQL> tracks, Connection conn) {
        final String UPDATE = "UPDATE song_data SET popularity = ?, spotify_image_link = ?, spotify_preview_link = ? WHERE id = ?";

        try {
            PreparedStatement preparedStatement = conn.prepareStatement(UPDATE);
            conn.setAutoCommit(false);

            for (TrackSQL t : tracks) {
                preparedStatement.setInt(1, t.popularity);
                preparedStatement.setString(2, t.spotifyImageLink);
                preparedStatement.setString(3, t.spotifyPreviewLink);
                preparedStatement.setInt(4, t.id);
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

    private static Connection connect() {
        try {
            return DriverManager.getConnection("", "", "");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
}
