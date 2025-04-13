import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8">
        <i className="bi bi-map text-8xl text-neutral-300"></i>
      </div>
      <h1 className="text-4xl font-bold text-neutral-900 mb-4">Page Not Found</h1>
      <p className="text-xl text-neutral-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary flex items-center">
        <i className="bi bi-house-door mr-2"></i>
        <span>Return Home</span>
      </Link>
    </div>
  )
}

export default NotFound
