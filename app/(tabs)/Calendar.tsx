
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { Calendar as RNCalendar } from "react-native-calendars";
import { supabase } from "@/servers/config/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";

type Plan = {
  id: string;
  title: string;
  description?: string;
  event_date: string;
};

export default function Calendar() {
  const user = useAuthStore((state) => state.user);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* ================= FETCH ================= */

  const fetchPlans = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("event_date", { ascending: true });

    if (data) setPlans(data);
  };

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  /* ================= REALTIME ================= */

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`calendar-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_events",
          filter: `user_id=eq.${user.id}`,
        },
        fetchPlans
      )
      .subscribe();

    return () => {supabase.removeChannel(channel)};
  }, [user]);

  /* ================= SAVE / UPDATE ================= */

  const savePlan = async () => {
    if (!user || !selectedDate || !title.trim()) return;

    if (editingPlan) {
      await supabase
        .from("calendar_events")
        .update({ title, description })
        .eq("id", editingPlan.id);
    } else {
      await supabase.from("calendar_events").insert({
        user_id: user.id,
        title,
        description,
        event_date: selectedDate,
      });
    }

    closeModal();
  };

  const deletePlan = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setTitle("");
    setDescription("");
    setModalVisible(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description ?? "");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPlan(null);
    setTitle("");
    setDescription("");
  };

  /* ================= MEMO ================= */

  const markedDates = useMemo(() => {
    return plans.reduce((acc: any, p) => {
      acc[p.event_date] = {
        marked: true,
        dotColor: "#f97316",
      };
      return acc;
    }, {});
  }, [plans]);

  const dailyPlans = useMemo(() => {
    if (!selectedDate) return [];
    return plans.filter((p) => p.event_date === selectedDate);
  }, [plans, selectedDate]);

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
      {/* ===== CALENDAR ===== */}
      <RNCalendar
        theme={{
          backgroundColor: "#0b0b0b",
          calendarBackground: "#0b0b0b",
          dayTextColor: "#fff",
          monthTextColor: "#fff",
          arrowColor: "#f97316",
          todayTextColor: "#f97316",
        }}
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      {/* ===== DAILY PLANS ===== */}
      <FlatList
        data={dailyPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No plans for this day</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardDesc}>{item.description}</Text>
              ) : null}
            </View>

            <View style={styles.cardActions}>
              <Pressable onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={20} color="#f97316" />
              </Pressable>
              <Pressable onPress={() => deletePlan(item.id)}>
                <Ionicons name="trash" size={20} color="#ef4444" />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* ===== FLOATING ADD BUTTON ===== */}
      <Pressable style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>

      {/* ===== MODAL ===== */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingPlan ? "Edit Plan" : "Add Plan"}
            </Text>

            <TextInput
              placeholder="Title"
              placeholderTextColor="#777"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Description"
              placeholderTextColor="#777"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 90 }]}
              multiline
            />

            <View style={styles.row}>
              <Pressable onPress={closeModal}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={savePlan}>
                <Text style={styles.save}>
                  {editingPlan ? "Update" : "Save"}
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
  cardDesc: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 13,
  },
  cardActions: {
    justifyContent: "space-between",
    marginLeft: 12,
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
