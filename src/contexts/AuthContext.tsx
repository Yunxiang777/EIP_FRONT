import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import axios from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@company.com',
    name: 'John Doe',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Developer',
    joinDate: '2022-01-15',
    phone: '+1 234-567-8901'
  },
  {
    id: '2',
    email: 'manager@company.com',
    name: 'Sarah Johnson',
    role: 'manager',
    department: 'Engineering',
    position: 'Engineering Manager',
    joinDate: '2020-03-10',
    phone: '+1 234-567-8902'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // const login = async (email: string, password: string): Promise<boolean> => {
  //   // Mock authentication - in real app, this would call an API
  //   const foundUser = mockUsers.find(u => u.email === email);
  //   if (foundUser && password === 'password') {
  //     setUser(foundUser);
  //     return true;
  //   }
  //   return false;
  // };
  const login = async (userId: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post('http://localhost:5244/api/Auth/login', {
        userId,
        password,
      });
      console.log(res.data);

      // setUser(res.data.user); // 根據實際API回傳格式調整
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};