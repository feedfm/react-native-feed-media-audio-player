
package fm.feed.android.react;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class RNFMAudioPlayerModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public RNFMAudioPlayerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RNFMAudioPlayer";
  }
}