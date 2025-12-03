import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { enhanceUserWithSellerStatus, clearSellerStatus } from "@/app/utils/sellerStatusUtils";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN'; // Only USER or ADMIN
  isSeller: boolean;
  sellerStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  avatar: string | null;
}

export type ActiveRole = "USER" | "ADMIN"; // Simplified - no more role switching

interface AuthState {
  user: User | undefined | null;
  activeRole: ActiveRole;
}

// Load activeRole from localStorage on initialization
const getInitialRole = (): ActiveRole => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("activeRole");
    if (saved && ["USER", "ADMIN"].includes(saved)) {
      return saved as ActiveRole;
    }
  }
  return "USER";
};

const initialState: AuthState = {
  user: undefined,
  activeRole: getInitialRole(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User }>) => {
      let user = action.payload.user;
      
      // Validate that required fields are present
      if (!user || typeof user.id !== 'string') {
        console.error("Invalid user data received - missing id:", user);
        return;
      }
      
      // Email is optional in some responses (like social login), but log if missing
      if (!user.email) {
        console.warn("User data missing email field:", user);
      }
      
      // Enhance user data with persisted seller status if missing
      const enhancedUser = enhanceUserWithSellerStatus(user);
      if (enhancedUser) {
        user = enhancedUser;
      }
      
      // Ensure isSeller is a boolean (default to false if undefined)
      if (typeof user.isSeller !== 'boolean') {
        console.warn("User data missing isSeller field, defaulting to false:", user);
        user.isSeller = false;
      }
      
      state.user = user;

      // Auto-set activeRole based on user's roles
      if (user) {
        const availableRoles: ActiveRole[] = ["USER"]; // Everyone is a USER
        
        if (user.role === "ADMIN") {
          availableRoles.push("ADMIN");
        }
        
        // If current activeRole is not available, switch to first available
        if (!availableRoles.includes(state.activeRole)) {
          state.activeRole = availableRoles[0];
          if (typeof window !== "undefined") {
            localStorage.setItem("activeRole", state.activeRole);
          }
        }
      }
    },
    logout: (state) => {
      state.user = undefined;
      state.activeRole = "USER";
      if (typeof window !== "undefined") {
        localStorage.removeItem("activeRole");
        clearSellerStatus();
      }
    },
    switchRole: (state, action: PayloadAction<ActiveRole>) => {
      state.activeRole = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("activeRole", action.payload);
      }
    },
  },
});

export const { setUser, logout, switchRole } = authSlice.actions;
export default authSlice.reducer;
