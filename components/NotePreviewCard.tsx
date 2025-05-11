
import { Text, View } from "react-native";
import React from "react";
import { Note } from "../utils/types/types";
import { router } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { TouchableOpacity } from "react-native";

type NotePreviewCardProps = {
  note: Note;
  onDelete: (id: string) => void;
};

const NotePreviewCard: React.FC<NotePreviewCardProps> = ({ note, onDelete }) => {

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={() => onDelete(note.id)}
      activeOpacity={0.7}
      className="bg-red-500 h-[88%] justify-center items-center w-[80px] rounded-xl mt-2"
    >
      <Text className="text-white font-bold">Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View className="my-2">
        <TouchableOpacity onPress={() => router.push(`/${note.id}`)}>
          <View
            className={`p-4 rounded-lg bg-white shadow-md border border-gray-300`}
          >
            <Text
              className={`text-lg font-bold truncate line-clamp-1 bg-white`}
            >
              {note.title}
            </Text>
            <Text
              className={`bg-white truncate line-clamp-2 mt-2`}
              numberOfLines={3}
            >
              {note.content}
            </Text>
            <Text className={`text-sm bg-white mt-2`}>
              Last updated: {new Date(note.lastUpdated).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

export default NotePreviewCard;
