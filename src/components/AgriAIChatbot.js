import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useChatbotQuery, forceRestock } from '../store/tierSlice';

export default function AgriAIChatbot({ isOpen, onToggle, onOpenRestockModal }) {
  const dispatch = useDispatch();
  const { tier, maxChatQueriesPerDay, chatbotQueriesUsedToday, lastRestockTime } = useSelector(state => state.tier);

  const queriesLeft = tier === 'pro' ? 'Unlimited' : Math.max(0, maxChatQueriesPerDay - chatbotQueriesUsedToday);
  const isOutOfQuota = tier === 'free' && chatbotQueriesUsedToday >= maxChatQueriesPerDay;

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Farmer! I am your **AgriAI Assistant**. Ask me anything about crop diseases, soil nutrients, irrigation schedules, or weather protection!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const presetQuestions = [
    "🌾 Best fertilizer ratio for Paddy?",
    "🐛 How to treat leaf yellowing in Wheat?",
    "💧 Soil moisture requirement for Cotton?",
    "🌤️ Weather tips for spraying pesticides?"
  ];

  const generateAIResponse = (userText) => {
    const query = userText.toLowerCase();

    if (query.includes('fertilizer') || query.includes('paddy') || query.includes('npk')) {
      return `For Paddy (Rice), the recommended N-P-K fertilizer ratio is **120:60:60 kg/hectare**.\n\n` +
             `• **Basal Application**: Apply 50% Nitrogen + 100% Phosphorus + 50% Potassium at transplanting.\n` +
             `• **Top Dressing**: Apply remaining Nitrogen in 2 equal splits (Tillering & Panicle Initiation stage).\n` +
             `• **Tip**: Maintain 2-3 cm standing water during fertilizer top-dressing for maximum absorption.`;
    }
    if (query.includes('leaf') || query.includes('yellow') || query.includes('wheat') || query.includes('rust')) {
      return `Yellowing in Wheat leaves is often caused by **Nitrogen deficiency** or early stage **Stripe Rust (Puccinia striiformis)**.\n\n` +
             `• **Diagnosis**: Check if yellow powder rubs off on fingers (Rust) or if lower leaves are uniform yellow (Nitrogen deficiency).\n` +
             `• **Treatment**: Spray **Propiconazole 25% EC @ 1ml/Liter** or Urea foliar spray (2%) in clear weather.\n` +
             `• **Timing**: Spray early morning or evening for best absorption.`;
    }
    if (query.includes('moisture') || query.includes('cotton') || query.includes('water') || query.includes('irrigation')) {
      return `Cotton requires **600-800 mm** of water across its lifecycle.\n\n` +
             `• **Critical Stages**: Flowering & Boll Formation are most critical. Water stress now causes boll drop.\n` +
             `• **Soil Moisture Target**: Maintain 60-70% available soil moisture.\n` +
             `• **Advice**: Use the **Basic Soil Moisture Calculator** tool in AgriLand to calculate exact liters/acre based on your current field temperature and recent rain!`;
    }
    if (query.includes('spray') || query.includes('weather') || query.includes('pesticide')) {
      return `Before applying agricultural sprays, check weather metrics:\n\n` +
             `• **Wind Speed**: Ideal wind speed is **3 - 10 km/h**. High wind causes drift.\n` +
             `• **Temperature**: Avoid spraying above **32°C** as liquid evaporates rapidly.\n` +
             `• **Rain Forecast**: Check the 5-day Standard Weather Forecast in AgriLand to ensure no rain within 4 hours post-spray.`;
    }

    return `Thank you for your question about **"${userText}"**!\n\n` +
           `• **General Agronomic Recommendation**: Ensure balanced soil nutrition and regular soil moisture checks.\n` +
           `• **Weather Notice**: Check the live Open-Meteo satellite weather widget on your plot details page for real-time wind and humidity.\n` +
           `• **Need Specific Guidance?**: You can ask about pests, fertilizers, soil moisture, or crop sowing dates.`;
  };

  const handleSend = (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (isOutOfQuota) {
      return;
    }

    // Add user message
    const userMsg = {
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    dispatch(useChatbotQuery());
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAIResponse(messageText);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      <button 
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-[100] bg-gradient-to-r from-[#006e2f] to-[#008e4d] hover:from-[#005321] hover:to-[#00733d] text-white p-4 rounded-full shadow-2xl flex items-center gap-3 transition-transform active:scale-95 group"
        title="AgriAI Assistant Chatbot"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </div>
        <div className="hidden md:flex flex-col items-start pr-1 text-left">
          <span className="font-black text-sm tracking-wide leading-none">AgriAI Assistant</span>
          <span className="text-[11px] text-green-200 font-bold mt-1">
            {tier === 'pro' ? 'Pro Unlimited' : `${queriesLeft}/10 Queries Left`}
          </span>
        </div>
      </button>

      {/* Expanded Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-[105] w-[92vw] md:w-[420px] h-[580px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="bg-[#006e2f] text-white p-4 px-6 flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <span className="material-symbols-outlined text-white">smart_toy</span>
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">AgriAI Assistant</h3>
                <div className="flex items-center gap-2 text-xs text-green-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span>Freemium Daily Restocked Quota</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onToggle}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Quota Indicator Banner */}
          <div className={`px-5 py-2.5 flex justify-between items-center text-xs font-bold ${isOutOfQuota ? 'bg-red-50 text-red-700 border-b border-red-100' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'}`}>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                {isOutOfQuota ? 'lock' : 'bolt'}
              </span>
              <span>
                {tier === 'pro' ? 'Pro Tier: Unlimited Queries' : `Daily Quota: ${queriesLeft} / ${maxChatQueriesPerDay} Queries Remaining`}
              </span>
            </div>
            <button 
              onClick={() => dispatch(forceRestock())}
              className="text-[11px] underline font-bold hover:text-emerald-900"
              title="Click to simulate midnight restock"
            >
              Restock Now
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8fafc]">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#006e2f] text-white rounded-br-none shadow-md font-medium' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200/80 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-3 w-max text-xs text-gray-500 font-bold animate-pulse">
                <span className="material-symbols-outlined text-green-600 animate-spin text-sm">sync</span>
                AgriAI is analyzing agronomic records...
              </div>
            )}

            {/* Out of Quota Warning Banner in Chat */}
            {isOutOfQuota && (
              <div className="bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 rounded-2xl p-4 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined">update</span>
                </div>
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Daily 10 Queries Limit Reached</h4>
                  <p className="text-xs text-red-700 font-medium mt-1">
                    Freemium Tier provides 10 free AI queries per day. Your quota will be restocked automatically at midnight ({lastRestockTime}).
                  </p>
                </div>
                <button 
                  onClick={() => dispatch(forceRestock())}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">autorenew</span>
                  Simulate Daily Quota Restock (10/10)
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Preset Prompts (if quota available) */}
          {!isOutOfQuota && messages.length < 5 && (
            <div className="p-2 px-4 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
              {presetQuestions.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-[11px] bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-700 font-semibold px-2.5 py-1 rounded-full transition-colors border border-gray-200"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text"
                disabled={isOutOfQuota}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isOutOfQuota ? "Daily query quota reached (Restocks daily)..." : "Ask AgriAI about crops, soil, pests..."}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#006e2f] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button 
                type="submit"
                disabled={isOutOfQuota || !input.trim()}
                className="w-11 h-11 bg-[#006e2f] hover:bg-[#005321] disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors shadow-md flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
