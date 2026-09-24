import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*');
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    await supabase.from('users').update({ verification_status: 'verified' }).eq('id', userId);
    fetchUsers();
  };

  const handleReject = async (userId) => {
    await supabase.from('users').update({ verification_status: 'unverified' }).eq('id', userId);
    fetchUsers();
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2>لوحة التحكم - إدارة التوثيقات</h2>
      <button onClick={fetchUsers}>تحديث الآن 🔄</button>

      <table border="1" cellPadding="10" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>صورة الهوية</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.full_name || 'غير محدد'}</td>
              <td>
                {u.id_card_url ? (
                  <a href={u.id_card_url} target="_blank" rel="noreferrer">عرض الهوية 📄</a>
                ) : 'لا يوجد'}
              </td>
              <td>{u.verification_status}</td>
              <td>
                {u.verification_status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(u.id)} style={{ backgroundColor: 'green', color: '#fff' }}>موافقة</button>
                    <button onClick={() => handleReject(u.id)} style={{ backgroundColor: 'red', color: '#fff' }}>رفض</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
