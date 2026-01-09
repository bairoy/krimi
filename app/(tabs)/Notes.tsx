import {
  View,
  Text,
  Keyboard,
  FlatList,
  Pressable,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useState, useEffect,useCallback } from "react";
import { supabase } from "@/servers/config/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function Notes() {
  const user = useAuthStore((state) => state.user);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [modalVisibility, setModalVisibility] = useState(false);
  

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    const {data:myaccesstoken}= await supabase.auth.getSession();
    if (myaccesstoken){
      console.log(myaccesstoken.session?.access_token);
    }
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id);
    if (data) setNotes(data);
  },[user]);
  useEffect(() => {
    if (!user) return;
    fetchNotes();
  }, [user,fetchNotes]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:"notes",
          filter:`user_id=eq.${user.id}`
        },
        fetchNotes
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user,fetchNotes]);

  const saveNote = async () => {
    if (!user || !title) return;
    if (editingNote) {
      await supabase
        .from("notes")
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingNote.id);
    } else {
      await supabase.from("notes").insert({
        user_id: user.id,
        title,
        content,
      });
    }
    closeModal();
  };
  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
  };
  const openAddModal = () => {
    setModalVisibility(true);
    setContent("");
    setTitle("");
    setEditingNote(null);
  };
  const closeModal = () => {
    setModalVisibility(false);
    Keyboard.dismiss();
    setContent("");
    setTitle("");
    setEditingNote(null);
  };
  const openeditModal = (note: Note) => {
    setModalVisibility(true);
    setContent(note.content);
    setTitle(note.title);
    setEditingNote(note);
  };

  if (!user) {
    return <View>please login to view your notes</View>;
  }
  return (
    <View className="flex-1 bg-black relative ">
      {!modalVisibility &&<FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="pl-3  py-2  mt-3 flex-row gap-y-1 border-b-4 items-center justify-between bg-zinc-900 rounded-3xl">
            <Pressable onPress={() => openeditModal(item)} className="w-80">
              <Text className="text-orange-500 text-xl font-semibold">
                {item.title}
              </Text>
              <Text className="text-white text-xl">{item.content}</Text>
            </Pressable>
            <TouchableOpacity
              onPress={() => deleteNote(item.id)}
            className="right-2">
              <MaterialIcons name="delete-outline" size={30} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />}
      {!modalVisibility && (
        <View className="relative bottom-2 z-1">
          <TouchableOpacity
            className="absolute right-0 bottom-0"
            onPress={openAddModal}
          >
            <MaterialIcons name="library-add" size={50} color="#FF6D1F" />
          </TouchableOpacity>
        </View>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisibility}
        onRequestClose={() => setModalVisibility(!modalVisibility)}
      >
        <View className="m-auto bg-zinc-800 w-full border-white rounded-3xl">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="title"
            placeholderTextColor="white"
            className="bg-zinc-900 border-zinc-400 h-20 m-2 rounded-2xl px-3 text-white text-lg"
          />
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="content"
            placeholderTextColor="white"
            multiline
            className="bg-zinc-900 h-40 rounded-2xl m-2 px-3 text-white text-lg"
          />
          <View className="flex-row justify-around p-3">
            <TouchableOpacity
              onPress={() => closeModal()}
              className="bg-yellow-300 h-10 w-20 rounded-md items-center justify-center"
            >
              <Text className="text-white">cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => saveNote()}
              className="bg-green-600 h-10 w-20 rounded-md items-center justify-center "
            >
              <Text className="text-white">
                {editingNote ? "update" : "save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
