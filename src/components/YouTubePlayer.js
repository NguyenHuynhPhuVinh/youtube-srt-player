import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { CUSTOM_USER_AGENT, INJECTED_JAVASCRIPT } from "@constants/scripts";

import { COLORS } from "@constants/colors";

const YouTubePlayer = React.forwardRef(
  (
    { onMessage, onNavigationStateChange, onFullScreenOpen, onFullScreenClose },
    ref
  ) => {
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
          onFullScreenOpen={onFullScreenOpen}
          onFullScreenClose={onFullScreenClose}
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
