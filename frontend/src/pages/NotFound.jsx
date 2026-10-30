import { Link } from 'react-router-dom'

const NotFound = () => (
  <main className="container mx-auto px-4 py-24 text-center">
    <p className="text-7xl mb-4">🧭</p>
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Page not found</h1>
    <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
    <Link to="/" className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition">Go home</Link>
  </main>
)
export default NotFound
