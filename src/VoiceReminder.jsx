import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import SpeakerIcon from "@mui/icons-material/Speaker";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";

const VoiceReminder = () => {
  const [reminder, setReminder] = useState("");
  const [reminders, setReminders] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isAnnoying, setIsAnnoying] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [checkboxCount, setCheckboxCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(null);

  const speak = useCallback(
    (text) => {
      if (window.speechSynthesis && audioEnabled) {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ru-RU";
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        console.log("Синтез речи не поддерживается или аудио не включено");
      }
    },
    [audioEnabled],
  );

  const handleSetReminder = () => {
    setReminders([...reminders, { text: reminder, done: false }]);
    setReminder("");
    speak(`Хорошо, я буду напоминать вам каждые 5 секунд ${reminder}`);
  };

  const startAnnoying = () => {
    setIsAnnoying(true);
  };

  const stopAnnoying = () => {
    setIsAnnoying(false);
  };

  const handleCheckboxChange = (index) => {
    const newReminders = reminders.map((reminder, i) => {
      if (i === index) {
        if (!reminder.done) {
          setCompletedCount(completedCount + 1);
        } else {
          setCompletedCount(completedCount - 1);
        }
        return { ...reminder, done: !reminder.done };
      }
      return reminder;
    });
    setReminders(newReminders);
    setCheckboxCount(checkboxCount + 1);
  };

  const handleDeleteReminder = (index) => {
    const deletedReminder = reminders[index];
    if (deletedReminder.done) {
      setCompletedCount(completedCount - 1);
    }
    const newReminders = reminders.filter((_, i) => i !== index);
    setReminders(newReminders);
  };

  useEffect(() => {
    let intervalId;
    if (isAnnoying && reminders.length > 0) {
      intervalId = setInterval(() => {
        reminders.forEach((reminder, index) => {
          if (!reminder.done) {
            speak(reminder.text);
            setCurrentReminderIndex(index);
          }
        });
      }, 5000); // Напоминание каждые 5 секунд
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isAnnoying, reminders, speak]);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setBackgroundColor((prevColor) =>
        prevColor === "white" ? "red" : "white",
      );
    }, 1000);

    return () => clearInterval(colorInterval);
  }, []);

  const enableAudio = () => {
    setAudioEnabled(true);
    speak("Аудио включено");
  };

  const buttonStyle = {
    margin: "10px 0",
    fontWeight: "bold",
    padding: "10px 20px",
  };

  const reminderStyle = {
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.5em",
    animation: "blink-animation 1s infinite",
  };

  return (
    <Card
      sx={{
        maxWidth: "100%",
        margin: "10px auto",
        padding: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor,
      }}
    >
      <CardHeader
        title="Голосовое напоминание"
        sx={{
          backgroundColor: "#1976d2",
          color: "#fff",
          borderRadius: "8px 8px 0 0",
        }}
      />
      <CardContent sx={{ padding: "16px" }}>
        <Button
          onClick={enableAudio}
          variant="contained"
          color="primary"
          fullWidth
          sx={buttonStyle}
        >
          Включить звук
        </Button>
        <div className="flex space-x-2 mb-4" style={{ marginTop: "16px" }}>
          <TextField
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="Введите напоминание"
            fullWidth
            sx={{ width: "100%" }}
          />
          <Button
            onClick={handleSetReminder}
            variant="contained"
            color="primary"
            startIcon={<MicIcon />}
            fullWidth
            sx={buttonStyle}
          >
            Установить напоминание
          </Button>
        </div>
        {reminders.length > 0 && (
          <div>
            <Typography variant="body1" style={{ marginTop: "16px" }}>
              Текущие напоминания:
            </Typography>
            <List sx={{ marginTop: "20px" }}>
              {reminders.map((reminder, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={reminder.text}
                    sx={
                      currentReminderIndex === index
                        ? reminderStyle
                        : {
                            textDecoration: reminder.done
                              ? "line-through"
                              : "none",
                          }
                    }
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      checked={reminder.done}
                      onChange={() => handleCheckboxChange(index)}
                      sx={{ "& .MuiCheckbox-root": { color: "#1976d2" } }}
                    />
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteReminder(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Typography variant="body1" style={{ marginTop: "16px" }}>
              Общее количество нажатий на чекбоксы: {checkboxCount}
            </Typography>
            <Typography variant="body1" style={{ marginTop: "16px" }}>
              Общее количество выполненных дел: {completedCount}
            </Typography>
          </div>
        )}
        {reminders.some((reminder) => reminder.done) && (
          <div>
            <Typography variant="body1" style={{ marginTop: "16px" }}>
              Выполненные дела:
            </Typography>
            <List sx={{ marginTop: "20px" }}>
              {reminders
                .filter((reminder) => reminder.done)
                .map((reminder, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={reminder.text}
                      sx={{ textDecoration: "line-through" }}
                    />
                  </ListItem>
                ))}
            </List>
          </div>
        )}
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={startAnnoying}
            variant="contained"
            color="secondary"
            startIcon={<SpeakerIcon />}
            fullWidth
            sx={buttonStyle}
          >
            Начать напоминания
          </Button>
          <Button
            onClick={stopAnnoying}
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            fullWidth
            sx={buttonStyle}
          >
            Остановить напоминания
          </Button>
        </div>
        {!audioEnabled && (
          <Typography
            variant="body1"
            color="error"
            style={{ marginTop: "16px" }}
          >
            Включите звук для работы напоминаний.
          </Typography>
        )}
      </CardContent>
      <style>
        {`
          @keyframes blink-animation {
            0% { color: yellow; transform: scale(1); }
            50% { color: green; transform: scale(1.1); }
            100% { color: yellow; transform: scale(1); }
          }
        `}
      </style>
    </Card>
  );
};

export default VoiceReminder;
