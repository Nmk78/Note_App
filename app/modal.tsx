import { router, useNavigation } from "expo-router";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Note } from "@/utils/types/types";
import { Note } from "../utils/types/types";

import { Feather } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
const NOTE_STORAGE_KEY = "notes";


export default function Modal() {
  const [note, setNote] = useState<Note>({
    id: Math.random().toString(36).substring(2, 15),
    title: "Untitled Note",
    content: "",
    lastUpdated: new Date().toISOString(),
  });
  const [originalNote, setOriginalNote] = useState<Note | null>(null);
  const [storedNotes, setStoredNotes] = useState<Note[] | null>(null);
  const navigation = useNavigation(); // not router here
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);
  const [inputHeight, setInputHeight] = useState(200); // Initial height


  const db = useSQLiteContext();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const results = await db.getAllAsync<Note>('SELECT * FROM notes ORDER BY lastUpdated DESC');
        setStoredNotes(results);
  
        const existingNote = results.find((n) => n.id === note.id);
        if (existingNote) {
          setNote(existingNote);
          setOriginalNote(existingNote);
        }
  
        console.log("🚀 ~ Modal ~ loadedNotes:", results);
      } catch (err) {
        console.error("Failed to load notes from SQLite:", err);
      }
    };
  
    loadNotes();
  }, []);
  

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!note || !originalNote) return;
  
      const hasChanged =
        note.title !== originalNote.title ||
        note.content !== originalNote.content;
  
      const isTitleEmpty = !note.title.trim();
      const isContentEmpty = !note.content.trim();
      const isValid = !(isTitleEmpty && isContentEmpty);
  
      if (hasChanged && isValid) {
        try {
          await db.runAsync(
            `INSERT OR REPLACE INTO notes (id, title, content, lastUpdated)
             VALUES (?, ?, ?, ?)`,
            note.id,
            note.title,
            note.content,
            new Date().toISOString()
          );
          setOriginalNote(note);
          console.log("🔁 Auto-saved note to SQLite:", note);
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }
    }, 5000);
  
    return () => clearInterval(interval);
  }, [note, originalNote]);
  
  const handleSaveOnExit = async () => {
    if (!note) return;
  
    const isTitleEmpty = !note.title.trim();
    const isContentEmpty = !note.content.trim();
    const isEmpty = isTitleEmpty && isContentEmpty;
    const isDefaultUntouched = note.title === "Untitled Note" && isContentEmpty;
  
    const hasChanged =
      !originalNote ||
      note.title !== originalNote.title ||
      note.content !== originalNote.content;
  
    if (hasChanged && !isEmpty && !isDefaultUntouched) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO notes (id, title, content, lastUpdated)
           VALUES (?, ?, ?, ?)`,
          note.id,
          note.title,
          note.content,
          new Date().toISOString()
        );
  
        const updatedNotes = await db.getAllAsync<Note>('SELECT * FROM notes ORDER BY lastUpdated DESC');
        setStoredNotes(updatedNotes);
  
        console.log("🚀 ~ Saved updated notes to SQLite:", updatedNotes);
      } catch (err) {
        console.error("Save on exit failed:", err);
      }
    }
  
    console.log("Navigating back... Note:", note);
    if (navigation.canGoBack?.()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      handleSaveOnExit();
    });

    return unsubscribe;
  }, [navigation, note, originalNote]);
  if (!note) return null;

  return (
    <Animated.View
      entering={FadeIn}
      className="flex-1 justify-end items-center bg-black/40"
    >
      <Animated.View
        entering={SlideInDown}
        className="w-full h-full bg-white pt-10"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-2 border-b border-gray-300">
            <Pressable onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="black" />
            </Pressable>
          </View>

          {/* Text input for note title */}
          <TextInput
            // ref={titleInputRef}
            className="p-4 text-lg font-bold border-b border-gray-300 bg-white"
            placeholder="Title"
            value={note?.title}
            selection={selection}
            onBlur={() => setSelection(undefined)} // reset after editing
            onChangeText={(text) => {
              setNote((prev) =>
                prev
                  ? {
                      ...prev,
                      title: text,
                      lastUpdated: new Date().toISOString(),
                    }
                  : prev
              );
            }}
          />

          {/* Text input for note content */}
          <View style={styles.container}>
            <TextInput
              style={[styles.textInput, { height: Math.max(200, inputHeight) }]}
              placeholder="Write your note here..."
              value={note?.content}
              onChangeText={(text) =>
                setNote((prev) =>
                  prev
                    ? {
                        ...prev,
                        content: text,
                        lastUpdated: new Date().toISOString(),
                      }
                    : prev
                )
              }
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              autoCorrect={true}
              blurOnSubmit={false}
              onContentSizeChange={(event) => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    shadowOffset: { width: 0, height: 1 },
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#333",
    textAlignVertical: "top",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
});
