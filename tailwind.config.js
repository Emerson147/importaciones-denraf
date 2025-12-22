/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 🚀 OPTIMIZACIÓN: Eliminar CSS no usado en producción
  purge: {
    enabled: true,
    content: [
      './src/**/*.{html,ts}',
    ],
    safelist: [
      // Clases dinámicas que Tailwind no puede detectar
      'bg-green-500',
      'bg-blue-500', 
      'bg-red-500',
      'bg-yellow-500',
      'text-green-500',
      'text-blue-500',
      'text-red-500',
      'text-yellow-500',
    ]
  }
}
