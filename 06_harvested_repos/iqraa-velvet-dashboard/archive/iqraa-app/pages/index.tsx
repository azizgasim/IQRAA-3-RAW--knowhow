import React, { useState, KeyboardEvent, FormEvent } from "react";

type AskResponse = {
  answer?: string;
  result?: string;
  steps?: any;
  [key: string]: any;
};

type HealthStatus = "idle" | "ok" | "warning" | "error";
type AnswerMode = "detailed" | "brief" | "bullets";
type DetailLevel = "low" | "medium" | "high";

const HomePage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<
    { query: string; answerPreview: string }[]
  >([]);

  const [health, setHealth] = useState<HealthStatus>("idle");

  // منطقة حالة الصحة (Health Badge)
  const renderHealthBadge = () => {
    if (health === "idle") return null;

    let label = "";
    let className = "iq-health-badge";

    switch (health) {
      case "ok":
        label = "مسار البحث مستقر ✅";
        className += " iq-health-ok";
        break;
      case "warning":
        label = "نتائج تحتاج مراجعة حذرة ⚠️";
        className += " iq-health-warning";
        break;
      case "error":
        label = "تعذّر إتمام البحث ❌";
        className += " iq-health-error";
        break;
    }

    return <div className={className}>{label}</div>;
  };

  // المفكرة
  const [notebookText, setNotebookText] = useState<string>("");
  const [showNotebook, setShowNotebook] = useState<boolean>(false);

  // لوحات الاستكشاف والتنبيه
  const [showExplore, setShowExplore] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [exploreInput, setExploreInput] = useState<string>("");
  const [alertInput, setAlertInput] = useState<string>("");
  const [exploreLog, setExploreLog] = useState<string>("");
  const [alertLog, setAlertLog] = useState<string>("");

  // الإعدادات
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("detailed");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("medium");

  // === منطقة منطق البحث الرئيسي (الاتصال بـ /api/ask) ===
  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      setError("اكتب سؤالاً أو طلباً بحثياً أولاً.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHealth("idle");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          mode: answerMode,
          detailLevel,
        }),
      });

      if (!res.ok) {
        throw new Error(`فشل الاتصال بالخادم (status: ${res.status})`);
      }

      const data: AskResponse = await res.json();
      const text =
        data.answer ??
        data.result ??
        (typeof data === "string" ? data : JSON.stringify(data, null, 2));

      setAnswer(text);
      setHealth("ok");

      setHistory((prev) => [
        { query: trimmed, answerPreview: text.slice(0, 120) },
        ...prev,
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "حدث خطأ غير متوقع أثناء البحث.");
      setHealth("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSearch();
    }
  };

  // زر جلسة جديدة
  const handleNewSession = () => {
    const ok = window.confirm(
      "هل تريد بدء جلسة جديدة لمسار البحث الحالي؟ لن يتم مسح المفكرة أو سجلات الاستكشاف والتنبيه في هذه المرحلة."
    );
    if (!ok) return;

    setQuery("");
    setAnswer("");
    setIsLoading(false);
    setError(null);
    setHealth("idle");
    setHistory([]);

    setShowExplore(false);
    setShowAlert(false);
    setShowNotebook(false);
    setShowSettings(false);
  };

  // تصدير المفكرة
  const handleExportNotebook = () => {
    const text = notebookText.trim();
    if (!text) return;
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "iqraa-session-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // إرسال سطر استكشاف
  const handleExploreSend = () => {
    const t = exploreInput.trim();
    if (!t) return;
    const next = (exploreLog ? exploreLog + "\n" : "") + "• " + t;
    setExploreLog(next);
    setExploreInput("");
  };

  // إرسال سطر تنبيه
  const handleAlertSend = () => {
    const t = alertInput.trim();
    if (!t) return;
    const next = (alertLog ? alertLog + "\n" : "") + "• " + t;
    setAlertLog(next);
    setAlertInput("");
  };

  // === منطقة هيكل JSX العام – رأس لوحة إقرأ والمينيو ===
  return (
    <div className="iq-dashboard">
      {/* رأس لوحة إقرأ – الشريط العلوي */}
      <header className="iq-topbar">
        <div className="iq-topbar-left">
          <div className="iq-logo-mark iq-logo-large">إقرأ</div>
        </div>

        <div className="iq-topbar-right">
          <button
            className="iq-topbar-button"
            type="button"
            onClick={handleNewSession}
          >
            جلسة
          </button>
          <button
            className={
              "iq-topbar-button" +
              (showSettings ? " iq-topbar-button-active" : "")
            }
            type="button"
            onClick={() => setShowSettings((v) => !v)}
          >
            الإعدادات
          </button>
          <button
            className={
              "iq-topbar-button" +
              (showNotebook ? " iq-topbar-button-active" : "")
            }
            type="button"
            onClick={() => setShowNotebook((v) => !v)}
          >
            المفكرة
          </button>
          <button
            className={
              "iq-topbar-button" +
              (showExplore ? " iq-topbar-button-active" : "")
            }
            type="button"
            onClick={() => setShowExplore((v) => !v)}
          >
            استكشاف
          </button>
          <button
            className={
              "iq-topbar-button" +
              (showAlert ? " iq-topbar-button-active" : "")
            }
            type="button"
            onClick={() => setShowAlert((v) => !v)}
          >
            تنبيه
          </button>
        </div>
      </header>

      {/* المينيو الرئيسي كأزرار أفقية مرتبطة بالصفحات */}
      <nav className="iq-mainmenu">
        <div className="iq-mainmenu-tabs">
          <a href="/" className="iq-mainmenu-tab iq-mainmenu-tab-active">
            غرفة القيادة
          </a>
          <a href="/notebook-hub" className="iq-mainmenu-tab">
            المفكرة الكبرى
          </a>
          <a href="/sources" className="iq-mainmenu-tab">
            المصادر والنصوص
          </a>
          <a href="/tools" className="iq-mainmenu-tab">
            الأدوات الذكية
          </a>
          <a href="/sessions" className="iq-mainmenu-tab">
            الجلسات السابقة
          </a>
          <a href="/settings-center" className="iq-mainmenu-tab">
            مركز الإعدادات
          </a>
        </div>
      </nav>

      {/* === بداية منطقة المحتوى الرئيسي – Main === */}
      <main className="iq-main">
        {/* === منطقة لوحة الإعدادات – Settings Panel: بداية === */}
        {showSettings && (
          <section className="iq-settings-panel">
            <div className="iq-settings-row">
              <div className="iq-settings-group">
                <div className="iq-settings-label">نمط الإجابة</div>
                <div className="iq-settings-options">
                  <label
                    className={
                      "iq-settings-option" +
                      (answerMode === "detailed"
                        ? " iq-settings-option-active"
                        : "")
                    }
                  >
                    <input
                      type="radio"
                      value="detailed"
                      checked={answerMode === "detailed"}
                      onChange={() => setAnswerMode("detailed")}
                    />
                    مفصّلة
                  </label>
                  <label
                    className={
                      "iq-settings-option" +
                      (answerMode === "brief"
                        ? " iq-settings-option-active"
                        : "")
                    }
                  >
                    <input
                      type="radio"
                      value="brief"
                      checked={answerMode === "brief"}
                      onChange={() => setAnswerMode("brief")}
                    />
                    مختصرة
                  </label>
                  <label
                    className={
                      "iq-settings-option" +
                      (answerMode === "bullets"
                        ? " iq-settings-option-active"
                        : "")
                    }
                  >
                    <input
                      type="radio"
                      value="bullets"
                      checked={answerMode === "bullets"}
                      onChange={() => setAnswerMode("bullets")}
                    />
                    نقاط
                  </label>
                </div>
              </div>

              <div className="iq-settings-group">
                <div className="iq-settings-label">مستوى التفصيل</div>
                <div className="iq-settings-options">
                  <label
                    className={
                      "iq-settings-option" +
                      (detailLevel === "low"
                        ? " iq-settings-option-active"
                        : "")
                    }
                  >
                    <input
                      type="radio"
                      value="low"
                      checked={detailLevel === "low"}
                      onChange={() => setDetailLevel("low")}
                    />
                    منخفض
                  </label>
                  <label
                    className={
                      "iq-settings-option" +
                      (detailLevel === "medium"
                        ? " iq-settings-option-active"
                        : "")
                    }
                  >
                    <input
                      type="radio"
                      value="medium"
                      checked={detailLevel === "medium"}
                      onChange={() => setDetailLevel("medium")}
                    />
                    متوسط
                  </label>
                  <label
                    className={
                      "iq-settings-option" +
                      (detailLevel === "high"
                        ? " iq-settings-option-active"
                        : "")
                    }
                  >
                    <input
                      type="radio"
                      value="high"
                      checked={detailLevel === "high"}
                      onChange={() => setDetailLevel("high")}
                    />
                    عالٍ
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* === منطقة لوحة الإعدادات – Settings Panel: نهاية === */}
        {/* === منطقة البحث – Search Zone: بداية === */}
        <section className="iq-search-zone">
          <form className="iq-search-box" onSubmit={handleSearch}>
            <div className="iq-search-input-row">
              <input
                type="text"
                className="iq-search-input"
                placeholder="مثلاً: قارن بين معالجة ابن تيمية لمسألة الصفات وبين المدرسة الأشعرية المتأخرة…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="submit"
                className="iq-search-button"
                disabled={isLoading}
              >
                {isLoading ? "يبحث…" : "بحث"}
              </button>
            </div>
            <div className="iq-search-meta-row">{renderHealthBadge()}</div>
          </form>

          {history.length > 0 && (
            <div className="iq-discovery-track">
              <ul className="iq-track-list">
                {history.map((item, idx) => (
                  <li key={idx} className="iq-track-item">
                    <div className="iq-track-query">{item.query}</div>
                    <div className="iq-track-preview">
                      {item.answerPreview}
                      {item.answerPreview.length >= 120 ? "…" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        {/* === منطقة البحث – Search Zone: نهاية === */}

        {/* === منطقة النتائج – Results: بداية === */}
        <section className="iq-results-box iq-results-wide">
          <div className="iq-panel-header">
            <div className="iq-panel-title">النتائج</div>
          </div>
          <div className="iq-results-body">
            {error && <div className="iq-error-box">⚠️ {error}</div>}

            {!error && !answer && !isLoading && null}

            {isLoading && (
              <div className="iq-loading">
                <div className="iq-loading-spinner" />
                <div>يجري الآن تشغيل سلسلة الاستدعاءات وتحميل السياق…</div>
              </div>
            )}

            {!isLoading && !!answer && !error && (
              <div className="iq-answer-content">
                <pre className="iq-answer-pre">{answer}</pre>
              </div>
            )}
          </div>
        </section>
        {/* === منطقة النتائج – Results: نهاية === */}

        {/* === منطقة الاستكشاف والتنبيه – Explore / Alert: بداية === */}
        {(showExplore || showAlert) && (
          <section className="iq-panels-row">
            {showExplore && (
              <section className="iq-middle-panel">
                <div className="iq-panel-header">
                  <div className="iq-panel-title">استكشاف</div>
                </div>
                <div className="iq-panel-body">
                  <div className="iq-panel-chat-row">
                    <input
                      className="iq-panel-chat-input"
                      placeholder="سطر استكشاف…"
                      value={exploreInput}
                      onChange={(e) => setExploreInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleExploreSend();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="iq-panel-chat-send"
                      onClick={handleExploreSend}
                    >
                      أرسل
                    </button>
                  </div>
                  <div className="iq-panel-log">
                    {exploreLog ? (
                      <pre className="iq-panel-log-pre">{exploreLog}</pre>
                    ) : (
                      <div className="iq-panel-log-empty">
                        اكتب سطرًا في شريط الاستكشاف ليتراكم هنا.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {showAlert && (
              <section className="iq-middle-panel">
                <div className="iq-panel-header">
                  <div className="iq-panel-title">تنبيه</div>
                </div>
                <div className="iq-panel-body">
                  <div className="iq-panel-chat-row">
                    <input
                      className="iq-panel-chat-input"
                      placeholder="سطر تنبيه أو ملاحظة نقدية…"
                      value={alertInput}
                      onChange={(e) => setAlertInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAlertSend();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="iq-panel-chat-send"
                      onClick={handleAlertSend}
                    >
                      أرسل
                    </button>
                  </div>
                  <div className="iq-panel-log">
                    {alertLog ? (
                      <pre className="iq-panel-log-pre">{alertLog}</pre>
                    ) : (
                      <div className="iq-panel-log-empty">
                        سجّل هنا التنبيهات والملاحظات التي تريد مراقبتها.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </section>
        )}
        {/* === منطقة الاستكشاف والتنبيه – Explore / Alert: نهاية === */}

        {/* === منطقة المفكرة – Notebook Panel: بداية === */}
        {showNotebook && (
          <section className="iq-notebook-panel">
            <div className="iq-panel-header">
              <div className="iq-panel-title">المفكرة</div>
            </div>
            <div className="iq-notebook-panel-body">
              <textarea
                className="iq-notebook-panel-input"
                placeholder="ملاحظات…"
                value={notebookText}
                onChange={(e) => setNotebookText(e.target.value)}
                rows={6}
              />
              <div className="iq-notebook-panel-footer">
                <div className="iq-notebook-panel-status">
                  {notebookText.trim().length === 0
                    ? "لا توجد ملاحظات بعد."
                    : `عدد الحروف تقريباً: ${notebookText.length}`}
                </div>
                <div className="iq-notebook-panel-actions">
                  <button
                    type="button"
                    className="iq-notebook-action-btn iq-notebook-action-secondary"
                    onClick={() => setNotebookText("")}
                  >
                    مسح
                  </button>
                  <button
                    type="button"
                    className="iq-notebook-action-btn"
                    onClick={handleExportNotebook}
                  >
                    تصدير
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* === منطقة المفكرة – Notebook Panel: نهاية === */}
      </main>
      {/* === نهاية منطقة المحتوى الرئيسي – Main === */}
    </div>
  );
};

export default HomePage;
