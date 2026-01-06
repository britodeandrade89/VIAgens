
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Plane, Bus, Trash2, MapPin, Calendar, Clock, LayoutDashboard, Compass, Wallet, 
  ExternalLink, Star, ShieldCheck, Coffee, Check, ArrowRight, User, Award, TrendingUp, Info, ShieldAlert, Heart, Zap,
  Building2, Timer, Sparkles, MessageCircle, X, Send, Bot, Menu
} from 'lucide-react';
import { 
  TAAG_TICKET_INFO, INTERNATIONAL_FLIGHTS, SAA_FLIGHT_DEAL, SURVIVAL_TIPS, ACCOMMODATIONS, BUS_LOGISTICS, LOGISTICS_TIMELINE, REGIONS 
} from './constants.ts';
import { BudgetEntry, ChatMessage } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bus' | 'logistics' | 'stays' | 'tips' | 'budget'>('dashboard');
  const [budget, setBudget] = useState<BudgetEntry[]>([]);
  const [idaScenario, setIdaScenario] = useState<'via_leme' | 'direto_sp'>('direto_sp');
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // AI State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou a IA do VIAgens. Conheço todo o seu roteiro para África do Sul. Pergunte sobre voos, horários, budget ou dicas!' }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sa-travel-v15');
    if (saved) setBudget(JSON.parse(saved));
    else setBudget([{ id: '1', category: 'VOO', description: 'Internacional GRU-JNB (Casal)', date: '25/01', total: 8600, notes: 'Confirmado - BJDTCL' }]);
  }, []);

  useEffect(() => {
    localStorage.setItem('sa-travel-v15', JSON.stringify(budget));
  }, [budget]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  const addEntry = (entry: Omit<BudgetEntry, 'id'>) => {
    setBudget(prev => [...prev, { ...entry, id: Math.random().toString(36).substr(2, 9) }]);
    alert("✅ Adicionado ao Financeiro!");
  };

  const removeEntry = (id: string) => {
    setBudget(prev => prev.filter(e => e.id !== id));
  };

  const calculateTotalBudget = () => budget.reduce((acc, curr) => acc + curr.total, 0);

  // Função para navegar e fechar o menu mobile
  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  // Lógica da IA
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Contexto rico para a IA sobre a viagem
      const tripContext = JSON.stringify({
        voosInternacionais: INTERNATIONAL_FLIGHTS,
        passageiros: TAAG_TICKET_INFO,
        hoteis: ACCOMMODATIONS,
        onibusBrasil: BUS_LOGISTICS,
        cronogramaConexao: LOGISTICS_TIMELINE,
        budgetAtual: budget,
        totalGasto: calculateTotalBudget(),
        dicas: SURVIVAL_TIPS
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-latest',
        contents: userMsg,
        config: {
          systemInstruction: `Você é o assistente inteligente do app "VIAgens". Você é um especialista em viagens para a África do Sul.
          
          DADOS DA VIAGEM DO USUÁRIO:
          ${tripContext}
          
          REGRAS:
          1. Responda de forma concisa, amigável e direta.
          2. Use os dados fornecidos para responder perguntas sobre horários, valores, hotéis e voos.
          3. Se o usuário perguntar sobre o gasto total, calcule com base no 'budgetAtual' fornecido.
          4. Se perguntarem sobre segurança, reforce as dicas de usar Uber e não andar com celular.
          5. Seu tom deve ser de um "Concierge de Luxo com IA".
          `,
        },
      });

      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "Desculpe, não consegui processar isso agora." }]);
    } catch (error) {
      console.error("Erro na IA", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Estou tendo problemas para conectar com minha rede neural. Tente novamente em instantes." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Ranking: Melhor Custo (Menor Preço/Nota)
  const getGroupedStays = () => {
    const groups: Record<string, any[]> = {};
    ACCOMMODATIONS.filter(s => s.rating >= 8).forEach(stay => {
      if (!groups[stay.regionId]) groups[stay.regionId] = [];
      groups[stay.regionId].push(stay);
    });
    Object.keys(groups).forEach(regId => {
      groups[regId].sort((a, b) => (a.pricePerNight / a.rating) - (b.pricePerNight / b.rating));
    });
    return groups;
  };

  const groupedStays = getGroupedStays();

  const calculateBusTotal = () => {
    const ida = (idaScenario === 'via_leme' ? BUS_LOGISTICS.via_leme.ida : BUS_LOGISTICS.direto_sp.ida).reduce((acc, b) => acc + b.price, 0);
    const volta = BUS_LOGISTICS.retorno.reduce((acc, b) => acc + b.price, 0);
    return (ida + volta) * 2;
  };

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64 text-slate-900 font-inter transition-all duration-300">
      
      {/* Overlay Mobile (Fundo escuro quando menu está aberto) */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Navegação Lateral (Drawer) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 md:w-64 bg-white border-r border-slate-200
        transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl md:shadow-none
        flex flex-col p-4 gap-2 overflow-y-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="mb-6 px-2 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tighter italic">
              V<span className="text-purple-600">IA</span>gens
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Planejamento Inteligente</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 space-y-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<LayoutDashboard size={20} />} label="Voos" />
          <NavItem active={activeTab === 'bus'} onClick={() => handleNavClick('bus')} icon={<Bus size={20} />} label="Ônibus" />
          <NavItem active={activeTab === 'logistics'} onClick={() => handleNavClick('logistics')} icon={<Clock size={20} />} label="Conexões" />
          <NavItem active={activeTab === 'stays'} onClick={() => handleNavClick('stays')} icon={<Building2 size={20} />} label="Hospedagem" />
          <NavItem active={activeTab === 'tips'} onClick={() => handleNavClick('tips')} icon={<Compass size={20} />} label="Guias e Roteiros" />
          <NavItem active={activeTab === 'budget'} onClick={() => handleNavClick('budget')} icon={<Wallet size={20} />} label="Financeiro" />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 md:hidden">
            <p className="text-xs text-center text-slate-400 font-medium">Toque fora para fechar</p>
        </div>
      </aside>

      <main className="p-4 md:p-12 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header Mobile com Botão Menu */}
        <header className="md:hidden flex justify-between items-center mb-6 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-slate-200/60 shadow-sm transition-all">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="p-2 -ml-2 text-slate-700 hover:bg-white/80 rounded-xl transition-all active:scale-95"
             aria-label="Abrir menu"
           >
             <Menu size={28} />
           </button>
           <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">V<span className="text-purple-600">IA</span>gens</h1>
           <div className="w-8" /> {/* Espaçador para balancear layout */}
        </header>

        {/* --- DASHBOARD: VOOS INTERNACIONAIS --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">GRU ➔ JNB</h2>
                <p className="text-slate-500 font-bold italic text-lg">Resumo Oficial da Reserva Decolar</p>
              </div>
              <div className="bg-red-600 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-60">Localizador</p>
                    <p className="text-2xl font-black tracking-widest">{TAAG_TICKET_INFO.checkInCode}</p>
                 </div>
                 <Zap className="text-yellow-400 fill-current" size={32} />
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FlightCard title="Ida: 25 Jan" flight={INTERNATIONAL_FLIGHTS.ida} color="indigo" />
              <FlightCard title="Volta: 06 Fev" flight={INTERNATIONAL_FLIGHTS.volta} color="teal" />
            </div>

            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-200 shadow-sm">
               <h3 className="text-lg font-black italic mb-6 flex items-center gap-2"><User size={20}/> Passageiros</h3>
               <div className="flex flex-wrap gap-4">
                  {TAAG_TICKET_INFO.passengers.map((p, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex-1 min-w-[280px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-Ticket: {p.eTicket}</p>
                       <p className="font-black text-xl italic mt-1">{p.name}</p>
                       <p className="text-xs font-bold text-indigo-600">ID Doc: {p.idDoc}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* --- BRASIL: LOGÍSTICA TERRESTRE --- */}
        {activeTab === 'bus' && (
          <div className="space-y-10">
             <header className="flex flex-col md:flex-row justify-between gap-6 items-end">
               <div>
                 <h2 className="text-4xl font-black italic tracking-tighter">Brasil Terrestre</h2>
                 <p className="text-slate-500 font-bold italic">RJ ➔ GRU (Cálculo para 2 pessoas)</p>
               </div>
               <div className="bg-slate-200 p-1 rounded-2xl flex gap-1 border-2 border-slate-300 w-full md:w-auto">
                  <button onClick={() => setIdaScenario('direto_sp')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black transition-all ${idaScenario === 'direto_sp' ? 'bg-indigo-600 text-white shadow-lg italic' : 'text-slate-500'}`}>Direto SP</button>
                  <button onClick={() => setIdaScenario('via_leme')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black transition-all ${idaScenario === 'via_leme' ? 'bg-indigo-600 text-white shadow-lg italic' : 'text-slate-500'}`}>Via Leme</button>
               </div>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h3 className="text-lg font-black italic text-indigo-600">Ida ({idaScenario === 'via_leme' ? 'Leme' : 'Direto'})</h3>
                   {(idaScenario === 'via_leme' ? BUS_LOGISTICS.via_leme.ida : BUS_LOGISTICS.direto_sp.ida).map((b) => (
                      <div key={b.id} className="bg-white p-6 rounded-3xl border-2 border-slate-200 flex justify-between items-center group hover:border-indigo-400 transition-all cursor-pointer">
                         <div><p className="font-black italic uppercase leading-none">{b.from} ➔ {b.to}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{b.date} • {b.time}</p></div>
                         <p className="font-black italic text-indigo-600">R$ {b.price}</p>
                      </div>
                   ))}
                </div>
                <div className="space-y-4">
                   <h3 className="text-lg font-black italic text-teal-600">Volta (06/02)</h3>
                   {BUS_LOGISTICS.retorno.map((b) => (
                      <div key={b.id} className="bg-white p-6 rounded-3xl border-2 border-slate-200 flex justify-between items-center hover:border-teal-400 transition-all cursor-pointer">
                         <div><p className="font-black italic uppercase leading-none">{b.from} ➔ {b.to}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{b.date} • {b.time}</p></div>
                         <p className="font-black italic text-teal-600">R$ {b.price}</p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:scale-[1.01] transition-all cursor-pointer">
                <div>
                   <h3 className="text-3xl font-black italic">Total Logística Brasil</h3>
                   <p className="text-indigo-400 font-bold italic mt-1">Soma de todos os trechos x2 (Casal)</p>
                </div>
                <div className="text-center md:text-right">
                   <p className="text-5xl font-black italic tracking-tighter leading-none">R$ {calculateBusTotal()}</p>
                   <button onClick={() => addEntry({ category: 'TRANSPORTE', description: `Brasil Terrestre (${idaScenario}) Casal`, date: '06/02', total: calculateBusTotal(), notes: 'RJ-SP-GRU' })} className="mt-4 px-10 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl">Adicionar ao Financeiro</button>
                </div>
             </div>
          </div>
        )}

        {/* --- CONEXÃO JNB: LOGÍSTICA ÁFRICA --- */}
        {activeTab === 'logistics' && (
          <div className="space-y-12">
            <header>
               <h2 className="text-4xl font-black italic tracking-tighter">Conexão JNB</h2>
               <p className="text-slate-500 font-bold italic">O momento crítico: Transferência no O.R. Tambo</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1">
                  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-sm h-full">
                     <h3 className="text-lg font-black italic mb-8 flex items-center gap-2 text-indigo-600"><Timer size={22}/> Timeline Crítica</h3>
                     <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-indigo-100">
                        {LOGISTICS_TIMELINE.map((step, i) => (
                           <div key={i} className={`pl-10 relative ${step.highlight ? 'text-indigo-600' : 'text-slate-600'}`}>
                              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${step.highlight ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
                              <p className="text-[10px] font-black uppercase leading-none mb-1">{step.time}</p>
                              <p className={`font-black italic text-sm ${step.warning ? 'text-red-500' : ''}`}>{step.task}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-2">
                  <div className="bg-indigo-950 text-white rounded-[3rem] p-12 h-full flex flex-col justify-center relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer shadow-2xl">
                     <div className="relative z-10 space-y-10">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center"><Plane size={32} /></div>
                           <div>
                              <p className="text-[11px] font-black uppercase text-indigo-400 tracking-widest">Trecho Doméstico Reservado</p>
                              <h3 className="text-4xl font-black italic">{SAA_FLIGHT_DEAL.company}</h3>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                              <p className="text-[10px] font-black uppercase opacity-40 mb-1">Ida: JNB ➔ CPT</p>
                              <p className="text-2xl font-black italic leading-none">{SAA_FLIGHT_DEAL.outbound.date} • {SAA_FLIGHT_DEAL.outbound.time}</p>
                           </div>
                           <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                              <p className="text-[10px] font-black uppercase opacity-40 mb-1">Volta: CPT ➔ JNB</p>
                              <p className="text-2xl font-black italic leading-none">{SAA_FLIGHT_DEAL.return.date} • {SAA_FLIGHT_DEAL.return.time}</p>
                           </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/10 pt-10 gap-6">
                           <div>
                              <p className="text-[11px] font-black uppercase text-indigo-300">Total Casal (Roundtrip)</p>
                              <p className="text-5xl font-black italic tracking-tighter">R$ {(SAA_FLIGHT_DEAL.roundTripPrice * 2).toLocaleString('pt-BR')}</p>
                           </div>
                           <button onClick={() => addEntry({ category: 'VOO', description: 'JNB-CPT SAA (Casal)', date: '26/01', total: SAA_FLIGHT_DEAL.roundTripPrice * 2, notes: 'Confirmado' })} className="w-full md:w-auto px-12 py-5 bg-white text-indigo-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Selecionar</button>
                        </div>
                     </div>
                     <Plane className="absolute -right-20 -bottom-20 text-white/5 group-hover:text-white/10 transition-all" size={500} />
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- HOSPEDAGEM: RANKING POR ZONAS --- */}
        {activeTab === 'stays' && (
          <div className="space-y-20">
            <header>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Hospedagens Estratégicas</h2>
              <p className="text-slate-500 font-bold italic text-lg mt-2">Ordenado pelo melhor Custo-Benefício real por zona.</p>
            </header>

            {Object.entries(REGIONS).map(([regId, region]) => {
              const stays = groupedStays[regId];
              if (!stays || stays.length === 0) return null;

              return (
                <section key={regId} className="space-y-12">
                  <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-200 shadow-sm border-l-[16px] border-l-indigo-600 group hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
                       <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                             <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest border border-indigo-100">{region.city}</span>
                             <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest border border-slate-200">Eq. Rio: {region.rioEquivalent}</span>
                          </div>
                          <h3 className="text-4xl font-black italic tracking-tighter">{region.name}</h3>
                          <p className="text-slate-500 font-bold italic text-base max-w-2xl">{region.description}</p>
                       </div>
                       <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col items-center min-w-[160px]">
                          <ShieldCheck className="text-indigo-600 mb-2" size={32} />
                          <p className="text-[10px] font-black uppercase text-indigo-400">Segurança</p>
                          <p className="text-2xl font-black italic text-indigo-950">{region.safety}</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-12">
                    {stays.map((stay, idx) => (
                      <div key={stay.id} className="relative group">
                         {idx === 0 && (
                            <div className="absolute -top-5 left-12 z-20 bg-amber-400 text-slate-900 px-8 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3">
                               <TrendingUp size={16} /> #1 Custo-Benefício nesta Região
                            </div>
                         )}
                         <StayCard stay={stay} onAdd={() => addEntry({ category: 'HOSPEDAGEM', description: stay.name, date: stay.period, total: stay.priceTotal, notes: stay.isPreferred ? 'Favorita' : region.name })} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* --- GUIA DE SOBREVIVÊNCIA --- */}
        {activeTab === 'tips' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-6">
            <header>
               <h2 className="text-4xl font-black italic tracking-tighter">Guia Prático</h2>
               <p className="text-slate-500 font-bold italic text-lg">Informações fundamentais para a jornada.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {SURVIVAL_TIPS.items.map((tip, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3rem] border-2 border-slate-200 shadow-sm flex flex-col gap-8 group hover:shadow-2xl hover:border-indigo-400 transition-all cursor-pointer">
                     <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-all">{tip.icon}</div>
                     <div>
                        <h4 className="text-[12px] font-black uppercase text-indigo-600 tracking-widest mb-2 italic">{tip.title}</h4>
                        <p className="text-sm font-bold text-slate-600 italic leading-relaxed">{tip.text}</p>
                     </div>
                  </div>
               ))}
            </div>
            <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer shadow-2xl">
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="space-y-4 text-center md:text-left">
                     <h3 className="text-4xl font-black italic tracking-tighter">Segurança Máxima</h3>
                     <p className="text-slate-400 font-bold italic text-lg max-w-2xl">Em Joanesburgo, o Uber é seu melhor amigo. Nunca ande com o celular na mão na rua, mesmo em áreas tranquilas.</p>
                  </div>
                  <ShieldAlert className="text-red-500 animate-pulse shrink-0" size={96} />
               </div>
            </div>
          </div>
        )}

        {/* --- FINANCEIRO: CONSOLIDADO --- */}
        {activeTab === 'budget' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-8">
            <header className="flex flex-col md:flex-row justify-between items-end border-b pb-10 gap-6">
               <div>
                  <h2 className="text-5xl font-black italic tracking-tighter leading-none">Financeiro</h2>
                  <p className="text-slate-500 font-bold italic text-xl mt-3">Consolidado total da viagem (Casal)</p>
               </div>
               <div className="text-right bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl w-full md:w-auto">
                  <p className="text-[11px] font-black uppercase text-indigo-400 tracking-widest leading-none mb-2 italic">Total Acumulado</p>
                  <p className="text-6xl font-black italic tracking-tighter text-indigo-600 leading-none">R$ {calculateTotalBudget().toLocaleString('pt-BR')}</p>
               </div>
            </header>

            <div className="bg-white rounded-[3.5rem] border-2 border-slate-200 shadow-2xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                       <tr>
                          <th className="px-6 md:px-10 py-8 text-[11px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Categoria</th>
                          <th className="px-6 md:px-10 py-8 text-[11px] font-black uppercase text-slate-400 tracking-widest">Item / Detalhes</th>
                          <th className="px-6 md:px-10 py-8 text-[11px] font-black uppercase text-slate-400 tracking-widest">Valor</th>
                          <th className="px-6 md:px-10 py-8 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Ação</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {budget.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                             <td className="px-6 md:px-10 py-8 align-top">
                                <span className={`inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase italic tracking-widest border whitespace-nowrap ${item.category === 'VOO' ? 'bg-blue-100 text-blue-600 border-blue-200' : item.category === 'HOSPEDAGEM' ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{item.category}</span>
                             </td>
                             <td className="px-6 md:px-10 py-8">
                                <p className="font-black italic text-xl text-slate-900 leading-none mb-1 min-w-[200px]">{item.description}</p>
                                <p className="text-xs font-bold text-slate-400 italic mt-2">{item.date} • {item.notes}</p>
                             </td>
                             <td className="px-6 md:px-10 py-8 font-black italic text-2xl text-slate-950 whitespace-nowrap">R$ {item.total.toLocaleString('pt-BR')}</td>
                             <td className="px-6 md:px-10 py-8 text-right">
                                <button onClick={() => removeEntry(item.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group-hover:scale-110"><Trash2 size={22} /></button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* BOTÃO FLUTUANTE DA IA */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-indigo-950 hover:bg-purple-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
        >
          {isChatOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
        </button>
      </div>

      {/* CHAT OVERLAY */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[60vh] md:h-[500px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
           <div className="bg-indigo-950 text-white p-6 flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-xl"><Bot size={20} /></div>
              <div>
                 <p className="font-black italic">VIA Assistant</p>
                 <p className="text-[10px] uppercase opacity-60 tracking-widest">Powered by Gemini AI</p>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {chatMessages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'}`}>
                       {msg.text}
                    </div>
                 </div>
              ))}
              {isAiThinking && (
                 <div className="flex justify-start">
                    <div className="bg-white text-slate-400 p-4 rounded-2xl rounded-bl-none text-xs font-black uppercase tracking-widest animate-pulse">
                       Digitando...
                    </div>
                 </div>
              )}
              <div ref={chatEndRef} />
           </div>

           <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2 pr-2">
                 <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Pergunte sobre sua viagem..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4 text-slate-800 placeholder:text-slate-400"
                 />
                 <button 
                    onClick={handleSendMessage}
                    disabled={isAiThinking || !chatInput.trim()}
                    className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
                 >
                    <Send size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-200 ${active ? 'bg-indigo-950 text-white shadow-xl translate-x-1 italic' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'}`}>
      {icon}
      <span>{label}</span>
      {active && <ArrowRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

function FlightCard({ title, flight, color }: { title: string, flight: any, color: string }) {
  const isIndigo = color === 'indigo';
  const accent = isIndigo ? 'text-indigo-600' : 'text-teal-600';
  const bg = isIndigo ? 'bg-indigo-50' : 'bg-teal-50';

  return (
    <div className="bg-white rounded-[3rem] border-2 border-slate-200 shadow-xl p-10 space-y-10 group hover:border-indigo-500 transition-all cursor-pointer relative overflow-hidden">
       <div className="flex justify-between items-start relative z-10">
          <div className={`${bg} ${accent} px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest italic border border-current/20`}>{flight.airline}</div>
          <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Voo: <span className="text-indigo-600 italic">{flight.flight}</span></p>
       </div>
       <div className="space-y-2 relative z-10">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-4xl font-black italic tracking-tighter leading-tight">{flight.route}</h3>
       </div>
       <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:shadow-inner transition-all">
             <p className="text-[10px] font-black uppercase text-slate-400 mb-2 italic">Saída</p>
             <p className="text-lg font-black italic leading-none">{flight.departure}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:shadow-inner transition-all">
             <p className="text-[10px] font-black uppercase text-slate-400 mb-2 italic">Chegada</p>
             <p className="text-lg font-black italic leading-none">{flight.arrival}</p>
          </div>
       </div>
       <div className="p-6 bg-indigo-50 rounded-[1.5rem] border border-indigo-100 flex items-center justify-between group-hover:bg-indigo-100 transition-all relative z-10">
          <div className="flex items-center gap-4">
             <Clock className="text-indigo-600" size={20} />
             <p className="text-[11px] font-black uppercase text-indigo-900 tracking-widest italic">Conexão: {flight.layover.split(' - ')[0]}</p>
          </div>
          <p className="text-[12px] font-black italic text-indigo-600 tracking-tighter">{flight.layover.split('- ')[1]}</p>
       </div>
       <Plane className="absolute -right-16 -bottom-16 text-slate-50 opacity-20 group-hover:opacity-40 transition-all" size={300} />
    </div>
  );
}

function StayCard({ stay, onAdd }: { stay: any, onAdd: () => void }) {
  return (
    <div className={`bg-white rounded-[3.5rem] border-2 ${stay.isPreferred ? 'border-indigo-600' : 'border-slate-200'} shadow-2xl overflow-hidden group hover:scale-[1.005] transition-all`}>
      <div className={`${stay.isPreferred ? 'bg-indigo-600' : 'bg-slate-900'} p-12 text-white relative`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 text-[11px] font-black px-5 py-1.5 rounded-full uppercase italic border border-white/30 tracking-widest">Genius Nível 2</div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
              </div>
            </div>
            <h3 className="text-5xl font-black italic tracking-tighter leading-none">{stay.name}</h3>
            <p className="text-white/60 font-bold italic text-lg flex items-center gap-3"><MapPin size={20}/> {stay.location}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] text-center min-w-[180px] border border-white/20">
            <p className="text-[11px] font-black uppercase opacity-40 mb-2 italic">Rating Booking</p>
            <p className="text-6xl font-black italic leading-none">{stay.rating}</p>
            <p className="text-[11px] font-bold uppercase opacity-60 mt-2">Excepcional</p>
          </div>
        </div>
      </div>
      <div className="p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-widest italic border-b pb-2">Comodidades Premium</h4>
                 <div className="grid grid-cols-1 gap-4">
                    {stay.amenities && stay.amenities.map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold italic text-slate-600"><Check size={20} className="text-green-500 shrink-0"/> {a}</div>
                    ))}
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-widest italic border-b pb-2">Logística do Bairro</h4>
                 <div className="space-y-3">
                    {stay.distances && stay.distances.map((d: any, i: number) => (
                      <div key={i} className="bg-slate-50 p-5 rounded-2xl border flex justify-between group-hover:bg-white transition-all">
                         <span className="text-sm font-black italic text-slate-800">{d.place}</span>
                         <span className="text-[11px] font-bold text-indigo-600 italic bg-white px-3 py-1 rounded-lg border">{d.dist}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="p-10 bg-slate-950 text-white rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-10 shadow-xl">
              <div className="text-center md:text-left">
                 <p className="text-[11px] font-black uppercase text-indigo-400 mb-2 italic">Investimento Total ({stay.nights} noites)</p>
                 <p className="text-5xl font-black italic tracking-tighter text-indigo-400 leading-none">R$ {stay.priceTotal.toLocaleString('pt-BR')}</p>
                 <p className="text-[11px] font-bold italic opacity-40 mt-2">Média de R$ {stay.pricePerNight} por noite</p>
              </div>
              <button onClick={onAdd} className="px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-indigo-500 hover:scale-105 transition-all shadow-2xl flex items-center gap-3"><Zap size={18} fill="currentColor"/> Adicionar ao Financeiro</button>
           </div>
        </div>
        <div className="flex flex-col gap-6 justify-center">
           <a href={stay.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 py-6 bg-indigo-600 text-white rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 transition-all shadow-2xl">
              Booking.com <ExternalLink size={20} />
           </a>
           <div className="p-8 bg-slate-50 rounded-[2.5rem] border-t-8 border-indigo-600 space-y-6 shadow-inner">
              <div className="flex items-start gap-4">
                 <ShieldCheck className="text-green-600 shrink-0" size={24}/> 
                 <div>
                    <p className="text-[11px] font-black uppercase text-slate-800 leading-none mb-1">Cancelamento</p>
                    <p className="text-xs font-bold text-slate-500 italic">{stay.cancellation}</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <Coffee className="text-amber-600 shrink-0" size={24}/> 
                 <div>
                    <p className="text-[11px] font-black uppercase text-slate-800 leading-none mb-1">Café da Manhã</p>
                    <p className="text-xs font-bold text-slate-500 italic">{stay.breakfast}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
