import {create} from "zustand";


type AuthState = {
  user:any | null;
  profile:{
    username:string;
  } | null;
  setUser:(user:any)=>void;
  setProfile:(profile:any)=>void;
  clear:()=>void;
}

export const useAuthStore = create<AuthState>((set)=>({
  user:null,
  profile:null,
  setUser:(user)=>set({user}),
  setProfile:(profile)=>set({profile}),
  clear:()=>set({user:null,profile:null}),

}));
