import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
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
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name={hasSubtitles ? "check" : "plus"}
        size={32}
        color={COLORS.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabButtonActive: {
    backgroundColor: "#4CAF50", // Green color for active state
  },
});

export default FloatingButton;
