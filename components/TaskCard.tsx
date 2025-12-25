import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { icons } from "@/constants/icons";

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    is_completed: boolean;
  };
  editTask: (taskId: string, newTitle: string) => void;
  deleteTask: (taskId: string) => void;
  markCompleted: (taskId: string, completed: boolean) => void;
};

export default function TaskCard({
  task,
  editTask,
  deleteTask,
  markCompleted,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  /* ---------------- SAVE EDIT ---------------- */
  const saveEdit = () => {
    if (!editedTitle.trim()) return;
    editTask(task.id, editedTitle);
    setIsEditing(false);
  };

  return (
    <View className="bg-zinc-900 rounded-xl p-4 flex-row items-center justify-between border border-zinc-800">
      {/* LEFT SIDE */}
      <View className="flex-row items-center gap-3 flex-1">
        {/* COMPLETE TOGGLE */}
        <TouchableOpacity
          onPress={() => markCompleted(task.id, task.is_completed)}
          className={`w-5 h-5 rounded-full border ${
            task.is_completed
              ? "bg-green-500 border-green-500"
              : "border-zinc-500"
          }`}
        />

        {/* TITLE / EDIT INPUT */}
        {isEditing ? (
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            autoFocus
            onSubmitEditing={saveEdit}
            className="text-white flex-1 border-b border-zinc-600"
          />
        ) : (
          <Text
            className={`text-white flex-1 ${
              task.is_completed ? "line-through opacity-50" : ""
            }`}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        )}
      </View>

      {/* RIGHT SIDE ACTIONS */}
      <View className="flex-row items-center flex-1">
        {/* EDIT */}
        <TouchableOpacity
          onPress={() =>
            isEditing ? saveEdit() : setIsEditing(true)
          }
          className="mr-3"
        >
          <Text className="text-secondary">
            {isEditing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>

        {/* DELETE */}
        <TouchableOpacity onPress={() => deleteTask(task.id)}>
          <Text className="text-red-500">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
