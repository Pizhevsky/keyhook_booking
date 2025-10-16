import React, { useState, ReactNode } from "react";
import { UserContext } from "./UserContext";
import { User } from "../types";

interface UserProviderProps {
  children: ReactNode;
}

const defaultUser: User = {
  id: 0, 
  role: 'tenant', 
  name: ''
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};