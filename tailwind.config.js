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
         'primary':"#fff8f6",
         'secondary':"#eeeeee",
         'sidebar':"#fffaf8",
         'focus-color':"#000000",
         'sidebar-text-color':"#737791",
         'text-color':"#262b43",
         'btn-text-color':"#ffffff",
         'primary-card':"#ffffff",
         'secondary-card':"#ffffff",
         'primary-button-color':"#000000",
         'secondary-button-color':"#3f3f3f",
         'border':"#eeeeee",
         'table-heading':"#fff8f6"
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],

}