import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

import { COLORS } from "@constants/colors";

interface FloatingButtonProps {
  onPress: () => void;
  visible: boolean;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  visible,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.fabButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.fabIcon}>+</Text>
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
    elevation: 0,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.text,
    fontWeight: "300",
    marginTop: -2,
  },
});

export default FloatingButton;
