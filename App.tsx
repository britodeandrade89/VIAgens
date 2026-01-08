import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Plane, Bus, Trash2, MapPin, Calendar, Clock, LayoutDashboard, Compass, Wallet, 
  ExternalLink, Star, ShieldCheck, Coffee, Check, ArrowRight, User, Award, TrendingUp, Info, ShieldAlert, Heart, Zap,
  Building2, Timer, Sparkles, MessageCircle, X, Send, Bot, Menu, Luggage
} from 'lucide-react';
import { 
  TAAG_TICKET_INFO, INTERNATIONAL_FLIGHTS, DOMESTIC_FLIGHT_DEAL, SURVIVAL_TIPS, ACCOMMODATIONS, BUS_LOGISTICS, LOGISTICS_TIMELINE, REGIONS 
} from './constants';
import { BudgetEntry, ChatMessage } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bus' | 'logistics' | 'stays' | 'tips' | 'budget'>('dashboard');
  const [budget, setBudget] = useState<BudgetEntry[]>([]);
  const [idaScenario, setIdaScenario] = useState<'via_leme' | 'direto_sp'>('direto_sp');
  const [selectedTip, setSelectedTip] = useState<typeof SURVIVAL_TIPS.items[0] | null>(null);
  
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
      
      const tripContext = JSON.stringify({
        voosInternacionais: INTERNATIONAL_FLIGHTS,
        passageiros: TAAG_TICKET_INFO,
        hoteis: ACCOMMODATIONS,
        onibusBrasil: BUS_LOGISTICS,
        cronogramaConexao: LOGISTICS_TIMELINE,
        budgetAtual: budget,
        totalGasto: calculateTotalBudget(),
        dicas: SURVIVAL_TIPS,
        vooDomesticoMelhorOferta: DOMESTIC_FLIGHT_DEAL
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
      
      <div 
        className={`fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

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
      </aside>

      <main className="p-4 md:p-12 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <header className="md:hidden flex justify-between items-center mb-6 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-slate-200/60 shadow-sm transition-all">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-700 rounded-xl"><Menu size={28} /></button>
           <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">V<span className="text-purple-600">IA</span>gens</h1>
           <div className="w-8" />
        </header>

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
          </div>
        )}

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
             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                   <h3 className="text-3xl font-black italic">Total Logística Brasil</h3>
                   <p className="text-indigo-400 font-bold italic mt-1">Soma de todos os trechos x2 (Casal)</p>
                </div>
                <div className="text-center md:text-right">
                   <p className="text-5xl font-black italic tracking-tighter leading-none">R$ {calculateBusTotal()}</p>
                   <button onClick={() => addEntry({ category: 'TRANSPORTE', description: `Brasil Terrestre (${idaScenario}) Casal`, date: '06/02', total: calculateBusTotal(), notes: 'RJ-SP-GRU' })} className="mt-4 px-10 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Adicionar ao Financeiro</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="space-y-12">
            <header>
               <h2 className="text-4xl font-black italic tracking-tighter">Conexão JNB</h2>
               <p className="text-slate-500 font-bold italic">Transferência no O.R. Tambo e Voo Interno</p>
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
                  <div className="bg-indigo-950 text-white rounded-[3rem] p-12 h-full flex flex-col justify-center relative overflow-hidden shadow-2xl">
                     <div className="absolute top-8 right-8 bg-amber-400 text-indigo-950 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-bounce">
                        <Star size={14} fill="currentColor"/> Melhor Preço de Hoje
                     </div>
                     <div className="relative z-10 space-y-10">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center"><Plane size={32} /></div>
                           <div>
                              <p className="text-[11px] font-black uppercase text-indigo-400 tracking-widest">Trecho Doméstico (Airlink)</p>
                              <h3 className="text-4xl font-black italic">{DOMESTIC_FLIGHT_DEAL.company}</h3>
                           </div>
                        </div>
                        
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                           <Luggage className="text-green-400" size={24}/>
                           <p className="text-sm font-bold italic text-white/80">{DOMESTIC_FLIGHT_DEAL.baggage}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                              <p className="text-[10px] font-black uppercase opacity-40 mb-1">Ida: JNB ➔ CPT</p>
                              <p className="text-2xl font-black italic leading-none">{DOMESTIC_FLIGHT_DEAL.outbound.date} • {DOMESTIC_FLIGHT_DEAL.outbound.time}</p>
                              <p className="text-[10px] font-bold opacity-40 mt-1">Chegada: {DOMESTIC_FLIGHT_DEAL.outbound.arrival}</p>
                           </div>
                           <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                              <p className="text-[10px] font-black uppercase opacity-40 mb-1">Volta: CPT ➔ JNB</p>
                              <p className="text-2xl font-black italic leading-none">{DOMESTIC_FLIGHT_DEAL.return.date} • {DOMESTIC_FLIGHT_DEAL.return.time}</p>
                              <p className="text-[10px] font-bold opacity-40 mt-1">Chegada: {DOMESTIC_FLIGHT_DEAL.return.arrival}</p>
                           </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/10 pt-10 gap-6">
                           <div>
                              <p className="text-[11px] font-black uppercase text-indigo-300">Total Casal (2 Pessoas)</p>
                              <p className="text-5xl font-black italic tracking-tighter">R$ {(DOMESTIC_FLIGHT_DEAL.pricePerPerson * 2).toLocaleString('pt-BR')}</p>
                           </div>
                           <button onClick={() => addEntry({ category: 'VOO', description: 'JNB-CPT Airlink (Casal)', date: '26/01', total: DOMESTIC_FLIGHT_DEAL.pricePerPerson * 2, notes: '2 Malas Despachadas' })} className="w-full md:w-auto px-12 py-5 bg-white text-indigo-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Selecionar Oferta</button>
                        </div>
                     </div>
                     <Plane className="absolute -right-20 -bottom-20 text-white/5" size={500} />
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'stays' && (
          <div className="space-y-20">
            <header>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Hospedagens</h2>
            </header>
            {Object.entries(REGIONS).map(([regId, region]) => {
              const stays = groupedStays[regId];
              if (!stays || stays.length === 0) return null;
              return (
                <section key={regId} className="space-y-12">
                  <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-200 border-l-[16px] border-l-indigo-600">
                    <h3 className="text-4xl font-black italic tracking-tighter">{region.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-12">
                    {stays.map((stay, idx) => (
                      <StayCard key={stay.id} stay={stay} onAdd={() => addEntry({ category: 'HOSPEDAGEM', description: stay.name, date: stay.period, total: stay.priceTotal, notes: region.name })} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-12">
            <header>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Guias & Dicas</h2>
              <p className="text-slate-500 font-bold italic text-lg mt-2">Manual de Sobrevivência SA</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {SURVIVAL_TIPS.items.map((tip, i) => (
                 <button key={i} onClick={() => setSelectedTip(tip)} className="bg-white p-10 rounded-[3rem] border-2 border-slate-200 shadow-xl flex flex-col justify-between hover:border-indigo-600 hover:shadow-2xl transition-all text-left group">
                    <div>
                       <div className="text-5xl mb-6 filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">{tip.icon}</div>
                       <h3 className="text-2xl font-black italic text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{tip.title}</h3>
                       <p className="text-slate-500 font-medium leading-relaxed">{tip.text}</p>
                    </div>
                    <div className="mt-8 flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                      Ler Guia Completo <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                 </button>
               ))}
            </div>

            <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                  <h3 className="text-3xl font-black italic mb-4">Roteiro Inteligente</h3>
                  <p className="text-indigo-100 text-lg mb-8 max-w-xl">Não sabe o que fazer no dia livre? Peça para a nossa IA criar um roteiro personalizado baseado no seu perfil e orçamento.</p>
                  <button onClick={() => { setIsChatOpen(true); setChatInput("Sugira um roteiro de 1 dia para Joanesburgo focado em história e cultura."); }} className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-colors">
                    Gerar Roteiro Agora
                  </button>
               </div>
               <Compass className="absolute -right-12 -bottom-24 text-white/10" size={300} />
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-end border-b pb-10 gap-6">
               <div><h2 className="text-5xl font-black italic tracking-tighter leading-none">Financeiro</h2></div>
               <div className="text-right bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl w-full md:w-auto">
                  <p className="text-6xl font-black italic tracking-tighter text-indigo-600">R$ {calculateTotalBudget().toLocaleString('pt-BR')}</p>
               </div>
            </header>
            <div className="bg-white rounded-[3.5rem] border-2 border-slate-200 shadow-2xl overflow-hidden">
               <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                     {budget.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-10 py-8"><p className="font-black italic text-xl">{item.description}</p></td>
                           <td className="px-10 py-8 font-black italic text-2xl">R$ {item.total.toLocaleString('pt-BR')}</td>
                           <td className="px-10 py-8 text-right"><button onClick={() => removeEntry(item.id)} className="p-4 text-red-500"><Trash2 size={22} /></button></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-indigo-950 text-white p-4 rounded-full shadow-2xl"><Sparkles size={24} /></button>
      </div>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden">
           <div className="bg-indigo-950 text-white p-6"><p className="font-black italic">VIA Assistant</p></div>
           <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {chatMessages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white shadow-sm'}`}>{msg.text}</div>
                 </div>
              ))}
              <div ref={chatEndRef} />
           </div>
           <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pergunte sobre sua viagem..." className="flex-1 bg-slate-100 rounded-xl px-4 text-sm outline-none" />
              <button onClick={handleSendMessage} className="p-3 bg-purple-600 text-white rounded-xl"><Send size={18} /></button>
           </div>
        </div>
      )}

      {selectedTip && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTip(null)}>
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedTip(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X size={24} />
            </button>
            <div className="text-6xl mb-6">{selectedTip.icon}</div>
            <h3 className="text-3xl font-black italic text-slate-900 mb-6">{selectedTip.title}</h3>
            <div className="prose prose-slate prose-lg">
              <p className="font-medium text-slate-600 leading-relaxed mb-6">{selectedTip.text}</p>
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                 <h4 className="text-indigo-900 font-bold mb-2 flex items-center gap-2"><Info size={18}/> Detalhes do Guia</h4>
                 <p className="text-indigo-800/80 text-sm leading-relaxed">{selectedTip.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all ${active ? 'bg-indigo-950 text-white shadow-xl italic' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
      {icon}
      <span>{label}</span>
      {active && <ArrowRight size={14} className="ml-auto" />}
    </button>
  );
}

function FlightCard({ title, flight, color }: { title: string, flight: any, color: string }) {
  const isIndigo = color === 'indigo';
  return (
    <div className="bg-white rounded-[3rem] border-2 border-slate-200 shadow-xl p-10 space-y-10 relative overflow-hidden">
       <div className="flex justify-between items-start relative z-10">
          <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest italic border border-current/20 ${isIndigo ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>{flight.airline}</div>
          <p className="text-[11px] font-black uppercase text-slate-400">Voo: <span className="text-indigo-600 italic">{flight.flight}</span></p>
       </div>
       <div className="space-y-2 relative z-10">
          <h3 className="text-4xl font-black italic tracking-tighter leading-tight">{flight.route}</h3>
       </div>
       <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
             <p className="text-[10px] font-black uppercase text-slate-400 mb-2 italic">Saída</p>
             <p className="text-lg font-black italic">{flight.departure}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
             <p className="text-[10px] font-black uppercase text-slate-400 mb-2 italic">Chegada</p>
             <p className="text-lg font-black italic">{flight.arrival}</p>
          </div>
       </div>
       <Plane className="absolute -right-16 -bottom-16 text-slate-50 opacity-20" size={300} />
    </div>
  );
}

const StayCard: React.FC<{ stay: any; onAdd: () => void }> = ({ stay, onAdd }) => {
  return (
    <div className={`bg-white rounded-[3.5rem] border-2 ${stay.isPreferred ? 'border-indigo-600' : 'border-slate-200'} shadow-2xl overflow-hidden`}>
      <div className={`${stay.isPreferred ? 'bg-indigo-600' : 'bg-slate-900'} p-12 text-white`}>
        <h3 className="text-5xl font-black italic tracking-tighter">{stay.name}</h3>
        <p className="text-white/60 font-bold italic text-lg flex items-center gap-3 mt-4"><MapPin size={20}/> {stay.location}</p>
      </div>
      <div className="p-12 flex flex-col md:flex-row justify-between items-center gap-10">
         <div>
            <p className="text-5xl font-black italic text-indigo-400">R$ {stay.priceTotal.toLocaleString('pt-BR')}</p>
            <p className="text-xs font-bold italic opacity-40 mt-2">{stay.nights} noites • Café {stay.breakfast}</p>
         </div>
         <button onClick={onAdd} className="px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em]">Adicionar</button>
      </div>
    </div>
  );
}