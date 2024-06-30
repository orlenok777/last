import React, { useState, useEffect } from "react";
import { View, Text, Button, Platform } from "react-native";
import * as Speech from "expo-speech";

const WaterReminderApp = () => {
  const [isActive, setIsActive] = useState(false);
  const reminderInterval = 3600000; // 1 hour in milliseconds

  useEffect(() => {
    let intervalId;

    if (isActive) {
      intervalId = setInterval(() => {
        speakReminder();
      }, reminderInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive]);

  const speakReminder = () => {
    const message = "Пожалуйста, не забудьте выпить воды!";
    Speech.speak(message, { language: "ru" });
  };

  const toggleReminder = () => {
    setIsActive(!isActive);
    if (!isActive) {
      speakReminder(); // Speak immediately when activated
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        {isActive ? "Напоминания активны" : "Напоминания неактивны"}
      </Text>
      <Button
        title={isActive ? "Выключить напоминания" : "Включить напоминания"}
        onPress={toggleReminder}
      />
    </View>
  );
};

export default WaterReminderApp;
