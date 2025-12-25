import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/servers/config/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function Notes() {
  const user = useAuthStore((state) => state.user);

  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  /* ================= FETCH NOTES ================= */

  const fetchNotes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setNotes(data);
  };

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  /* ================= REALTIME ================= */

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${user.id}`,
        },
        fetchNotes
      )
      .subscribe();

    return () =>{supabase.removeChannel(channel)} ;
  }, [user]);

  /* ================= SAVE / UPDATE ================= */

  const saveNote = async () => {
    if (!user || !title.trim()) return;

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

  /* ================= MODAL CONTROL ================= */

  const openAddModal = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
  };

  /* ================= UI ================= */

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Please login</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ===== NOTES LIST ===== */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notes yet</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => openEditModal(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.content ? (
                <Text
                  style={styles.cardContent}
                  numberOfLines={3}
                >
                  {item.content}
                </Text>
              ) : null}
            </View>

            <Pressable onPress={() => deleteNote(item.id)}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </Pressable>
          </Pressable>
        )}
      />

      {/* ===== FAB ===== */}
      <Pressable style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>

      {/* ===== MODAL ===== */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingNote ? "Edit Note" : "New Note"}
            </Text>

            <TextInput
              placeholder="Title"
              placeholderTextColor="#777"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Write your thoughts..."
              placeholderTextColor="#777"
              value={content}
              onChangeText={setContent}
              style={[styles.input, { height: 160 }]}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.row}>
              <Pressable onPress={closeModal}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveNote}>
                <Text style={styles.save}>
                  {editingNote ? "Update" : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0b" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardContent: {
    color: "#aaa",
    marginTop: 6,
    fontSize: 13,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#f97316",
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#141414",
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancel: { color: "#aaa", fontSize: 16 },
  save: { color: "#f97316", fontSize: 16, fontWeight: "600" },
});
