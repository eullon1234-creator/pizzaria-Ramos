import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-zinc-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
          🍕
        </div>
      </div>
      <p className="mt-4 text-zinc-500 font-medium text-sm animate-pulse">
        Carregando Pizzaria Ramos...
      </p>
    </div>
  );
}
