import { createContext, useContext, useState, useEffect } from 'react';

// Criar contexto
const ThemeContext = createContext();

// Temas disponíveis
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Hook para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};

// Provider do tema
export const ThemeProvider = ({ children }) => {
  // Estado do tema (light, dark, auto)
  const [theme, setTheme] = useState(() => {
    // Pegar tema salvo no localStorage ou usar 'auto' como padrão
    return localStorage.getItem('theme') || THEMES.AUTO;
  });

  // Estado do tema efetivo (light ou dark)
  const [effectiveTheme, setEffectiveTheme] = useState('light');

  // Detectar tema baseado no horário (6h - 18:30 = claro, 18:30 - 6h = escuro)
  const getTimeBasedTheme = () => {
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();

    // Convertendo tudo para minutos para facilitar comparação
    const currentTimeInMinutes = hour * 60 + minutes;
    const startLightTheme = 6 * 60; // 6:00 = 360 minutos
    const endLightTheme = 18 * 60 + 30; // 18:30 = 1110 minutos

    // Se está entre 6h e 18:30, retorna light, caso contrário dark
    if (currentTimeInMinutes >= startLightTheme && currentTimeInMinutes < endLightTheme) {
      return THEMES.LIGHT;
    }
    return THEMES.DARK;
  };

  // Aplicar tema no documento
  useEffect(() => {
    let newTheme = theme;

    // Se for 'auto', usar tema baseado no horário
    if (theme === THEMES.AUTO) {
      newTheme = getTimeBasedTheme();
    }

    // Aplicar classe dark no HTML
    if (newTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setEffectiveTheme(newTheme);
  }, [theme]);

  // Verificar horário a cada minuto quando estiver em modo auto
  useEffect(() => {
    if (theme !== THEMES.AUTO) return;

    const checkTime = () => {
      const timeTheme = getTimeBasedTheme();
      setEffectiveTheme(timeTheme);

      if (timeTheme === THEMES.DARK) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Verificar a cada 60 segundos
    const interval = setInterval(checkTime, 60000);

    // Cleanup
    return () => clearInterval(interval);
  }, [theme]);

  // Função para trocar o tema
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Valores do contexto
  const value = {
    theme, // Tema selecionado (light, dark, auto)
    effectiveTheme, // Tema efetivo aplicado (light ou dark)
    setTheme: toggleTheme,
    isDark: effectiveTheme === THEMES.DARK,
    isLight: effectiveTheme === THEMES.LIGHT,
    isAuto: theme === THEMES.AUTO,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
