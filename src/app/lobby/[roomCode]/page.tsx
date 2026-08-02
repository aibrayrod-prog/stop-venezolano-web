"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import { Users, Timer, CheckCircle2, ArrowLeft } from "lucide-react";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) return;
    
    const roomRef = ref(database, `rooms/${roomCode}`);
    
    // Escuchar cambios en tiempo real
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
      } else {
        // La sala no existe o fue eliminada
        setRoom(null);
      }
      setLoading(false);
    });

    return () => {
      // Limpiar el listener cuando el componente se desmonte
      off(roomRef, "value", unsubscribe);
    };
  }, [roomCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center text-brand-gold">
        <p className="text-2xl font-bold animate-pulse">Cargando Sala...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-brand-paper p-8">
        <h1 className="text-4xl font-black text-brand-gold mb-4">Sala no encontrada</h1>
        <p className="text-xl mb-8">El código {roomCode} no existe o la partida ya terminó.</p>
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-brand-navy-light px-6 py-3 rounded-full hover:bg-brand-navy border border-brand-gold/30 transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al Inicio
        </button>
      </div>
    );
  }

  // Extraer jugadores del Map/Diccionario de Firebase a un Array
  const players = room.players ? Object.values(room.players) : [];

  return (
    <main className="min-h-screen bg-brand-navy p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl flex items-center gap-4 mb-8">
         <button 
          onClick={() => router.push("/")}
          className="p-2 bg-brand-navy-light rounded-full text-brand-gold hover:bg-brand-paper hover:text-brand-navy transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-black text-brand-paper">Sala de Espera</h1>
      </div>

      {/* Tarjeta de Información de Sala */}
      <div className="bg-brand-paper w-full max-w-3xl rounded-2xl shadow-xl p-6 md:p-8 mb-6 border-t-4 border-brand-gold">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-navy">{room.roomName}</h2>
            <div className="flex items-center gap-2 text-brand-navy-light mt-2">
              <Timer className="w-5 h-5 text-brand-gold" />
              <span className="font-medium">Límite: {room.maxMinutes} minutos</span>
            </div>
          </div>
          
          <div className="bg-brand-gold px-6 py-3 rounded-xl shadow-inner text-center">
            <p className="text-sm font-bold text-brand-navy mb-1 uppercase tracking-wider">Código de Sala</p>
            <p className="text-4xl font-black text-brand-navy tracking-widest">{room.roomCode}</p>
          </div>
        </div>
      </div>

      {/* Lista de Jugadores */}
      <div className="bg-brand-paper/5 w-full max-w-3xl rounded-2xl p-6 md:p-8 border border-brand-gold/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-paper flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-gold" />
            Jugadores Conectados ({players.length}/{room.maxPlayers})
          </h3>
        </div>

        <div className="space-y-4">
          {players.length === 0 ? (
            <div className="text-center p-8 bg-brand-navy-light/50 rounded-xl border border-dashed border-brand-gold/30">
              <p className="text-brand-paper/70 font-medium">Esperando a que se unan jugadores...</p>
              <p className="text-sm text-brand-gold/80 mt-2">Comparte el código {room.roomCode} con tus amigos en la App Android.</p>
            </div>
          ) : (
            players.map((p: any, index: number) => (
              <div key={index} className="bg-brand-paper rounded-xl p-4 flex items-center justify-between shadow-sm border-l-4 border-brand-gold">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${p.isHost ? 'bg-brand-gold text-brand-navy' : 'bg-brand-navy text-brand-paper'}`}>
                    {(p.name || "J")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy text-lg">{p.name}</p>
                    <p className="text-xs font-semibold text-brand-navy-light">
                      {p.isHost ? "⭐ HOST" : "JUGADOR"}
                    </p>
                  </div>
                </div>
                
                {p.diceRoll > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xl text-green-600">🎲 {p.diceRoll}</span>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
