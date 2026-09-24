import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('unverified');
  const [loading, setLoading] = useState(false);

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!file || !fullName) return alert('الرجاء إدخال الاسم ورفع صورة الهوية');

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('id-cards')
      .upload(fileName, file);

    if (storageError) {
      alert('حدث خطأ أثناء رفع الصورة');
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('id-cards').getPublicUrl(fileName);

    const { user } = (await supabase.auth.getUser()).data;
    const { error: dbError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        id_card_url: urlData.publicUrl,
        verification_status: 'pending'
      })
      .eq('id', user.id);

    setLoading(false);
    if (!dbError) setStatus('pending');
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2>حساب المستخدم</h2>

      {status === 'unverified' && (
        <form onSubmit={handleKycSubmit} style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h3>توثيق الهوية (إجباري للشحن)</h3>
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <br /><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <br /><br />
          <button type="submit" disabled={loading}>
            {loading ? 'جاري الرفع...' : 'إرسال التوثيق'}
          </button>
        </form>
      )}

      {status === 'pending' && (
        <p style={{ color: 'orange' }}>⏳ طلب التوثيق قيد المراجعة من قِبل الأدمن. سيتم فتح الشحن فور الموافقة.</p>
      )}

      {status === 'verified' && (
        <div style={{ border: '1px solid green', padding: '15px' }}>
          <h3>✅ الحساب موثق - قسم الإيداع والاستثمار متاح الآن</h3>
        </div>
      )}
    </div>
  );
}
