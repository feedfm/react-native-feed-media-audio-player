
#if __has_include("RCTBridgeModule.h")
//#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#import "RCTConvert.h"
#else
//#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTConvert.h>
#endif

#import "FeedMedia/FeedMediaCore.h"


@interface RNFMAudioPlayer : RCTEventEmitter <RCTBridgeModule> 

@property (nonatomic, weak) FMAudioPlayer *player;

+ (BOOL)requiresMainQueueSetup;
- (dispatch_queue_t)methodQueue;

@end
  
