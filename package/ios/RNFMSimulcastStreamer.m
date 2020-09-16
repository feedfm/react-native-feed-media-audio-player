//
//  RNFMSimulcastStreamer.m
//  RNFMAudioPlayer
//
//  Created by Arveen kumar on 9/15/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "RNFMSimulcastStreamer.h"



@implementation RCTConvert (FMSimulcastPlaybackState)

SIMULCAST_STATE_IDLE,

/**
 * Playing
 */
SIMULCAST_STATE_PLAYING,
/**
 * Playback has been stopped
 */
SIMULCAST_STATE_STOPPED,
/**
 * Player is stalled and waiting for data from the stream
 */
SIMULCAST_STATE_STALLED,
/**
 * Music unavailable and should not be played for this user.
 */
SIMULCAST_STATE_MUSIC_UNAVAILABLE

RCT_ENUM_CONVERTER(FMSimulcastPlaybackState, (@{
  @"SimulcastStateIdle": @(SIMULCAST_STATE_IDLE),
  @"SimulcastStatePlaying": @(SIMULCAST_STATE_PLAYING),
  @"PlaybackStateStopped": @(SIMULCAST_STATE_STOPPED),
  @"SimulcastStateStalled": @(SIMULCAST_STATE_STALLED),
  @"SimulcastStateUnavailable": @(SIMULCAST_STATE_MUSIC_UNAVAILABLE),
  }), FMAudioPlayerPlaybackStateUninitialized, integerValue)

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
          @"PlaybackStateStopped": @(SIMULCAST_STATE_STOPPED),
          @"SimulcastStateStalled": @(SIMULCAST_STATE_STALLED),
          @"SimulcastStateUnavailable": @(SIMULCAST_STATE_MUSIC_UNAVAILABLE),
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
 
    streamer = [[FMSimulcastStreamer alloc] initSimulcastListenerWithToken:token withDelegate: self isPlayer:YES];
    
}

RCT_EXPORT_METHOD(connect) {
    [streamer connect];
}



RCT_EXPORT_METHOD(disconnect) {
    [streamer disconnect];
}



- (void)nextItemBegan:(FMAudioItem * _Nonnull)item {
   [self sendEventWithName:@"nextItemBegan" body:@{
    @"play": @{
            @"id": item.playId,
            @"title": item.name,
            @"artist": item.artist,
            @"album": item.album,
            @"metadata": item.metadata,
            @"duration": @(duration)
            }
    }];
}

- (void)stateChanged:(FMSimulcastPlaybackState)state {
    
    [self sendEventWithName:@"stateChange" body:@{@"state":state}];
}

- (void)elapse:(CMTime)elapseTime {
    RCTLogInfo(@"Elapsed seconds = %f", CMTimeGetSeconds(elapseTime));
    [self sendEventWithName:@"elapse" body:@{@"elapsed":CMTimeGetSeconds(elapseTime)}];
}

- (void)onError:(NSString * _Nullable)error {
    RCTLogInfo(@"Error %@", error);
    [self sendEventWithName:@"error" body:@{@"error":error}];
}



RCT_EXPORT_METHOD(setVolume: (float) volume)
{
    streamer.volume = volume;
}


- (void)stopObserving {
    
    [streamer disconnect];
    
}

@end
