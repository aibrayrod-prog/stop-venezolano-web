"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Play, Users, Loader2 } from "lucide-react";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const roomCode = generateRoomCode();
      const roomRef = ref(database, `rooms/${roomCode}`);
      
      // Estructura inicial de la sala (Igual a la de Android)
      await set(roomRef, {
        roomCode: roomCode,
        roomName: "Sala de " + roomCode,
        maxPlayers: 8,
        maxMinutes: 3,
        turnState: "WAITING_FOR_PLAYERS",
        createdAt: Date.now(),
      });

      // Redirigir al lobby
      router.push(`/lobby/${roomCode}`);
    } catch (error) {
      console.error("Error al crear la sala:", error);
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-brand-navy">
      <div className="relative bg-brand-paper rounded-xl shadow-2xl p-10 max-w-2xl w-full border-t-8 border-brand-gold relative overflow-hidden">
        
        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-brand-navy drop-shadow-md mb-2 tracking-tight">
            <span className="text-brand-gold">STOP</span> Venezolano
          </h1>
          <p className="text-brand-navy-light font-medium text-lg flex items-center justify-center gap-2">
            El clásico juego de mesa, ahora con juego cruzado.
            <Pencil className="w-5 h-5 text-brand-gold" />
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-12">
          <button 
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="flex items-center justify-center gap-3 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg disabled:opacity-70 disabled:hover:scale-100"
          >
            {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
            {isCreating ? "Creando Sala..." : "Crear Sala Nueva"}
          </button>
          
          <button className="flex items-center justify-center gap-3 bg-brand-navy-light hover:bg-brand-navy text-brand-paper font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg border border-brand-gold/30">
            <Users className="w-6 h-6 text-brand-gold" />
            Unirse a una Sala
          </button>
        </div>

        <div className="mt-16 text-sm text-brand-navy/60 font-medium">
          <p>Sincronizado en tiempo real con la App de Android.</p>
        </div>
      </div>
    </main>
  );
}
