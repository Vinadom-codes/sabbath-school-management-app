import {FaFileCircleQuestion} from 'react-icons/fa6'
const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F9FF] px-4 text-center">

      <FaFileCircleQuestion className="mb-6 text-8xl text-primary" />

      <h1 className="text-2xl font-extrabold tracking-wider text-navy sm:text-3xl">
        PAGE NOT FOUND
      </h1>

      <a
        href="/"
        className="mt-5 inline-flex items-center rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-navy"
      >
        Go Back
      </a>

    </div>
  )
}

export default NotFoundPage
