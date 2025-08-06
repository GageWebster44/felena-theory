 // context/OperatorContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient' ;

export const OperatorContext = createContext(null);

export const OperatorProvider = ({ children }) => {
  const [operator, setOperator] = useState(null);

  useEffect(() => {
    const fetchOperator = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('operators')
          .select('*')
          .eq('id', user.id)
          .single();
        setOperator(data);
      }
    };

    fetchOperator();
  }, []);

  return (
    <OperatorContext.Provider value={operator}>
      {children}
    </OperatorContext.Provider>
  );
};

export const useOperator = () => useContext(OperatorContext);