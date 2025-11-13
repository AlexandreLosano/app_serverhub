import { useState, useEffect } from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Header = ({ onAddLink }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatar dia da semana
  const weekday = currentTime.toLocaleDateString('pt-BR', { weekday: 'long' });

  // Formatar data
  const date = currentTime.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Formatar hora
  const time = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="flex items-center justify-between mb-[30px] p-5 gap-5 flex-wrap">
      {/* Data e Hora */}
      <div className="flex-shrink-0 font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        <div className="text-sm opacity-90 capitalize">{weekday}</div>
        <div className="text-base font-semibold">{date}</div>
        <div className="text-lg font-bold font-mono">{time}</div>
      </div>

      {/* Título */}
      <div className="flex-1 text-center">
        <h1 className="text-[2.5rem] font-bold drop-shadow-lg" style={{ color: 'var(--header-text)', textShadow: '2px 2px 4px var(--header-shadow)' }}>
          Server Hub - Zorin 🚀
        </h1>
      </div>

      {/* Controles */}
      <div className="flex-shrink-0 flex gap-2.5 items-center">
        <button
          onClick={onAddLink}
          className="px-5 py-2.5 border-0 rounded-lg text-[0.9rem] font-semibold cursor-pointer
                     transition-all duration-200 outline-none hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--btn-primary-hover)';
            e.target.style.boxShadow = '0 4px 8px var(--card-shadow-hover)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--btn-primary-bg)';
            e.target.style.boxShadow = 'none';
          }}
          title="Adicionar novo link"
        >
          Adicionar Link
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
