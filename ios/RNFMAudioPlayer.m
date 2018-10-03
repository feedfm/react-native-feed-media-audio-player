
#import "RNFMAudioPlayer.h"
#import "FeedMedia/FeedMediaCore.h"
#import <React/RCTLog.h>

@implementation RNFMAudioPlayer

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(setToken:(NSString *)token secret:(NSString *)secret)
{
  [FMAudioPlayer setClientToken:token secret:secret];
  RCTLogInfo(@"initialized! with token %@ and secret %@", token, secret);
}

RCT_EXPORT_METHOD(play)
{
  FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
  RCTLogInfo(@"play called");
  [player play];
}

RCT_EXPORT_METHOD(pause)
{
  FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
  RCTLogInfo(@"pause called");
  [player pause];
}

RCT_EXPORT_METHOD(skip)
{
  FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
  RCTLogInfo(@"skip called");
  [player skip];
}

@end
  
