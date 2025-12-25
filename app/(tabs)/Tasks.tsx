import { useEffect, useState } from "react";
import { Text, View, TextInput } from "react-native";
import { supabase } from "@/servers/config/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import TaskButton from "@/components/TaskButton";
import TaskCard from "@/components/TaskCard";

export default function Tasks() {
  const user = useAuthStore((s) => s.user);

  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH TASKS ---------------- */
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ---------------- ADD TASK ---------------- */
  const addTask = async () => {
    if (!newTask.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("tasks").insert({
      title: newTask,
      user_id: user.id,
    });

    setLoading(false);
    if (!error) {
      setNewTask("");
      fetchTasks();
    }
  };

  /* ---------------- EDIT TASK ---------------- */
  const editTask = async (taskId: string, updatedTitle: string) => {
    await supabase
      .from("tasks")
      .update({ title: updatedTitle })
      .eq("id", taskId);

    fetchTasks();
  };

  /* ---------------- DELETE TASK ---------------- */
  const deleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
  };

  /* ---------------- MARK COMPLETED ---------------- */
  const markCompleted = async (taskId: string, completed: boolean) => {
    await supabase
      .from("tasks")
      .update({ is_completed: !completed })
      .eq("id", taskId);

    fetchTasks();
  };

  return (
    <View className="flex-1 bg-black px-3 py-3">
      <View className="flex-row items-center">
  <TextInput
    placeholder="Add a new task"
    placeholderTextColor="#FF6D1F"
    value={newTask}
    onChangeText={setNewTask}
    className="flex-1 bg-zinc-900 rounded-xl text-secondary p-5 border border-zinc-800"
  />

  <View className="ml-2">
    <TaskButton tasklogic={addTask} symbol="add" symbolcolor="text-white" />
  </View>
</View>

<View className="mt-5">
  {tasks.map((task) => (
    <View key={task.id} className="mb-3">
      <TaskCard
        task={task}
        editTask={editTask}
        deleteTask={deleteTask}
        markCompleted={markCompleted}
      />
    </View>
  ))}
</View>

    </View>
  );
}
