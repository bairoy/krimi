import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/servers/config/supabase";
import {
  Calendar as Kalendar,
  CalendarList,
  Agenda,
} from "react-native-calendars";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Plan = {
  id: string;
  title: string;
  description?: string;
  event_date: string;
};

export default function Calendar() {
  const user = useAuthStore((state) => state.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toLocaleDateString("en-CA"));
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .eq("event_date",selectedDate)
    if (error) console.log("error fetching calendar events");
    if (data) setPlans(data);
  }, [user,selectedDate]);
  useEffect(() => {
    if (!user) return;
    fetchPlans();
  }, [user, fetchPlans]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`calendar_events-${user.id}`)
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
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPlans]);

  const savePlan = async () => {
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title,
      description,
      event_date:selectedDate,
    });
    if (error) console.log("error in saving note");

    closeModal();
  };
  const deletePlan = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
  };

  const openAddModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setDescription("");
    setTitle("");
    
  };

  

  if (!user)
    return (
      <View className="flex-1 bg-black">
        <Text className="text-orange-600 text-wrap text-lg">
          Please Login to view the calendar event
        </Text>
      </View>
    );
  return (
    <View className="flex-1 bg-black">
      <Kalendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        theme={{
          backgroundColor: "black",
          calendarBackground: "black",
          textSectionTitleColor: "green",
          todayTextColor: "#FF4D00",
          dayTextColor: "white",
          monthTextColor: "white",
          arrowColor: "white",
          selectedDayTextColor: "white",
        }}
        markedDates={{
          [selectedDate ?? ""]: { selected: true, selectedColor: "blue" },
        }}
      />

      {selectedDate && (
       <View>
        <View className="border-white flex-row justify-between p-6">
          <Text className="text-blue-600">add plan for {selectedDate} </Text>
          <TouchableOpacity onPress={openAddModal}>
            <MaterialIcons name="add-card" size={24} color="blue" />
            
          </TouchableOpacity>
          </View>
          {
            <FlatList data={plans}
            keyExtractor={(item)=>item.id}
            ListEmptyComponent = {
              <Text className="text-center text-zinc-500">No plans for this day</Text>
            }
            renderItem={({item})=>(
              <View className="px-5 py-2 border-e-tertiary bg-zinc-800 rounded-lg flex-row justify-between mt-2">
                <View className="py-2 ">
                  <Text className="text-orange-600 font-semibold">{item.title}</Text>
                  <Text className="text-white ">{item.description}</Text>
                </View>
                <View className="justify-center">
                <TouchableOpacity onPress={()=>deletePlan(item.id)} className="">
                 <MaterialCommunityIcons name="delete-outline" size={24} color="red" />
                </TouchableOpacity></View>

              </View>
            )}
            />
          }
        </View>
     
      )}

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View className="items-center justify-start bg-black/50 pt-[150] ">
          <View className="bg-zinc-800 h-72 w-full p-5 rounded-2xl mt-80">
            <TextInput
              className="bg-zinc-900 text-orange-400 px-4 py-3 rounded-lg mb-4 border border-zinc-700"
              numberOfLines={1}
              maxLength={50}
              onChangeText={(text) => setTitle(text)}
              placeholder="event name"
              placeholderTextColor="#71717a"
              textAlign="left"
              autoCapitalize="characters"
              value={title}
            />
            <TextInput
              className="bg-zinc-900 text-orange-400 px-4 py-3 rounded-lg mb-6 border-zinc-700 h-24"
              onChangeText={(text) => setDescription(text)}
              placeholder="description"
              editable
              multiline
              textAlign="left"
              value={description}
              placeholderTextColor="#71717a"
            />
            <View className=" flex-row justify-between">
              <TouchableOpacity
                onPress={closeModal}
                className="bg-zinc-600 px-6 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={savePlan}
                className="bg-zinc-600 py-2 px-6 rounded-lg"
              >
                <Text className="text-white font-semibold">save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
