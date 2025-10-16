import React, { createContext } from "react";
import { User } from "../types";

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

export const UserContext = createContext<UserContextType>({
  user: {} as User,
  setUser: () => {},
});