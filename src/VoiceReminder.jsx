import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import SpeakerIcon from "@mui/icons-material/Speaker";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  REMINDER: "reminder",
};

const DraggableListItem = ({ reminder, index, moveReminder }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.REMINDER,
    hover(item) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveReminder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.REMINDER,
    item: { type: ItemTypes.REMINDER, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <ListItem ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <ListItemText primary={reminder.text} />
      <Button
        variant="contained"
        color="secondary"
        onClick={() => moveReminder(index)}
      >
        Удалить
      </Button>
    </ListItem>
  );
};

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
  const [blinkingEnabled, setBlinkingEnabled] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [sortOrder, setSortOrder] = useState("date");
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [note, setNote] = useState("");
  const [noteIndex, setNoteIndex] = useState(null);
  const [predefinedReminders, setPredefinedReminders] = useState([
    "Выпить воды",
    "Сделать перерыв",
    "Размяться",
    "Проверить почту",
    "Позвонить другу",
    "Принять лекарства",
    "Проверить социальные сети",
    "Сделать дыхательные упражнения",
    "Написать список дел",
    "Сходить на прогулку",
    "Подъём",
    "Выпить три стакана воды",
    "Принять таблетки",
    "Позавтракать",
    "Сделать спорт 10 минут",
    "Сделать холодную ванну 10 минут",
    "Убрать квартиру 10 минут",
    "Покормить кошку",
    "Медитация 10 минут",
    "Выход на работу",
  ]);

  const reminderPackages = {
    "Здоровье и фитнес": [
      "Выпить воды",
      "Размяться",
      "Сделать дыхательные упражнения",
      "Сходить на прогулку",
    ],
    "Работа и продуктивность": [
      "Сделать перерыв",
      "Проверить почту",
      "Написать список дел",
      "Проверить социальные сети",
    ],
    "Личные дела": [
      "Позвонить другу",
      "Принять лекарства",
      "Уделить время хобби",
      "Отправить сообщение семье",
    ],
    "Утренняя рутина": [
      "Подъём",
      "Выпить три стакана воды",
      "Принять таблетки",
      "Позавтракать",
      "Сделать спорт 10 минут",
      "Сделать холодную ванну 10 минут",
      "Убрать квартиру 10 минут",
      "Покормить кошку",
      "Медитация 10 минут",
      "Выход на работу",
    ],
    "Дневная рутина": [
      "Сделать перерыв",
      "Выпить воды",
      "Размяться",
      "Проверить почту",
    ],
  };

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await axios.get("/api/reminders");
        setReminders(
          response.data.map((r) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          })),
        );
      } catch (error) {
        console.error("Ошибка при получении напоминаний:", error);
      }
    };

    fetchReminders();
  }, []);

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

  const handleSetReminder = async (text = reminder) => {
    try {
      const response = await axios.post("/api/reminders", { text });
      setReminders([
        ...reminders,
        { id: response.data.id, text, done: false, createdAt: new Date() },
      ]);
      setReminder("");
      speak(`Хорошо, я буду напоминать вам каждые 5 секунд ${text}`);
    } catch (error) {
      console.error("Ошибка при добавлении напоминания:", error);
    }
  };

  const startAnnoying = () => {
    setIsAnnoying(true);
  };

  const stopAnnoying = () => {
    setIsAnnoying(false);
  };

  const handleCheckboxChange = async (index) => {
    const reminder = reminders[index];
    try {
      await axios.put(`/api/reminders/${reminder.id}`, {
        done: !reminder.done,
      });
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
    } catch (error) {
      console.error("Ошибка при обновлении напоминания:", error);
    }
  };

  const handleDeleteReminder = async (index) => {
    const reminder = reminders[index];
    try {
      await axios.delete(`/api/reminders/${reminder.id}`);
      if (reminder.done) {
        setCompletedCount(completedCount - 1);
      }
      const newReminders = reminders.filter((_, i) => i !== index);
      setReminders(newReminders);
    } catch (error) {
      console.error("Ошибка при удалении напоминания:", error);
    }
  };

  const handleAddNote = (index) => {
    setNoteIndex(index);
    setNote(reminders[index].note || "");
    setOpenNoteDialog(true);
  };

  const saveNote = () => {
    const newReminders = reminders.map((reminder, i) => {
      if (i === noteIndex) {
        return { ...reminder, note };
      }
      return reminder;
    });
    setReminders(newReminders);
    setOpenNoteDialog(false);
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
    if (blinkingEnabled) {
      const colorInterval = setInterval(() => {
        setBackgroundColor((prevColor) =>
          prevColor === "white" ? "red" : "white",
        );
      }, 1000);

      return () => clearInterval(colorInterval);
    }
  }, [blinkingEnabled]);

  const enableAudio = () => {
    setAudioEnabled(true);
    speak("Аудио включено");
  };

  const enableBlinking = () => {
    setBlinkingEnabled(true);
  };

  const disableBlinking = () => {
    setBlinkingEnabled(false);
    setBackgroundColor("white"); // Reset background color to white when blinking is disabled
  };

  const handleSelectPackage = (event) => {
    const selected = event.target.value;
    setSelectedPackage(selected);
    if (selected) {
      reminderPackages[selected].forEach((task) => handleSetReminder(task));
    }
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const getSortedReminders = () => {
    return reminders.sort((a, b) => {
      if (sortOrder === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === "status") {
        return a.done - b.done;
      }
      return 0;
    });
  };

  const movePredefinedReminder = (dragIndex, hoverIndex) => {
    const dragReminder = predefinedReminders[dragIndex];
    const updatedReminders = [...predefinedReminders];
    updatedReminders.splice(dragIndex, 1);
    updatedReminders.splice(hoverIndex, 0, dragReminder);
    setPredefinedReminders(updatedReminders);
  };

  const handleAddPredefinedReminder = () => {
    if (reminder) {
      setPredefinedReminders([...predefinedReminders, reminder]);
      setReminder("");
    }
  };

  const buttonStyle = {
    margin: "10px 0",
    fontWeight: "bold",
    padding: "10px 20px",
  };

  const reminderStyle = {
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "2.5em",
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
            onClick={() => handleSetReminder()}
            variant="contained"
            color="primary"
            startIcon={<MicIcon />}
            fullWidth
            sx={buttonStyle}
          >
            Установить напоминание
          </Button>
        </div>
        <div className="flex space-x-2 mb-4" style={{ marginTop: "16px" }}>
          <TextField
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="Добавить часто задаваемое задание"
            fullWidth
            sx={{ width: "100%" }}
          />
          <Button
            onClick={handleAddPredefinedReminder}
            variant="contained"
            color="primary"
            fullWidth
            sx={buttonStyle}
          >
            Добавить
          </Button>
        </div>
        <div style={{ marginTop: "16px" }}>
          <Typography variant="body1">Часто задаваемые задания:</Typography>
          <DndProvider backend={HTML5Backend}>
            <List sx={{ marginTop: "16px" }}>
              {predefinedReminders.map((predefinedReminder, index) => (
                <DraggableListItem
                  key={index}
                  index={index}
                  reminder={{ text: predefinedReminder }}
                  moveReminder={movePredefinedReminder}
                />
              ))}
            </List>
          </DndProvider>
        </div>
        <div style={{ marginTop: "16px" }}>
          <FormControl fullWidth>
            <InputLabel id="select-package-label">
              Выберите пакет заданий
            </InputLabel>
            <Select
              labelId="select-package-label"
              value={selectedPackage}
              onChange={handleSelectPackage}
              fullWidth
            >
              {Object.keys(reminderPackages).map((packageName, index) => (
                <MenuItem key={index} value={packageName}>
                  {packageName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div style={{ marginTop: "16px" }}>
          <FormControl fullWidth>
            <InputLabel id="sort-order-label">Сортировать по</InputLabel>
            <Select
              labelId="sort-order-label"
              value={sortOrder}
              onChange={handleSortChange}
              fullWidth
            >
              <MenuItem value="date">Дате добавления</MenuItem>
              <MenuItem value="status">Статусу выполнения</MenuItem>
            </Select>
          </FormControl>
        </div>
        {reminders.length > 0 && (
          <div>
            <Typography variant="body1" style={{ marginTop: "16px" }}>
              Текущие напоминания:
            </Typography>
            <List sx={{ marginTop: "20px" }}>
              {getSortedReminders().map((reminder, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${reminder.text} (${Math.floor((new Date() - new Date(reminder.createdAt)) / 60000)} минут назад)`}
                    secondary={reminder.note}
                    sx={
                      currentReminderIndex === index
                        ? reminderStyle
                        : {
                            textDecoration: reminder.done
                              ? "line-through"
                              : "none",
                            fontWeight:
                              currentReminderIndex === index
                                ? "bold"
                                : "normal",
                            fontSize:
                              currentReminderIndex === index ? "2em" : "1em",
                          }
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="add-note"
                      onClick={() => handleAddNote(index)}
                    >
                      <MicIcon />
                    </IconButton>
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
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={enableBlinking}
            variant="contained"
            color="secondary"
            fullWidth
            sx={buttonStyle}
          >
            Включить мигание фона
          </Button>
          <Button
            onClick={disableBlinking}
            variant="contained"
            color="secondary"
            fullWidth
            sx={buttonStyle}
          >
            Отключить мигание фона
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
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)}>
        <DialogTitle>Добавить заметку</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Добавьте заметку к этому заданию.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Заметка"
            type="text"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={saveNote} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
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
