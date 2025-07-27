'use client';

import React from 'react';
import { BounceLoader, PuffLoader } from 'react-spinners';

export default function Loading() {
    return (
        <>
            {/* <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-scienceBlue-900 opacity-70"> */}
            <div className="fixed bottom-0 left-0 right-0 top-0 z-50  flex h-screen w-full flex-col items-center justify-center opacity-70 ">
                <div className="" >
                    <PuffLoader
                        color="#00D3F3"
                        cssOverride={{}}
                        loading
                        size={200}
                        speedMultiplier={0.8}
                    />

                    {/* <h2 className="-ml-2 mt-2 text-center text-xl font-semibold text-white">
                        carregando...
                    </h2> */}
                </div>
            </div>
        </>
    );
}
