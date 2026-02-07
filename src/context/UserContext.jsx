import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('pizzaria_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('pizzaria_user');
      }
    }
    setLoading(false);
  }, []);

  // Login: buscar usuário por telefone ou criar novo
  const login = async (name, phone) => {
    try {
      // Formatar telefone (remover espaços, parênteses, hífens)
      const cleanPhone = phone.replace(/\D/g, '');

      // Buscar usuário existente
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .single();

      let userData;

      if (existingUser) {
        // Atualizar last_login
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) throw updateError;
        userData = updatedUser;
      } else {
        // Criar novo usuário
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{ 
            name: name.trim(), 
            phone: cleanPhone,
            last_login: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        userData = newUser;
      }

      // Salvar no state e localStorage
      setUser(userData);
      localStorage.setItem('pizzaria_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('pizzaria_user');
  };

  // Atualizar dados do usuário
  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('pizzaria_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isLoggedIn: !!user
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
}
