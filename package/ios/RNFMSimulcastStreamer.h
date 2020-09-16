//
//  RNFMSimulcastStreamer.h
//  RNFMAudioPlayer
//
//  Created by Arveen kumar on 9/15/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

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

@interface RNFMSimulcastStreamer : RCTEventEmitter <RCTBridgeModule, FMSimulcastDelegate>

@property (nonatomic, strong) FMSimulcastStreamer *streamer;

+ (BOOL)requiresMainQueueSetup;
- (dispatch_queue_t)methodQueue;

@end
