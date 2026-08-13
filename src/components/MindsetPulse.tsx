import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Quote, Calendar } from 'lucide-react';

export const ANXIETY_QUOTES: { text: string; author: string }[] = [
  { text: "Worrying does not empty tomorrow of its sorrow, it empties today of its strength.", author: "Corrie ten Boom" },
  { text: "Outputting 30% with a calm heart beats 100% with adrenaline dread.", author: "Somatic Mindset Principle" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "Nothing diminishes anxiety faster than small, gentle action.", author: "Walter Anderson" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "You have 100% permission to quit after 1 Focus Bit is done.", author: "Mental Medic Core" },
  { text: "You cannot always control what goes on outside. But you can always control what goes on inside.", author: "Wayne Dyer" },
  { text: "Done with B- minus quality is better than an unstarted masterpiece.", author: "Perfectionism Defense" },
  { text: "Anxiety is a thin stream of fear trickling through the mind. Conscious grounding stops its flow.", author: "Arthur Somers Roche" },
  { text: "Just when the caterpillar thought the world was ending, it turned into a butterfly.", author: "Traditional Wisdom" },
  { text: "The best way out is always through, one micro step at a time.", author: "Robert Frost" },
  { text: "Safety always precedes productivity. Breathe out completely.", author: "Polyvagal Safety Theory" },
  { text: "Surrender to what is. Let go of what was. Have faith in what will be.", author: "Sonia Ricotti" },
  { text: "Perfectionism is anxiety in disguise. Lower the bar on purpose today.", author: "Mental Medic Protocol" },
];

export const MindsetPulse: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    setCurrentDateStr(today.toLocaleDateString('en-US', options));
    setQuoteIndex(Math.floor(Math.random() * ANXIETY_QUOTES.length));
  }, []);

  const handleShuffle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % ANXIETY_QUOTES.length);
      setIsAnimating(false);
    }, 200);
  };

  const currentQuote = ANXIETY_QUOTES[quoteIndex] || ANXIETY_QUOTES[0];
  const totalLength = currentQuote.text.length + currentQuote.author.length;

  const getQuoteFontClass = () => {
    if (totalLength > 115) return 'text-[9.5px] sm:text-[10.5px] md:text-xs leading-tight';
    if (totalLength > 85) return 'text-[10px] sm:text-[11px] md:text-xs leading-snug';
    return 'text-[11px] sm:text-xs leading-normal';
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white/90 border border-pink-200/90 rounded-2xl p-2.5 sm:p-3 shadow-sm shadow-pink-500/5 backdrop-blur-md">
      {/* Date Welcome Greeting */}
      <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 bg-pink-50/80 border border-pink-300/80 rounded-xl text-xs shrink-0 font-bold text-slate-800 w-full sm:w-auto">
        <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
        <span className="whitespace-nowrap">Welcome in <span className="text-pink-600 font-extrabold">{currentDateStr}</span></span>
      </div>

      {/* Quote Container */}
      <div className="flex-1 w-full flex items-center justify-between gap-2 bg-slate-50/80 border border-slate-200 px-3 py-1.5 sm:py-2 rounded-xl text-xs min-w-0">
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          <Quote className="w-3.5 h-3.5 text-pink-400 shrink-0 rotate-180 self-center" />
          <p
            className={`font-medium text-slate-700 transition-opacity duration-200 italic ${getQuoteFontClass()} ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
            title={`"${currentQuote.text}" — ${currentQuote.author}`}
          >
            "{currentQuote.text}"{' '}
            <span className="text-[10px] font-bold text-pink-500 not-italic ml-1 inline-block whitespace-nowrap">
              — {currentQuote.author}
            </span>
          </p>
        </div>

        <button
          onClick={handleShuffle}
          title="Shuffle Grounding Anxiety Quote"
          className="p-1 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-100/60 transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnimating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
