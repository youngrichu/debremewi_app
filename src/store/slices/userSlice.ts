import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface UserState {

  isOnboardingComplete: boolean;

  [key: string]: any;

}



const initialState: UserState = {

  isOnboardingComplete: false,

  // other user fields can be added here

};



const userSlice = createSlice({

  name: 'user',

  initialState,

  reducers: {

    setUser: (state, action: PayloadAction<UserState>) => {

      return {

        ...state,

        ...action.payload,

      };

    },

    clearUser: () => initialState,

  },

});



export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer; 
