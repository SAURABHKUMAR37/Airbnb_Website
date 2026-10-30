const Spinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin" />
    <p className="mt-4">{text}</p>
  </div>
)
export default Spinner
