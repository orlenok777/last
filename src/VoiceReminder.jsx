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
    speak(`Хорошо, я буду напоминать вам ${reminder}`);
  };

  const startAnnoying = () => {
    setIsAnnoying(true);
  };

  const stopAnnoying = () => {
    setIsAnnoying(false);
  };

  const handleCheckboxChange = (index) => {
    const newReminders = reminders.map((reminder, i) =>
      i === index ? { ...reminder, done: !reminder.done } : reminder,
    );
    setReminders(newReminders);
  };

  const handleDeleteReminder = (index) => {
    const newReminders = reminders.filter((_, i) => i !== index);
    setReminders(newReminders);
  };

  useEffect(() => {
    let intervalId;
    if (isAnnoying && reminders.length > 0) {
      intervalId = setInterval(() => {
        reminders.forEach((reminder) => {
          if (!reminder.done) {
            speak(reminder.text);
          }
        });
      }, 10000); // Напоминание каждые 10 секунд
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isAnnoying, reminders, speak]);

  const enableAudio = () => {
    setAudioEnabled(true);
    speak("Аудио включено");
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader title="Голосовое напоминание" />
      <CardContent>
        <Button
          onClick={enableAudio}
          variant="contained"
          color="primary"
          fullWidth
        >
          Включить звук
        </Button>
        <div className="flex space-x-2 mb-4" style={{ marginTop: "16px" }}>
          <TextField
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="Введите напоминание"
            fullWidth
          />
          <Button
            onClick={handleSetReminder}
            variant="contained"
            color="primary"
            startIcon={<MicIcon />}
            fullWidth
          >
            Установить напоминание 9
          </Button>
        </div>
        {reminders.length > 0 && (
          <div>
            <Typography variant="body1" style={{ marginTop: "16px" }}>
              Текущие напоминания:
            </Typography>
            <List>
              {reminders.map((reminder, index) => (
                <ListItem key={index}>
                  <ListItemText primary={reminder.text} />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      checked={reminder.done}
                      onChange={() => handleCheckboxChange(index)}
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
          </div>
        )}
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={startAnnoying}
            variant="contained"
            color="secondary"
            startIcon={<SpeakerIcon />}
            fullWidth
          >
            Начать напоминания
          </Button>
          <Button
            onClick={stopAnnoying}
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            fullWidth
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
    </Card>
  );
};

export default VoiceReminder;
