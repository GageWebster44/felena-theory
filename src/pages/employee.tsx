import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { createClient } from '@/utils/supabaseClient';
import HUDFrame from '@/components/HUDFrame';
import '@/styles/crtLaunch.module.css';

const supabase = createClient();

function EmployeePage() {
export default withGuardianGate(Page);
  const [employees, setEmployees] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user && user.user_metadata?.role === 'admin') setIsAdmin(true);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (isAdmin) fetchEmployees();
  }, [isAdmin]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*');
    if (!error) setEmployees(data);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <HUDFrame>
      <div className="crtScreen">
        <h1>Operator Directory</h1>
        {isAdmin ? (
          <>
            <p>Welcome, Architect. You have full access.</p>
            <div className="crtGridResponsive">
              {employees.map((emp) => (
                <div key={emp.id} className="crtBlock">
                  <div className="crtLabel">{emp.name}</div>
                  <p>{emp.sector} – {emp.title}</p>
                  <p>XP Pay: {emp.xp_rate}/week</p>
                  <p>Status: {emp.status}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Access Denied. Company credentials required.</p>
        )}
      </div>
    </HUDFrame>
  );
}