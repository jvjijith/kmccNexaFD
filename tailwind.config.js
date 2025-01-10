/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-toastify/dist/ReactToastify.css"
  ],
  theme: {
    extend: {
      colors: {
        'nexa-orange': '#ff4a17',
         'nexa-gray':"#3f3f3f",
         'primary':"#f8f9fa",
         'secondary':"#ffffff",
         'focus-color':"#000000",
         'text-color':"#212529",
         'primary-card':"#f8f9fa",
         'secondary-card':"#ffffff",
         'primary-button-color':"#ff4a17",
         'secondary-button-color':"#3f3f3f",
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],

}