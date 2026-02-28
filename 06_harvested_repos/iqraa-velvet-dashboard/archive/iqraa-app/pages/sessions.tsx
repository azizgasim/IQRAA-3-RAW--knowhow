import React from "react";

type SessionRow = {
  id: string;
  date: string;
  title: string;
  queriesCount: number;
  hasNotebook: boolean;
};

const mockSessions: SessionRow[] = [
  {
    id: "S-2025-0001",
    date: "2025-11-25",
    title: "تحليل مناهج دراسة التراث الإسلامي رقميًا",
    queriesCount: 5,
    hasNotebook: true,
  },
  {
    id: "S-2025-0002",
    date: "2025-11-24",
    title: "قيمة الاستقرار السياسي في الخطابات الملكية",
    queriesCount: 3,
    hasNotebook: true,
  },
];

const SessionsPage: React.FC = () => {
  return (
    <div className="iq-dashboard">
      {/* شريط علوي بسيط */}
      <header className="iq-topbar">
        <div className="iq-topbar-left">
          <div className="iq-logo-mark iq-logo-large">إقرأ</div>
        </div>
        <div className="iq-topbar-right">
          <a href="/" className="iq-topbar-button">
            غرفة القيادة
          </a>
        </div>
      </header>

      <main className="iq-main">
        <section className="iq-results-box iq-results-wide">
          <div className="iq-panel-header">
            <div className="iq-panel-title">الجلسات السابقة</div>
            <div className="iq-panel-subtitle">
              هذه صفحة مبدئية لعرض سجل جلسات غرفة القيادة. لاحقًا سيتم ربطها
              بجدول BigQuery.
            </div>
          </div>

          <div className="iq-results-body">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "right", padding: "6px" }}>المعرف</th>
                  <th style={{ textAlign: "right", padding: "6px" }}>التاريخ</th>
                  <th style={{ textAlign: "right", padding: "6px" }}>عنوان الجلسة</th>
                  <th style={{ textAlign: "right", padding: "6px" }}>عدد الاستعلامات</th>
                  <th style={{ textAlign: "right", padding: "6px" }}>مفكرة</th>
                </tr>
              </thead>
              <tbody>
                {mockSessions.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: "6px" }}>{s.id}</td>
                    <td style={{ padding: "6px" }}>{s.date}</td>
                    <td style={{ padding: "6px" }}>{s.title}</td>
                    <td style={{ padding: "6px" }}>{s.queriesCount}</td>
                    <td style={{ padding: "6px" }}>
                      {s.hasNotebook ? "✔" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SessionsPage;
