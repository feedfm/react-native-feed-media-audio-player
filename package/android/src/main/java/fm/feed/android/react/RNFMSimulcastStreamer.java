package fm.feed.android.react;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import org.jetbrains.annotations.NotNull;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import fm.feed.android.playersdk.FMLog;
import fm.feed.android.playersdk.FeedSimulcastStreamer;
import fm.feed.android.playersdk.LogLevel;
import fm.feed.android.playersdk.SimulcastEventListener;
import fm.feed.android.playersdk.SimulcastPlaybackState;
import fm.feed.android.playersdk.State;
import fm.feed.android.playersdk.models.Play;

import static fm.feed.android.react.Utils.convertJsonToMap;
import static fm.feed.android.react.Utils.sendEvent;
import static fm.feed.android.react.Utils.toJson;

class RNFMSimulcastStreamer extends ReactContextBaseJavaModule {

    public final static String TAG = RNFMSimulcastStreamer.class.getName();
    Handler mainHandler = new Handler(Looper.getMainLooper());

    private final ReactApplicationContext reactContext;
    private FeedSimulcastStreamer streamer;

    public RNFMSimulcastStreamer(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("SimulcastStateIdle" , SimulcastPlaybackState.Idle.ordinal());
        constants.put("SimulcastStatePlaying", SimulcastPlaybackState.Playing.ordinal());
        constants.put("SimulcastStateStopped", SimulcastPlaybackState.Stopped.ordinal());
        constants.put("SimulcastStateStalled", SimulcastPlaybackState.Stalled.ordinal());
        constants.put("SimulcastStateUninitialized", SimulcastPlaybackState.Unintialized.ordinal());
        constants.put("SimulcastStateUnavailable", SimulcastPlaybackState.Unavailable.ordinal());
        constants.put("SimulcastStateAvailable", SimulcastPlaybackState.Available.ordinal());

        return constants;
    }

    private SimulcastEventListener listener = new SimulcastEventListener() {
        @Override
        public void onPlayItemBeganPlayback(@NotNull Play play) {

            String str  = toJson(play.getAudioFile().getMetadata());

            try {
                JSONObject object = new JSONObject(str);
                WritableMap options  = convertJsonToMap(object);
                WritableMap playParams = Arguments.createMap();
                playParams.putMap("metadata",options);
                playParams.putString("title", play.getAudioFile().getTrack().getTitle());
                playParams.putString("album", play.getAudioFile().getRelease().getTitle());
                playParams.putString("artist", play.getAudioFile().getArtist().getName());
                playParams.putInt("duration", (int)play.getAudioFile().getDurationInSeconds());
                WritableMap params = Arguments.createMap();
                params.putMap("play", playParams);
                sendEvent(reactContext, "play-started", params);

            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onPlayerStateChanged(@NotNull SimulcastPlaybackState simulcastPlaybackState) {

            WritableMap params = Arguments.createMap();
            switch (simulcastPlaybackState)

            {
                case Idle:
                    params.putInt("state", SimulcastPlaybackState.Idle.ordinal()); break;
                case Playing:
                    params.putInt("state", SimulcastPlaybackState.Playing.ordinal());
                    break;
                case Stalled:
                    params.putInt("state", SimulcastPlaybackState.Stalled.ordinal());
                    break;
                case Stopped:
                    params.putInt("state", SimulcastPlaybackState.Stopped.ordinal());
                    break;
                case Available:
                    params.putInt("state", SimulcastPlaybackState.Available.ordinal());
                    break;
                case Unavailable:
                    params.putInt("state", SimulcastPlaybackState.Unavailable.ordinal());
                    break;
                case Unintialized:
                    params.putInt("state", SimulcastPlaybackState.Unintialized.ordinal());
            }
            sendEvent(reactContext, "state-change", params);
        }

        @Override
        public void onProgressUpdate(@NotNull Play play, float v, float v1) {
            WritableMap params = Arguments.createMap();
            params.putDouble("elapsed",v);
            sendEvent(reactContext, "elapse", params);

        }

        @Override
        public void onPlayerError(@NotNull Exception e) {

        }
    };

    @Override
    public String getName() {
        return "RNFMSimulcastStreamer";
    }

    @ReactMethod
    public void initialize(String token){
        if (streamer != null) {
            disconnect(true);
        }

        streamer = new FeedSimulcastStreamer(reactContext,token,listener );
    }

    @ReactMethod
    public void setVolume(final float volume){
        final FeedSimulcastStreamer localStreamer = streamer;

        if (localStreamer == null) {
            return;
        }

        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                localStreamer.setVolume(volume);
            }
        });
    }


    @ReactMethod
    public void connect(){
        final FeedSimulcastStreamer localStreamer = streamer;

        if (localStreamer == null) {
            return;
        }

        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                localStreamer.connect();
            }
        });
    }

    @ReactMethod
    public void disconnect(boolean force) {
        final FeedSimulcastStreamer localStreamer = streamer;

        if (localStreamer == null) {
            return;
        }

        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                localStreamer.disconnect();
            }
        });

        if (force) {
            streamer = null;
        }
    }

    @ReactMethod
    public void onHostDestroy() {
        disconnect(true);
    }

}
