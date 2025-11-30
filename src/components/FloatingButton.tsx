import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@constants/colors";

interface FloatingButtonProps {
  onPress: () => void;
  visible: boolean;
  hasSubtitles?: boolean;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  visible,
  hasSubtitles = false,
}) => {
  if (!visible) return null;

  return (
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
  );
};

const styles = StyleSheet.create({
  fabButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
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
