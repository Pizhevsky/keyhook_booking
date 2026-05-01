import { createContext, useState, useContext, type ReactNode } from "react";
import type { User } from "../types";

interface UserContextType {
  user: User | null
  setUser: (user: User) => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

const defaultUser: User = { id: 0, role: 'tenant', name: ''};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): UserContextType {
  return useContext(UserContext);
}