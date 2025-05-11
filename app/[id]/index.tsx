
import { router, useLocalSearchParams, useNavigation } from "expo-router"
import { Pressable, Text, TextInput, View, KeyboardAvoidingView, Platform, Share, Alert } from "react-native"
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated"
import { useState, useEffect, useDeferredValue, memo } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Feather, Ionicons, SimpleLineIcons } from "@expo/vector-icons"

import { useDebounce } from "../../utils/hooks/useDebounce"
import type { Note } from "../../utils/types/types"
import { useSQLiteContext } from "expo-sqlite"

const NOTE_STORAGE_KEY = "notes"

// Memoized component for note content to prevent re-renders
const MemoizedNoteContent = memo(
  ({ content, onChangeText }: { content: string; onChangeText: (text: string) => void }) => {
    return (
      <TextInput
        className="flex text-start p-4 text-base text-gray-900 bg-gray-100 text-top"
        placeholder="Write your note here..."
        value={content}
        onChangeText={onChangeText}
        multiline
      />
    )
  },
)

// Memoized component for note title to prevent re-renders
const MemoizedNoteTitle = memo(({ title, onChangeText }: { title: string; onChangeText: (text: string) => void }) => {
  return (
    <TextInput
      className="text-lg font-bold h-13 text-start text-gray-900 bg-gray-100 text-top"
      placeholder="Title"
      value={title}
      onChangeText={onChangeText}
    />
  )
})

export default function NoteScreen() {
  const { id } = useLocalSearchParams()
  const noteId = typeof id === "string" ? id : ""
  const navigation = useNavigation() // not router here

  // Log ID only when it changes, not on every render
  useEffect(() => {
    console.log("🚀 ~ NoteScreen ~ ID:", noteId)
  }, [noteId])

  if (!noteId) return null // or show a loading spinner

  // State for the current input values (updates immediately)
  const [inputTitle, setInputTitle] = useState<string>("")
  const [inputContent, setInputContent] = useState<string>("")

  // Debounced versions of the input values (updates after delay)
  const debouncedTitle = useDebounce(inputTitle, 700)
  const debouncedContent = useDebounce(inputContent, 700)

  // Defer expensive re-renders
  const deferredContent = useDeferredValue(inputContent)

  const [note, setNote] = useState<Note | undefined>()
  const [originalNote, setOriginalNote] = useState<Note | null>(null)
  const [storedNotes, setStoredNotes] = useState<Note[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isNewNote, setIsNewNote] = useState(false) // Track if it's a new note
  const db = useSQLiteContext();

  useEffect(() => {
    const loadNotes = async () => {
      const rows = await db.getAllAsync<Note>('SELECT * FROM notes');
      setStoredNotes(rows);
  
      const existingNote = rows.find((n) => n.id === noteId);
      if (existingNote) {
        setNote(existingNote);
        setInputTitle(existingNote.title);
        setInputContent(existingNote.content);
        setOriginalNote(existingNote);
        setIsNewNote(false);
      } else {
        const newNote: Note = {
          id: noteId || Math.random().toString(36).substring(2, 15),
          title: 'Untitled Note',
          content: '',
          lastUpdated: new Date().toISOString(),
        };
        setNote(newNote);
        setInputTitle(newNote.title);
        setInputContent(newNote.content);
        setOriginalNote(newNote);
        setIsNewNote(true);
      }
    };
  
    loadNotes();
  }, [noteId]);

  // Update the note when debounced values change
  useEffect(() => {
    if (!note) return;
  
    if (debouncedTitle !== note.title || debouncedContent !== note.content) {
      setIsSaving(true);
  
      const updatedNote = {
        ...note,
        title: debouncedTitle,
        content: debouncedContent,
        lastUpdated: new Date().toISOString(),
      };
  
      setNote(updatedNote);
  
      db.runAsync(
        `INSERT OR REPLACE INTO notes (id, title, content, lastUpdated) VALUES (?, ?, ?, ?)`,
        updatedNote.id,
        updatedNote.title,
        updatedNote.content,
        updatedNote.lastUpdated
      ).then(() => {
        setOriginalNote(updatedNote);
        setIsSaving(false);
        console.log("🔁 Saved note to SQLite:", updatedNote);
      });
    }
  }, [debouncedTitle, debouncedContent, note]);
  
  const handleSaveOnExit = async () => {
    if (!note) return;
  
    const isEmpty = !inputTitle.trim() && !inputContent.trim();
    const hasChanged = !originalNote || inputTitle !== originalNote.title || inputContent !== originalNote.content;
  
    if (hasChanged) {
      const finalNote = {
        ...note,
        title: inputTitle,
        content: inputContent,
        lastUpdated: new Date().toISOString(),
      };
  
      if (isEmpty) {
        await db.runAsync('DELETE FROM notes WHERE id = ?', finalNote.id);
      } else {
        await db.runAsync(
          `INSERT OR REPLACE INTO notes (id, title, content, lastUpdated) VALUES (?, ?, ?, ?)`,
          finalNote.id,
          finalNote.title,
          finalNote.content,
          finalNote.lastUpdated
        );
      }
  
      console.log("🚀 Saved note on exit:", finalNote);
    }
  
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      handleSaveOnExit()
    })

    return unsubscribe
  }, [navigation, inputTitle, inputContent, originalNote, isNewNote])

  return (
    <Animated.View entering={FadeIn} className="flex-1 justify-end items-center bg-black/40">
      <Animated.View entering={SlideInDown} className="w-full h-full bg-white pt-3">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-2 border-b border-gray-300">
            <Pressable onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="black" />
            </Pressable>
            <View className="w-20 flex flex-row items-center">
              <Pressable
                className="mr-4"
                onPress={() => {
                  if (note) {
                    const message = `Title: ${note.title}\n\nContent: ${note.content}`
                    Share.share({ message })
                  }
                }}
              >
                <Ionicons name="share-outline" size={24} color="black" />
              </Pressable>
              <Pressable
                onPress={() => {
                  Alert.alert(
                    "Delete Note",
                    "Are you sure you want to delete this note? This action cannot be undone.",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          const updatedNotes = (storedNotes || []).filter((n) => note && n.id !== note.id)
                          await AsyncStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(updatedNotes))
                          setStoredNotes(updatedNotes)
                          console.log("🗑️ Deleted note:", note)
                          if (navigation.canGoBack()) {
                            router.back()
                          } else {
                            router.replace("/") // or fallback to a main screen
                          }
                        },
                      },
                    ],
                  )
                }}
              >
                <SimpleLineIcons name="trash" size={24} color="black" />
              </Pressable>
            </View>
          </View>

          {/* Text input for note title */}
          <View className="px-4 py-1 bg-gray-100 border-b border-gray-300">
            <MemoizedNoteTitle title={inputTitle} onChangeText={setInputTitle} />
            <Text className="text-sm text-gray-500">
              Last updated: {note?.lastUpdated ? new Date(note.lastUpdated).toLocaleDateString() : "N/A"}
              {isSaving && " (Saving...)"}
            </Text>
          </View>

          {/* Text input for note content */}
          <View className="flex-1 bg-gray-100">
            <MemoizedNoteContent content={inputContent} onChangeText={setInputContent} />
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  )
}
