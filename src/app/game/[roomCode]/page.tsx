"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Timer, AlertTriangle, Send } from "lucide-react";

export default function GameBoardPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Local form state
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    ciudad: "",
    animal: "",
    color: "",
    cosa: ""
  });

  useEffect(() => {
    if (!roomCode) return;
    
    const roomRef = ref(database, `rooms/${roomCode}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
        
        // Si la sala volvió a "WAITING_FOR_PLAYERS", regresar al lobby
        if (data.turnState === "WAITING_FOR_PLAYERS") {
          router.push(`/lobby/${roomCode}`);
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => off(roomRef, "value", unsubscribe);
  }, [roomCode, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleStopPress = async () => {
    // Aquí implementaremos la lógica real de Stop, 
    // por ahora solo marcamos que presionó Stop en Firebase
    alert("¡STOP Presionado!");
    
    // TODO: Obtener el ID del jugador real de la sesión (cuando implementemos Auth/Registro)
    // const playerRef = ref(database, `rooms/${roomCode}/players/${myPlayerId}`);
    // await update(playerRef, { hasPressedStop: true, boardData: formData });
  };

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center text-brand-gold">
        <p className="text-2xl font-bold animate-pulse">Cargando Tablero...</p>
      </div>
    );
  }

  // Si aún están tirando el dado, mostrar interfaz de espera de letra
  if (room.turnState === "ROLLING_DICE") {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-8 text-center">
         <div className="w-32 h-32 rounded-3xl bg-brand-paper shadow-2xl flex items-center justify-center mb-8 animate-bounce">
            <span className="text-6xl font-black text-brand-navy">🎲</span>
         </div>
         <h1 className="text-4xl font-black text-brand-gold mb-4">Girando la Ruleta...</h1>
         <p className="text-brand-paper text-xl opacity-80">El host está eligiendo la letra de esta ronda.</p>
      </div>
    );
  }

  const currentLetter = room.currentLetter || "?";
  const players = room.players ? Object.values(room.players) : [];

  return (
    <main className="min-h-screen bg-brand-navy flex flex-col md:flex-row p-4 gap-4 h-screen max-h-screen overflow-hidden">
      
      {/* Columna Izquierda: Panel de Control (30%) */}
      <aside className="w-full md:w-1/3 flex flex-col gap-4 h-full">
        {/* Tarjeta de la Letra */}
        <div className="bg-brand-gold rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border-b-8 border-brand-gold-light/40 flex-shrink-0">
          <p className="text-brand-navy font-bold uppercase tracking-widest text-sm mb-2">Letra Actual</p>
          <div className="w-32 h-32 bg-brand-paper rounded-full flex items-center justify-center shadow-inner">
            <span className="text-7xl font-black text-brand-navy">{currentLetter}</span>
          </div>
        </div>

        {/* Temporizador */}
        <div className="bg-brand-paper rounded-2xl p-6 shadow-lg flex flex-col items-center flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 text-brand-navy">
            <Timer className="w-6 h-6 text-brand-gold" />
            <span className="font-bold text-lg">Tiempo Restante</span>
          </div>
          <span className="text-4xl font-black text-brand-navy tracking-widest">
            {room.maxMinutes}:00
          </span>
          <div className="w-full bg-brand-navy-light/20 h-3 rounded-full mt-4 overflow-hidden">
            <div className="bg-red-500 w-full h-full rounded-full origin-left animate-pulse"></div>
          </div>
        </div>

        {/* Leaderboard en Vivo */}
        <div className="bg-brand-navy-light flex-1 rounded-2xl p-4 overflow-y-auto shadow-inner border border-brand-gold/10">
          <h3 className="text-brand-paper font-bold mb-4 px-2">Jugadores ({players.length})</h3>
          <div className="space-y-2">
            {players.map((p: any, idx) => (
              <div key={idx} className="bg-brand-navy rounded-xl p-3 flex justify-between items-center text-brand-paper">
                <span className="font-medium truncate">{p.name}</span>
                <span className="text-brand-gold font-bold">{p.score || 0} pts</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Columna Derecha: Tablero de Juego (70%) */}
      <section className="w-full md:w-2/3 bg-brand-paper rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden h-full border-t-8 border-brand-gold">
        
        {/* Fondo decorativo raya de cuaderno */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, #0b1c2c 40px)', backgroundPositionY: '20px' }}></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-3xl font-black text-brand-navy">Tablero</h2>
          <div className="bg-brand-gold/20 text-brand-navy font-bold px-4 py-1 rounded-full text-sm">
            Sala {roomCode}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto z-10 pr-2 space-y-4">
          {["nombre", "apellido", "ciudad", "animal", "color", "cosa"].map((cat) => (
            <div key={cat} className="flex flex-col">
              <label className="text-brand-navy font-bold mb-1 uppercase text-sm tracking-wider pl-4">
                {cat}
              </label>
              <input
                type="text"
                name={cat}
                value={(formData as any)[cat]}
                onChange={handleInputChange}
                placeholder={`Escribe un ${cat}...`}
                className="w-full bg-white border-2 border-brand-navy/10 rounded-xl px-4 py-4 text-brand-navy text-xl font-bold outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 transition-all uppercase shadow-sm"
              />
            </div>
          ))}
        </div>

        {/* Botón STOP Masivo */}
        <div className="pt-6 mt-auto relative z-10">
          <button 
            onClick={handleStopPress}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-3xl py-6 rounded-2xl shadow-[0_8px_0_rgb(153,27,27)] hover:shadow-[0_4px_0_rgb(153,27,27)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-4 uppercase tracking-widest"
          >
            <AlertTriangle className="w-8 h-8" />
            ¡STOP!
          </button>
        </div>
      </section>

    </main>
  );
}
