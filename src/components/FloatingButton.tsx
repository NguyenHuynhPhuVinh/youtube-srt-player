import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@constants/colors";

interface FloatingButtonProps {
  onPress: () => void;
  onSettingsPress: () => void;
  visible: boolean;
  hasSubtitles?: boolean;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  onSettingsPress,
  visible,
  hasSubtitles = false,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="format-size"
          size={20}
          color={COLORS.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fabButton, hasSubtitles && styles.fabButtonActive]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={hasSubtitles ? "subtitles" : "subtitles-outline"}
            size={24}
            color={COLORS.text}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 16,
    alignItems: "center",
    gap: 10,
    zIndex: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FloatingButton;
