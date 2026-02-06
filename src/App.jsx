import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Calculator, 
  Send, 
  Menu, 
  X, 
  Settings,
  Info,
  Home,
  Key
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat': return <ChatInterface userApiKey={userApiKey} />;
      case 'calculator': return <Calculators />;
      case 'settings': return <SettingsPanel apiKey={userApiKey} setApiKey={setUserApiKey} />;
      default: return <ChatInterface userApiKey={userApiKey} />;
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-slate-900 text-white shadow-xl z-20">
        <div className="p-8 border-b border-slate-700 flex items-center gap-3">
          <div className="bg-green-600 p-3 rounded-lg shadow-inner">
            <Home size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight uppercase">TlapalIA</h1>
            <p className="text-xs text-green-400 font-bold italic tracking-widest uppercase">Los Pinos</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={20} />} label="Asistente Virtual" />
          <NavButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={<Calculator size={20} />} label="Calculadoras" />
        </nav>

        <div className="p-6 border-t border-slate-700">
           <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Ajustes API" />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-900 text-white z-40 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded-lg shadow-inner">
            <Home size={18} className="text-white" />
          </div>
          <span className="font-bold uppercase tracking-tight text-sm">TlapalIA Los Pinos</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-slate-800 rounded transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMenu} />
          <div className="relative w-64 bg-slate-900 text-white shadow-2xl flex flex-col h-full border-r border-white/10">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <span className="font-black text-lg uppercase tracking-widest">Menú</span>
              <button onClick={closeMenu} className="p-1 hover:bg-slate-800 rounded transition-colors">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-5 space-y-4">
              <NavButton active={activeTab === 'chat'} onClick={() => {setActiveTab('chat'); closeMenu();}} icon={<MessageSquare size={20} />} label="Asistente Virtual" />
              <NavButton active={activeTab === 'calculator'} onClick={() => {setActiveTab('calculator'); closeMenu();}} icon={<Calculator size={20} />} label="Calculadoras" />
              <div className="pt-6 mt-6 border-t border-slate-800">
                <NavButton active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); closeMenu();}} icon={<Settings size={20} />} label="Ajustes API" />
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative pt-[60px] lg:pt-0 overflow-hidden bg-slate-50">
        {renderContent()}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 text-left ${
      active 
      ? 'bg-green-600 text-white shadow-lg shadow-green-900/40' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-bold text-sm uppercase tracking-wide">{label}</span>
  </button>
);

const ChatInterface = ({ userApiKey }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: `¡Hola! Bienvenido a Tlapalería Los Pinos. Soy TlapalIA.

CONFIGURACION NECESARIA
Para que pueda responderte, necesitamos configurar tu llave de acceso (API Key) gratuita:

1. Consigue tu clave gratis en: aistudio.google.com
2. Ve al menu de Ajustes aqui en la app.
3. Pega tu clave en el cuadro de texto.

¡Cuando termines, vuelve aqui y platicamos de tu obra!` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = userApiKey || ""; 
      const systemPrompt = "Eres 'TlapalIA', el asistente experto de la 'Tlapalería Los Pinos'. Tu tono es amable y profesional. Responde únicamente en TEXTO PLANO sin Markdown. No uses asteriscos. Usa saltos de línea para separar ideas.";
      const response = await callGeminiAPI(userMsg, systemPrompt, apiKey);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      let errorMessage = 'Hubo un error tecnico. Intenta de nuevo.';
      setMessages(prev => [...prev, { role: 'bot', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Mostrador Digital</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atención en Línea</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Activo</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] lg:max-w-[75%] rounded-2xl p-4 shadow-sm border ${
              msg.role === 'user' 
              ? 'bg-green-600 text-white rounded-tr-none border-green-600' 
              : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-1">
              <span className="text-xs text-slate-400 font-bold animate-pulse">Escribiendo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey){e.preventDefault(); handleSend();}}}
            placeholder="Haz una pregunta técnica..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 pr-12 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all resize-none max-h-32 min-h-[50px] text-sm md:text-base outline-none font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Calculators = () => {
  const [mode, setMode] = useState('concrete');

  return (
    <div className="h-full overflow-y-auto p-5 lg:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight uppercase">Herramientas Pro</h2>
        <p className="text-slate-500 font-medium">Cálculos exactos para evitar desperdicio.</p>
      </div>
      
      <div className="flex gap-3 mb-8">
        <button 
          onClick={() => setMode('concrete')}
          className={`flex-1 px-4 py-4 rounded-2xl font-black text-xs lg:text-sm flex items-center justify-center gap-2 transition-all border ${
            mode === 'concrete' ? 'bg-green-600 text-white shadow-xl shadow-green-900/20 border-green-500' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          CONCRETO
        </button>
        <button 
          onClick={() => setMode('paint')}
          className={`flex-1 px-4 py-4 rounded-2xl font-black text-xs lg:text-sm flex items-center justify-center gap-2 transition-all border ${
            mode === 'paint' ? 'bg-green-600 text-white shadow-xl shadow-green-900/20 border-green-500' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          PINTURA
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 p-6 lg:p-10">
        {mode === 'concrete' ? <ConcreteCalculator /> : <PaintCalculator />}
      </div>
    </div>
  );
};

const ConcreteCalculator = () => {
  const [largo, setLargo] = useState('');
  const [ancho, setAncho] = useState('');
  const [espesor, setEspesor] = useState('');
  const [desperdicio, setDesperdicio] = useState(5);

  const l = parseFloat(largo) || 0;
  const a = parseFloat(ancho) || 0;
  const e = parseFloat(espesor) || 0;
  const d = parseFloat(desperdicio) || 0;

  const volumen = (l * a * (e / 100)).toFixed(2);
  const total = (volumen * (1 + d/100)).toFixed(2);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
        <CalcInput label="Largo (metros)" value={largo} onChange={setLargo} />
        <CalcInput label="Ancho (metros)" value={ancho} onChange={setAncho} />
        <CalcInput label="Espesor (cm)" value={espesor} onChange={setEspesor} />
        <CalcInput label="Desperdicio (%)" value={desperdicio} onChange={setDesperdicio} />
      </div>
      <div className="bg-slate-900 text-white p-8 rounded-[1.5rem] text-center shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
        <p className="text-slate-400 text-[10px] lg:text-xs uppercase font-black tracking-[0.2em] mb-3">Volumen Necesario</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl lg:text-6xl font-black">{total > 0 ? total : '0.00'}</span>
          <span className="text-green-500 text-2xl lg:text-3xl font-black">m³</span>
        </div>
      </div>
    </div>
  );
};

const PaintCalculator = () => {
  const [area, setArea] = useState('');
  const [manos, setManos] = useState(2);
  const [rendimiento, setRendimiento] = useState(10);

  const a = parseFloat(area) || 0;
  const m = parseFloat(manos) || 0;
  const r = parseFloat(rendimiento) || 1;

  const litros = ((a * m) / r).toFixed(1);
  const cubetas = (litros / 19).toFixed(1);

  return (
    <div className="space-y-8">
      <div className="space-y-5 lg:space-y-8">
        <CalcInput label="Area a cubrir (m²)" value={area} onChange={setArea} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manos</label>
            <select value={manos} onChange={e => setManos(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-green-500">
              <option value="1">1 Mano</option>
              <option value="2">2 Manos</option>
            </select>
          </div>
          <CalcInput label="Rendimiento (m²/L)" value={rendimiento} onChange={setRendimiento} />
        </div>
      </div>
      <div className="bg-green-600 text-white p-8 rounded-[1.5rem] flex flex-col sm:flex-row justify-around items-center gap-6 shadow-xl border border-green-500">
        <div className="text-center flex-1">
          <p className="text-[10px] text-green-200 font-black uppercase mb-1">Litros</p>
          <p className="text-4xl font-black">{litros > 0 ? litros : '0.0'}</p>
        </div>
        <div className="hidden sm:block w-px h-12 bg-white/20"></div>
        <div className="text-center flex-1">
          <p className="text-[10px] text-green-200 font-black uppercase mb-1">Cubetas</p>
          <p className="text-4xl font-black">{cubetas > 0 ? cubetas : '0.0'}</p>
        </div>
      </div>
    </div>
  );
};

const CalcInput = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="number" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all outline-none text-sm font-bold placeholder-slate-300" 
      placeholder="0.0" 
    />
  </div>
);

const SettingsPanel = ({ apiKey, setApiKey }) => (
  <div className="h-full overflow-y-auto p-5 flex flex-col items-center justify-center bg-slate-100/50">
    <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border border-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-green-100 p-3 rounded-2xl text-green-600"><Settings size={28} /></div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Seguridad</h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gemini API Key</label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="Pega tu clave aqui..."
              className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none font-mono text-xs font-medium transition-all"
            />
          </div>
          <p className="text-xs text-slate-400 px-1 py-1 italic">Esta clave se guarda localmente en tu dispositivo.</p>
          <p className="text-xs text-red-500 font-bold px-1 uppercase tracking-wider font-sans">⚠️ NO COMPARTIR TU CLAVE API</p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100">
        <p className="text-[9px] text-slate-300 text-center font-black tracking-widest uppercase">TlapalIA Los Pinos v1.13</p>
      </div>
    </div>
  </div>
);

async function callGeminiAPI(userQuery, systemPrompt, customApiKey) {
  const apiKey = customApiKey || ""; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  const maxRetries = 5;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No hay respuesta disponible.";
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

export default App;