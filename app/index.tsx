import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
// import NotePreviewCard from "@/components/NotePreviewCard";
import NotePreviewCard from "../components/NotePreviewCard";
import { Note } from "../utils/types/types";
import { useSQLiteContext } from "expo-sqlite";

export default function Index() {
  const navigation = useNavigation();
  const [notes, setNotes] = useState<Note[] | []>([]);
  const [inputHeight, setInputHeight] = useState(200); // Initial height
  const db = useSQLiteContext();
  
  const backupNotes = async () => {
    try {
      const allNotes = await db.getAllAsync<Note>('SELECT * FROM notes');
  
      if (allNotes.length === 0) {
        Alert.alert("No notes available to backup.");
        return;
      }
  
      const backupContent = allNotes
        .map((note) => `Title: ${note.title}\nContent: ${note.content}\n---\n`)
        .join("\n");
  
      const fileUri = FileSystem.documentDirectory + "backup.txt";
      await FileSystem.writeAsStringAsync(fileUri, backupContent);
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error("Backup failed", err);
      Alert.alert("An error occurred while backing up notes.");
    }
  };
  

  const fetchNotes = async () => {
    try {
      const result = await db.getAllAsync<Note>('SELECT * FROM notes');
      const sortedNotes = result.sort((a, b) => {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
      setNotes(sortedNotes);
    } catch (error) {
      console.error("Failed to load notes from SQLite", error);
    }
  };
  

  const onDelete = async (id: string) => {
    try {
      await db.runAsync('DELETE FROM notes WHERE id = ?', id);
      fetchNotes(); // Refresh list
    } catch (error) {
      console.error("Failed to delete note from SQLite", error);
    }
  };
  
  // useEffect remains the same
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchNotes);
    return unsubscribe;
  }, [navigation]);


  return (
    <View className="flex-1 p-4 relative h-screen bg-gray-100">
      <View className="flex-row items-center justify-between mb-4 px-0 pr-2">

        <Pressable
        className="flex flex-row justify-center items-start"
          onLongPress={() => {
            router.push("/info");
          }}
        >
          <Text
            className="text-2xl font-bold text-blue-500 text-center"
          >
            My Notes
          </Text>
          <Text className=" text-xs text-gray-500 text-center">
            V 1.0.5
          </Text>
        </Pressable>
        <TouchableNativeFeedback
          onPress={async () => {
            Alert.alert(
              "Backup Notes",
              "Are you sure you want to create a backup of your notes?",
              [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Backup",
                style: "default",
                onPress: async () => {
                await backupNotes();
                },
              },
              ]
            );
          }}
        >
          <MaterialIcons name="save-alt" size={24} color="black" />
        </TouchableNativeFeedback> 
      </View>
      <View className="gap-y-2">
        <FlatList
          className="gap-y-2"
          data={notes}
          // keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-2" />} // ← spacing!
          renderItem={({ item }: { item: Note }) => (
            <NotePreviewCard note={item} onDelete={onDelete} />
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500">
              No notes available
            </Text>
          }
        />
        {/* <View style={{ alignItems: "center", justifyContent: "center" }}></View> */}
        <View className="h-20" />
      </View>
      <View className="absolute bottom-10 right-10">
        <Link
          href="/modal"
          className="p-3 flex items-center justify-center rounded-full color-blue-500 hover:color-blue-700"
        >
          <SimpleLineIcons name="note" size={40} />
        </Link>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    color: '#333',
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});