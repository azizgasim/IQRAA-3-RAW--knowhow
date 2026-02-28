import React from "react";

const NotebookHub: React.FC = () => {
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
            <div className="iq-panel-title">المفكرة الكبرى</div>
            <div className="iq-panel-subtitle">
              مركز واحد لكل ما تكتبه في جلسات إقرأ، الواتساب، وملخصات
              الأدبيات وأدوات الذكاء.
            </div>
          </div>

          <div className="iq-results-body">
            <p>
              هذه صفحة مبدئية للمفكرة الكبرى. لاحقًا ستُقسَّم إلى أربع لوحات:
            </p>
            <ul>
              <li>جلسات إقرأ (خلاصات الجلسات من غرفة القيادة).</li>
              <li>مفكرة الواتساب (الأفكار والروابط القادمة من البوت).</li>
              <li>ملخصات الأدبيات (كتب ومقالات جديدة تهمك).</li>
              <li>ملخصات أدوات الذكاء (أدوات جديدة وتقاريرها).</li>
            </ul>
            <p>
              في هذه المرحلة، الهدف هو تثبيت الصفحة كبوابة رئيسية، وسنربطها
              لاحقًا بجدول BigQuery للمفكرة الكبرى.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NotebookHub;
