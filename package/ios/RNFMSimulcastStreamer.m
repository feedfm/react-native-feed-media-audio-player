//
//  RNFMSimulcastStreamer.m
//  RNFMAudioPlayer
//
//  Created by Arveen kumar on 9/15/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "RNFMSimulcastStreamer.h"



@implementation RCTConvert (FMSimulcastPlaybackState)

RCT_ENUM_CONVERTER(FMSimulcastPlaybackState, (@{
  @"SimulcastStateIdle": @(SIMULCAST_STATE_IDLE),
  @"SimulcastStatePlaying": @(SIMULCAST_STATE_PLAYING),
  @"SimulcastStateStopped": @(SIMULCAST_STATE_STOPPED),
  @"SimulcastStateStalled": @(SIMULCAST_STATE_STALLED),
  @"SimulcastStateAvailable": @(SIMULCAST_STATE_AVAILABLE),
  @"SimulcastStateUnavailable": @(SIMULCAST_STATE_MUSIC_UNAVAILABLE),
  @"SimulcastStateUninitalized": @(SIMULCAST_STATE_UNINITIALIZED),
  }), SIMULCAST_STATE_UNINITIALIZED, integerValue)

@end


@implementation RNFMSimulcastStreamer


RCT_EXPORT_MODULE()


- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (NSDictionary *)constantsToExport
{
    return @{
          @"SimulcastStateIdle": @(SIMULCAST_STATE_IDLE),
          @"SimulcastStatePlaying": @(SIMULCAST_STATE_PLAYING),
          @"SimulcastStateStopped": @(SIMULCAST_STATE_STOPPED),
          @"SimulcastStateStalled": @(SIMULCAST_STATE_STALLED),
          @"SimulcastStateUnavailable": @(SIMULCAST_STATE_MUSIC_UNAVAILABLE),
          @"SimulcastStateAvailable": @(SIMULCAST_STATE_AVAILABLE),
          @"SimulcastStateUninitalized": @(SIMULCAST_STATE_UNINITIALIZED),
    };
};


- (NSArray<NSString *> *)supportedEvents {
    return @[@"state-change",
             @"play-started",
             @"elapse",
             @"error"
     ];
}


RCT_EXPORT_METHOD(initialize:(NSString *)token) {
    NSLog(@"initializing");

    _streamer = [[FMSimulcastStreamer alloc] initSimulcastWithToken:token withDelegate: self];
}

RCT_EXPORT_METHOD(connect) {
    NSLog(@"connecting");
    [_streamer connect];
}

RCT_EXPORT_METHOD(disconnect) {
    NSLog(@"disconnecting");
    [_streamer disconnect];
}


- (void)nextItemBegan:(FMAudioItem * _Nonnull)item {
    NSLog(@"next item began: %@", item);
    
    if (item == NULL || item.id == NULL) {
        [self sendEventWithName:@"play-started" body:@{ @"play": [NSNull null] }];

    } else {
       [self sendEventWithName:@"play-started" body:@{
        @"play": @{
                @"title": item.name,
                @"artist": item.artist,
                @"album": item.album,
                @"metadata": item.metadata,
                @"duration": @(item.duration)
                }
        }];
    }
}

- (void)stateChanged:(FMSimulcastPlaybackState)state {
    NSLog(@"state change to %ld", state);
    
    [self sendEventWithName:@"state-change" body:@{@"state":@(state)}];
}

- (void)elapse:(CMTime)elapseTime {
    long duration = lroundf(CMTimeGetSeconds(elapseTime));
    [self sendEventWithName:@"elapse" body:@{@"elapsed":@(duration)}];
}

- (void)onError:(NSString * _Nullable)error {
    RCTLogInfo(@"Error %@", error);
    [self sendEventWithName:@"error" body:@{@"error":error}];
}

RCT_EXPORT_METHOD(setVolume: (float) volume)
{
    NSLog(@"setting volume to %f", volume);

    _streamer.volume = volume;
}


- (void)stopObserving {
    [_streamer disconnect];
}

@end
