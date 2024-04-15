
package fm.feed.android.react;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import fm.feed.android.playersdk.AvailabilityListener;
import fm.feed.android.playersdk.FeedFMError;
import fm.feed.android.playersdk.MusicQueuedListener;
import fm.feed.android.playersdk.SessionUpdateListener;
import fm.feed.android.playersdk.ClientIdListener;
import fm.feed.android.playersdk.FeedAudioPlayer;
import fm.feed.android.playersdk.FeedPlayerService;
import fm.feed.android.playersdk.PlayListener;
import fm.feed.android.playersdk.SkipListener;
import fm.feed.android.playersdk.State;
import fm.feed.android.playersdk.StateListener;
import fm.feed.android.playersdk.StationChangedListener;
import fm.feed.android.playersdk.models.Play;
import fm.feed.android.playersdk.models.Station;

import static fm.feed.android.react.Utils.convertJsonToArray;
import static fm.feed.android.react.Utils.convertJsonToMap;
import static fm.feed.android.react.Utils.sendEvent;
import static fm.feed.android.react.Utils.toJson;

import androidx.annotation.NonNull;

public class RNFMAudioPlayerModule extends ReactContextBaseJavaModule
    implements StateListener, StationChangedListener, PlayListener, SkipListener {

  public final static String TAG = RNFMAudioPlayerModule.class.getName();

  private final ReactApplicationContext reactContext;
  private FeedAudioPlayer mFeedAudioPlayer;

  public RNFMAudioPlayerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RNFMAudioPlayer";
  }

  @ReactMethod
  public void updateSession() {
    mFeedAudioPlayer.updateSession(new SessionUpdateListener() {
      @Override
      public void onSessionUpdateFailed() {
        Log.e(TAG, "Error while updating session");
      }

      @Override
      public void onUpdatedSessionAvailable() {
        WritableMap params = Arguments.createMap();

        params.putString("clientID", mFeedAudioPlayer.getClientId());

        WritableArray wArray = new WritableNativeArray();
        for (Station station : mFeedAudioPlayer.getStationList()) {
          try {
            JSONObject jsonStation = new JSONObject(toJson(station));
            jsonStation.put("hasNewMusic", station.hasNewMusic());

            wArray.pushMap(convertJsonToMap(jsonStation));
          } catch (Exception e) {
            // ignore
          }
        }

        params.putArray("stations", wArray);
        params.putInt("activeStationId", mFeedAudioPlayer.getActiveStation().getId());

        Log.i(TAG, "generating a new session");

        sendEvent(reactContext, "session-updated", params);
      }
    });
  }

  @ReactMethod
  public void setClientID(String clientID) {
    Log.i(TAG, "assigning old client ID: " + clientID);
    mFeedAudioPlayer.setClientId(clientID);

    updateSession();
  }

  @ReactMethod
  public void logEvent(String event, ReadableMap params) {
    try {
      JSONObject object = Utils.convertMapToJson(params);
      Log.i(TAG, "Log event: " + event);
      mFeedAudioPlayer.logEvent(event, object);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void createNewClientID() {
    Log.i(TAG, "creating new client ID");
    mFeedAudioPlayer.createNewClientId(new ClientIdListener() {
      @Override
      public void onClientId(String newClientID) {
        updateSession();
      }

      @Override
      public void onError() {
        Log.e(TAG, "Error while generating a new client id");
      }
    });
  }

  @ReactMethod
  public void initializeWithToken(String token, String secret, boolean enableBackgroundMusic) {


    FeedAudioPlayer.setDisableAudioFocus(false);
    AvailabilityListener listener = new AvailabilityListener() {
      @Override
      public void onPlayerAvailable(@NotNull FeedAudioPlayer feedAudioPlayer) {
        mFeedAudioPlayer = feedAudioPlayer;

        WritableMap params = Arguments.createMap();
        params.putBoolean("available", true);

        WritableArray wArray = new WritableNativeArray();

        for (Station station : feedAudioPlayer.getStationList()) {
          try {
            JSONObject jsonStation = new JSONObject(toJson(station));
            jsonStation.put("hasNewMusic", station.hasNewMusic());

            wArray.pushMap(convertJsonToMap(jsonStation));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }

        params.putArray("stations", wArray);
        params.putInt("activeStationId", feedAudioPlayer.getActiveStation().getId());
        params.putString("clientID", feedAudioPlayer.getClientId());
        sendEvent(reactContext, "availability", params);
      }

      @Override
      public void onPlayerUnavailable(Exception e) {
        WritableMap params = Arguments.createMap();
        params.putBoolean("available", false);
        sendEvent(reactContext, "availability", params);
      }
    };

    if (enableBackgroundMusic) {
      FeedPlayerService.initialize(reactContext, token, secret);
      mFeedAudioPlayer = FeedPlayerService.getInstance();
      FeedPlayerService.getInstance(listener);


    } else {
      mFeedAudioPlayer = new FeedAudioPlayer.Builder(reactContext, token, secret).setAvailabilityListener(listener)
          .build();
    }
    mFeedAudioPlayer.addPlayListener(RNFMAudioPlayerModule.this);
    mFeedAudioPlayer.addSkipListener(RNFMAudioPlayerModule.this);
    mFeedAudioPlayer.addStationChangedListener(RNFMAudioPlayerModule.this);
    mFeedAudioPlayer.addStateListener(RNFMAudioPlayerModule.this);
  }

  @ReactMethod
  public void play() {

    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {

        mFeedAudioPlayer.play();
      }
    });
  }

  @ReactMethod
  public void pause() {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {

        mFeedAudioPlayer.pause();
      }
    });
  }

  @ReactMethod
  public void setActiveStation(Integer station) {

    // Log.i(TAG, "Station id ="+station.toString());
    boolean flag = false;
    for (Station st : mFeedAudioPlayer.getStationList()) {

      if (st.getId().toString().equals(station.toString())) {
        UiThreadUtil.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            mFeedAudioPlayer.setActiveStation(st, false);
            mFeedAudioPlayer.prepareToPlay(st, new MusicQueuedListener() {
              @Override
              public void onError(@NonNull FeedFMError feedFMError) {
                Log.e(TAG, "Error: failed to prepareToPlay"+ feedFMError.getMessage());
              }

              @Override
              public void onMusicQueued() {
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "musicQueued", params);
              }

            });
          }
        });

        flag = true;
        break;
      }
    }
    if (!flag) {
      Log.e(TAG, "Cannot set active station to " + station + " because no station found with that id");
    }
  }

  @ReactMethod
  public void skip() {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        mFeedAudioPlayer.skip();
      }
    });
  }

  @ReactMethod
  public void canLike(Promise promise) {

    int myInt = mFeedAudioPlayer.canLike() ? 1 : 0;
    promise.resolve(myInt);
  }

  @ReactMethod
  public void canSkip(Promise promise) {
    int myInt = mFeedAudioPlayer.canSkip() ? 1 : 0;
    promise.resolve(myInt);
  }

  @ReactMethod
  public void stop() {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        mFeedAudioPlayer.stop();
      }
    });

  }

  @ReactMethod
  public void setVolume(float volume) {
    mFeedAudioPlayer.setVolume(volume);
  }

  @ReactMethod
  public void maxSeekableLengthInSeconds(Promise promise) {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        promise.resolve(mFeedAudioPlayer.maxSeekableLengthInSeconds());
      }
    });
  }

  @ReactMethod
  public void seekCurrentStationBy(float seconds) {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
         mFeedAudioPlayer.seekCurrentStationBy(seconds);
      }
    });
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("audioPlayerPlaybackStateUnavailable", State.UNAVAILABLE.ordinal());
    constants.put("audioPlayerPlaybackStateUninitialized", State.UNINITIALIZED.ordinal());
    constants.put("audioPlayerPlaybackStateWaitingForItem", State.WAITING_FOR_ITEM.ordinal());
    constants.put("audioPlayerPlaybackStateReadyToPlay", State.READY_TO_PLAY.ordinal());
    constants.put("audioPlayerPlaybackStatePlaying", State.PLAYING.ordinal());
    constants.put("audioPlayerPlaybackStatePaused", State.PAUSED.ordinal());
    constants.put("audioPlayerPlaybackStateStalled", State.STALLED.ordinal());
    constants.put("audioPlayerPlaybackStateOfflineOnly", State.UNAVAILABLE.ordinal());
    return constants;
  }

  @Override
  public void onStateChanged(State state) {
    WritableMap params = Arguments.createMap();
    switch (state) {
      case PAUSED:
        params.putInt("state", State.PAUSED.ordinal());
        break;
      case PLAYING:
        params.putInt("state", State.PLAYING.ordinal());
        break;
      case STALLED:
        params.putInt("state", State.STALLED.ordinal());
        break;
      case UNAVAILABLE:
        params.putInt("state", State.UNAVAILABLE.ordinal());
        break;
      case READY_TO_PLAY:
        params.putInt("state", State.READY_TO_PLAY.ordinal());
        break;
      case UNINITIALIZED:
        params.putInt("state", State.UNINITIALIZED.ordinal());
        break;
      case WAITING_FOR_ITEM:
        params.putInt("state", State.WAITING_FOR_ITEM.ordinal());
        break;
      case AVAILABLE_OFFLINE_ONLY:
        params.putInt("state", State.AVAILABLE_OFFLINE_ONLY.ordinal());
        break;
    }

    sendEvent(reactContext, "state-change", params);

  }

  @Override
  public void onStationChanged(Station station) {

    WritableMap params = Arguments.createMap();
    params.putInt("activeStationId", station.getId());
    sendEvent(reactContext, "station-change", params);

  }

  @Override
  public void onSkipStatusChanged(boolean b) {

  }

  @Override
  public void onProgressUpdate(@NotNull Play play, float v, float v1) {
    WritableMap params = Arguments.createMap();
    params.putDouble("elapsed", v);
    sendEvent(reactContext, "elapse", params);
  }

  @Override
  public void onPlayStarted(Play play) {
    if (play == null || play.getStation() == null)
      return;
    String str = toJson(play.getAudioFile().getMetadata());

    try {
      JSONObject object = new JSONObject(str);
      WritableMap options = convertJsonToMap(object);
      WritableMap playParams = Arguments.createMap();
      playParams.putMap("metadata", options);
      playParams.putString("id", play.getAudioFile().getId());
      playParams.putString("title", play.getAudioFile().getTrack().getTitle());
      playParams.putString("artist", play.getAudioFile().getArtist().getName());
      playParams.putString("album", play.getAudioFile().getRelease().getTitle());
      playParams.putString("artist", play.getAudioFile().getArtist().getName());
      playParams.putBoolean("canSkip", mFeedAudioPlayer.canSkip());
      playParams.putInt("duration", (int) play.getAudioFile().getDurationInSeconds());
      playParams.putInt("station_id", play.getStation().getId());
      WritableMap params = Arguments.createMap();
      params.putMap("play", playParams);
      sendEvent(reactContext, "play-started", params);

    } catch (JSONException e) {
      e.printStackTrace();
    }

  }

  // Skip
  @Override
  public void requestCompleted(boolean b) {
    if (!b) {
      WritableMap params = Arguments.createMap();
      sendEvent(reactContext, "skip-failed", params);
    }

  }

  @Override
  public void onPlayerError(@NonNull FeedFMError feedFMError) {
    Log.e(TAG, "Player error" + feedFMError.getMessage());
  }
}
