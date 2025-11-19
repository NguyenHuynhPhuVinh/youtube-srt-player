import React from "react";
import { StyleSheet, View } from "react-native";
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview";
import { CUSTOM_USER_AGENT, INJECTED_JAVASCRIPT } from "@constants/scripts";

import { COLORS } from "@constants/colors";

interface YouTubePlayerProps {
  onMessage: (event: WebViewMessageEvent) => void;
  onNavigationStateChange: (navState: WebViewNavigation) => void;
}

const YouTubePlayer = React.forwardRef<WebView, YouTubePlayerProps>(
  ({ onMessage, onNavigationStateChange }, ref) => {
    return (
      <View style={styles.videoContainer}>
        <WebView
          ref={ref}
          source={{ uri: "https://m.youtube.com" }}
          style={styles.webview}
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

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default YouTubePlayer;
