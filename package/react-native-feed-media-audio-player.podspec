require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-feed-media-audio-player"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-feed-media-audio-player
                   DESC
  s.homepage     = "https://github.com/feedfm/feed-media-audio-player"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Arveen Kumar" => "arveen@feed.fm", "Eric Lambrecht" => "eric@feed.fm" }
  s.platforms    = { :ios => "12.4" }
  s.source       = { :git => "https://github.com/feedfm/feed-media-audio-player.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  
  s.dependency 'FeedMedia', '= 5.5.1'
  
  # ...
  # s.dependency "..."
end

