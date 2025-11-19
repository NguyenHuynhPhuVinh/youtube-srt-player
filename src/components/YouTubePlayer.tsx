import React from "react";
import { View } from "react-native";
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview";
import { CUSTOM_USER_AGENT, INJECTED_JAVASCRIPT } from "@constants/scripts";

interface YouTubePlayerProps {
  onMessage: (event: WebViewMessageEvent) => void;
  onNavigationStateChange: (navState: WebViewNavigation) => void;
}

const YouTubePlayer = React.forwardRef<WebView, YouTubePlayerProps>(
  ({ onMessage, onNavigationStateChange }, ref) => {
    return (
      <View className="flex-1 relative overflow-hidden">
        <WebView
          ref={ref}
          source={{ uri: "https://m.youtube.com" }}
          style={{ flex: 1, backgroundColor: "black" }}
          userAgent={CUSTOM_USER_AGENT}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={onMessage}
          onNavigationStateChange={onNavigationStateChange}
          // Fullscreen & Rotation Config
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    );
  }
);

export default YouTubePlayer;
