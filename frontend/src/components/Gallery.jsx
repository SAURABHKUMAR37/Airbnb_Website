import { useState } from 'react'

const Gallery = ({ photos = [], alt = '' }) => {
  const [index, setIndex] = useState(0)
  const list = photos.length ? photos : ['']
  const go = (dir) => setIndex((i) => (i + dir + list.length) % list.length)

  return (
    <div className="h-72 sm:h-96 lg:h-full lg:min-h-[28rem] bg-gray-100 overflow-hidden relative">
      {list.map((src, i) => (
        <img key={i} src={src} alt={alt} className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-700" style={{ opacity: i === index ? 1 : 0 }} />
      ))}
      {list.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md text-gray-800 w-10 h-10 rounded-full shadow-lg hover:bg-white transition">❮</button>
          <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md text-gray-800 w-10 h-10 rounded-full shadow-lg hover:bg-white transition">❯</button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {list.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`} className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-gray-400'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
export default Gallery
