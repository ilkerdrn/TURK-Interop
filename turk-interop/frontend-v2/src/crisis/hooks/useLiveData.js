import { useState, useEffect, useRef } from 'react';
import { INITIAL_EVENTS, COUNTRY_RISK } from '../data/crisisStore';

/**
 * Gerçek zamanlı veri simülasyonu
 * Her 4 saniyede bir küçük değişiklikler üretir
 */
export function useLiveData() {
  const [events,      setEvents]      = useState(INITIAL_EVENTS);
  const [countryRisk, setCountryRisk] = useState(COUNTRY_RISK);
  const [lastUpdate,  setLastUpdate]  = useState(Date.now());
  const [alerts,      setAlerts]      = useState([]);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      const tick = tickRef.current;

      // Etkilenen nüfusu hafifçe dalgalandır
      setEvents(prev => prev.map(ev => {
        if (ev.status === 'resolved') return ev;
        const delta = Math.floor((Math.random() - 0.4) * 500);
        return { ...ev, affected: Math.max(0, ev.affected + delta) };
      }));

      // Risk skorlarını hafifçe güncelle
      setCountryRisk(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(c => {
          const d = (Math.random() - 0.5) * 2;
          const newScore = Math.min(100, Math.max(0, updated[c].score + d));
          updated[c] = { ...updated[c], score: Math.round(newScore) };
        });
        return updated;
      });

      // Her 5 tick'te bir yeni uyarı üret
      if (tick % 5 === 0) {
        const alertTypes = [
          '🔴 TR: Artçı deprem tespit edildi (M4.2)',
          '🟡 AZ: Su seviyesi yükseliyor (+0.3m)',
          '🟠 KZ: Yeni vaka kümesi rapor edildi',
          '🔵 UZ: Yangın kontrol altına alındı (%60)',
          '🟢 KG: Tahliye tamamlandı'
        ];
        const msg = alertTypes[tick % alertTypes.length];
        setAlerts(prev => [
          { id: Date.now(), msg, time: new Date().toLocaleTimeString('tr-TR') },
          ...prev.slice(0, 9)
        ]);
      }

      setLastUpdate(Date.now());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return { events, countryRisk, lastUpdate, alerts };
}
