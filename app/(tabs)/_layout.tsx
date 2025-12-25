import Header from "@/components/Header";
import {Tabs} from "expo-router";
import {ImageBackground,Image,Text,View} from "react-native";



export default function TabsLayout(){
  return(
    <View style={{flex:1,backgroundColor:"black"}}>
     <Header/>
    <Tabs>
      <Tabs.Screen 
      name="index"
      options={{
        title:"dashboard",
        headerShown:false,
        
      }} />
      <Tabs.Screen 
      name="Tasks"
      options={{
        title:"tasks",
        headerShown:false,
        
      }}/>
      <Tabs.Screen 
      name="Notes"
      options={{
        title:"notes",
        headerShown:false,
        
      }}/>
      <Tabs.Screen 
      name="Calendar"
      options={{
        title:"calendar",
        headerShown:false,
        
      }}/>
      <Tabs.Screen 
      name="AIassistant"
      options={{
        title:"assistant",
        headerShown:false,
        
      }}/>
    </Tabs>
    </View>
  )
}