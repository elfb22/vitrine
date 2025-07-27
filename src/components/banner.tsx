/* eslint-disable @next/next/no-img-element */
'use client'
import React from 'react';
import { Crown, Zap, Star } from 'lucide-react';

export default function Banner() {
    return (
        <div>
            <div className="relative overflow-hidden min-h-screen">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/images/logo3.jpeg"
                        alt="Mystical Wizard Banner"
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/50  "></div>
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div> */}
                </div>

                {/* Floating particles effect */}
                <div className="absolute inset-0">
                    {[...Array(25)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-cyan-400 animate-pulse"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 4 + 2}px`,
                                height: `${Math.random() * 4 + 2}px`,
                                opacity: Math.random() * 0.8 + 0.2,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <div className="container mx-auto px-4 py-16">
                        <div className="text-center">
                            {/* Main Title */}
                            <div className="mb-8">
                                {/* <h1 className="text-6xl md:text-8xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                        ELFPODS
                                    </span>
                                </h1> */}
                                <img
                                    src="/images/logotipo.png"
                                    alt="Mystical Wizard Banner"
                                    className="w-1/2 md:w-1/3 mx-auto mb-4"
                                />
                                <p className="text-2xl md:text-3xl mb-6 text-cyan-100 font-light tracking-wide">
                                    Desperte sua magia interior ✨
                                </p>
                                <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                    Descubra uma experiência única com nossos produtos místicos. Cada sabor é uma jornada, cada momento é
                                    uma aventura.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="flex flex-wrap justify-center gap-4 mb-12">
                                <div className="flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-cyan-900/50">
                                    <Crown className="w-5 h-5 text-yellow-400" />
                                    <span className="text-cyan-100 font-medium">Qualidade Premium</span>
                                </div>
                                <div className="flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-cyan-900/50">
                                    <Zap className="w-5 h-5 text-cyan-400" />
                                    <span className="text-cyan-100 font-medium">Sabores Intensos</span>
                                </div>
                                <div className="flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-cyan-900/50">
                                    <Star className="w-5 h-5 text-blue-400" />
                                    <span className="text-cyan-100 font-medium">Experiência Única</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}