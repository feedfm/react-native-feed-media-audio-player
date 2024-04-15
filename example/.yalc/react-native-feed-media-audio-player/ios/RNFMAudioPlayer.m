
#import "RNFMAudioPlayer.h"

@implementation RCTConvert (AudioPlayerPlaybackState)

RCT_ENUM_CONVERTER(FMAudioPlayerPlaybackState, (@{
  @"audioPlayerPlaybackStateOfflineOnly": @(FMAudioPlayerPlaybackStateOfflineOnly),
  @"audioPlayerPlaybackStateUninitialized": @(FMAudioPlayerPlaybackStateUninitialized),
  @"audioPlayerPlaybackStateUnavailable": @(FMAudioPlayerPlaybackStateUnavailable),
  @"audioPlayerPlaybackStateWaitingForItem": @(FMAudioPlayerPlaybackStateWaitingForItem),
  @"audioPlayerPlaybackStateReadyToPlay": @(FMAudioPlayerPlaybackStateReadyToPlay),
  @"audioPlayerPlaybackStatePlaying": @(FMAudioPlayerPlaybackStatePlaying),
  @"audioPlayerPlaybackStatePaused": @(FMAudioPlayerPlaybackStatePaused),
  @"audioPlayerPlaybackStateStalled": @(FMAudioPlayerPlaybackStateStalled),
  @"audioPlayerPlaybackStateSkip": @(FMAudioPlayerPlaybackStateRequestingSkip),
  @"audioPlayerPlaybackStateComplete": @(FMAudioPlayerPlaybackStateComplete)
  }), FMAudioPlayerPlaybackStateUninitialized, integerValue)

@end


@implementation RNFMAudioPlayer

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
         @"audioPlayerPlaybackStateOfflineOnly": @(FMAudioPlayerPlaybackStateOfflineOnly),
         @"audioPlayerPlaybackStateUninitialized": @(FMAudioPlayerPlaybackStateUninitialized),
         @"audioPlayerPlaybackStateUnavailable": @(FMAudioPlayerPlaybackStateUnavailable),
         @"audioPlayerPlaybackStateWaitingForItem": @(FMAudioPlayerPlaybackStateWaitingForItem),
         @"audioPlayerPlaybackStateReadyToPlay": @(FMAudioPlayerPlaybackStateReadyToPlay),
         @"audioPlayerPlaybackStatePlaying": @(FMAudioPlayerPlaybackStatePlaying),
         @"audioPlayerPlaybackStatePaused": @(FMAudioPlayerPlaybackStatePaused),
         @"audioPlayerPlaybackStateStalled": @(FMAudioPlayerPlaybackStateStalled),
         @"audioPlayerPlaybackStateRequestingSkip": @(FMAudioPlayerPlaybackStateRequestingSkip)
    };
};

- (NSArray<NSString *> *)supportedEvents {
    return @[@"musicQueued",
             @"newClientID",
             @"availability",
             @"state-change",
             @"station-change",
             @"play-started",
             @"skip-failed",
             @"elapse",
             @"session-updated"
     ];
}

- (NSArray<NSDictionary *> *) mapStationListToDictionary: (FMStationArray *) inStations {
    NSMutableArray<NSDictionary *> *outStations = [[NSMutableArray alloc] init];
    
    for (FMStation *station in inStations) {
        [outStations addObject:@{
                 @"id": station.identifier,
                 @"name": station.name,
                 @"hasNewMusic": [NSNumber numberWithBool: station.hasNewMusic],
                 @"options": station.options
             }];
    }
    
    return outStations;
}

RCT_EXPORT_METHOD(initializeWithToken:(NSString *)token secret:(NSString *)secret enableBackgroundMusic:(BOOL)enableBackgroundMusic)
{
    FMLogSetLevel(FMLogLevelDebug);
    _player = FMAudioPlayer.sharedPlayer;

    if (!enableBackgroundMusic) {
        _player.disableAVAudioSession = YES;
    }
    
    [FMAudioPlayer setClientToken:token secret:secret];

    FMAudioPlayer.autoNetworkRetryEnabled = false;
    FMAudioPlayer.sharedPlayer.doesHandleRemoteCommands = enableBackgroundMusic;

    [FMAudioPlayer.sharedPlayer whenAvailable:^{
        // the active station is not set at this time, so assume it is the first station
        FMStation *station = [self->_player.stationList firstObject];
        
        [self sendEventWithName:@"availability" body:@{
                                           @"available": @YES,
                                           @"stations": [self mapStationListToDictionary:self->_player.stationList],
                                           @"activeStationId": station.identifier,
                                           @"clientID": [self->_player getClientId]
                                           }];
    } notAvailable:^{
        [self sendEventWithName:@"availability" body:@{
                                           @"available": @NO
                                           }];
    }];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onNewClientIDGenerated:) name:FMAudioPlayerNewClientIdAvailable object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
             selector:@selector(onPlaybackStateDidChangeNotification:) name:FMAudioPlayerPlaybackStateDidChangeNotification object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
             selector:@selector(onActiveStationDidChangeNotification:) name:FMAudioPlayerActiveStationDidChangeNotification object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
             selector:@selector(onCurrentItemDidBeginPlaybackNotification:) name:FMAudioPlayerCurrentItemDidBeginPlaybackNotification object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                 selector:@selector(onSkipFailedNotification:) name:FMAudioPlayerSkipFailedNotification object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                 selector:@selector(onMusicQueued:) name:FMAudioPlayerMusicQueuedNotification object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                              selector:@selector(onElapsedNotification:) name:FMAudioPlayerTimeElapseNotification
                                                object:_player];
}

    
RCT_EXPORT_METHOD(setActiveStation:(NSString *)id)
{
    NSUInteger index = [_player.stationList indexOfObjectPassingTest:^BOOL(FMStation *station, NSUInteger idx, BOOL * _Nonnull stop) {
        return [station.identifier isEqualToString:id];
    }];
    
    if (index == NSNotFound) {
        RCTLogInfo(@"Cannot set active station to %@ because no station found with that id", id);
        return;
    }
    
    _player.activeStation = _player.stationList[index];
}

RCT_EXPORT_METHOD(enableAudioSession: (BOOL) enable) {
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    player.disableAVAudioSession = !enable;
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
    [player pause];
}

RCT_EXPORT_METHOD(skip)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    [player skip];
}

RCT_REMAP_METHOD(canLike, canLikeResolver: (RCTPromiseResolveBlock)resolve
     rejecter:(RCTPromiseRejectBlock)reject)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    resolve([NSNumber numberWithBool:[player canLike]]);
}

RCT_REMAP_METHOD(canSkip, canSkipResolver: (RCTPromiseResolveBlock)resolve
     rejecter:(RCTPromiseRejectBlock)reject)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    
    resolve([NSNumber numberWithBool:[player canSkip]]);
}
RCT_EXPORT_METHOD(stop)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    [player stop];
}

RCT_EXPORT_METHOD(setVolume: (float) volume)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    player.mixVolume = volume;
}

RCT_REMAP_METHOD(maxSeekableLengthInSeconds, maxSeekableLengthInSecondsWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([NSNumber numberWithDouble: FMAudioPlayer.sharedPlayer.maxSeekableLength]);
}

RCT_EXPORT_METHOD(seekCurrentStationBy: (float) seconds)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    [player seekStationBy:seconds];
}

RCT_EXPORT_METHOD(setClientID: (NSString*)cid )
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    
    [player stop];
    [player setClientId:cid];
    
    [self.player updateSession:^{
        FMStation *station = [self->_player.stationList firstObject];

        [self sendEventWithName:@"session-updated" body:@{
            @"stations": [self mapStationListToDictionary:self->_player.stationList],
            @"activeStationId": station.identifier,
            @"clientID": [self->_player getClientId]

        }];
    }];
}

RCT_EXPORT_METHOD(updateSession)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    
    [player stop];
    [self.player updateSession:^{
        FMStation *station = [self->_player.stationList firstObject];

        [self sendEventWithName:@"session-updated" body:@{
            @"stations": [self mapStationListToDictionary:self->_player.stationList],
            @"activeStationId": station.identifier,
            @"clientID": [self->_player getClientId]

        }];
    }];
}

RCT_EXPORT_METHOD(createNewClientID)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    
    [player stop];
    [player createNewClientId];
}

RCT_EXPORT_METHOD(logEvent: (NSString*) event withParams:(NSDictionary*) params)
{
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    
    [player logEvent:event withParameters:params];
}
     
-(void) onMusicQueued: (NSNotification *)notification  {
    
    [self sendEventWithName:@"musicQueued" body:@{}];
    
}

- (void)stopObserving {
    // make sure to unsubscribe, or we might get 'Bridge is not set!' crashes
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    
    // kill music, since nobody is observing it any more
    [_player stop];
}

- (void) onNewClientIDGenerated: (NSNotification*)notification  {
    // once we get a new id, restart things so we get an updated list
    // of stations and associated metadata
    [self.player updateSession:^{
        FMStation *station = [self->_player.stationList firstObject];

        [self sendEventWithName:@"session-updated" body:@{
            @"stations": [self mapStationListToDictionary:self->_player.stationList],
            @"activeStationId": station.identifier,
            @"clientID": [self->_player getClientId]

        }];
    }];
}

- (void) onElapsedNotification: (NSNotification*)notification  {
    [self sendEventWithName:@"elapse" body:@{
        @"elapsed": [NSNumber numberWithDouble: _player.currentPlaybackTime]
    }];
}

- (void) onSkipFailedNotification: (NSNotification *)notification {
    [self sendEventWithName:@"skip-failed" body:@{ }];
}

- (void) onActiveStationDidChangeNotification: (NSNotification *)notification {
    FMAudioPlayer *player = [FMAudioPlayer sharedPlayer];
    if(player.activeStation.identifier != nil) {
        [self sendEventWithName:@"station-change" body:@{
            @"activeStationId": player.activeStation.identifier }];
    }
}

- (void) onPlaybackStateDidChangeNotification: (NSNotification *)notification {
    FMAudioPlayerPlaybackState state =_player.playbackState;
    
    // this might cause a notice when the state doesn't actually change, but I think
    // it's worth it to weed this state out
    if (state == FMAudioPlayerPlaybackStateComplete) {
        state = FMAudioPlayerPlaybackStateReadyToPlay;
    }
    
    [self sendEventWithName:@"state-change" body:@{
                                       @"state": @(state) }];
}

- (void) onCurrentItemDidBeginPlaybackNotification: (NSNotification *)notification {
    FMAudioItem *current = _player.currentItem;
    if(current != nil && current.station.identifier != nil) {
        long duration = lroundf(_player.currentItemDuration);
        [self sendEventWithName:@"play-started"
                           body:@{
                               @"play": @{
                                       @"id": current.playId,
                                       @"title": current.name,
                                       @"artist": current.artist,
                                       @"album": current.album,
                                       @"metadata": current.metadata,
                                       @"station_id": current.station.identifier,
                                       @"duration": @(duration)
                                       }
                               }];
    }
}


@end
  
