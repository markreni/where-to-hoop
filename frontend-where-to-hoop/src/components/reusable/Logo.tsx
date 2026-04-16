import { useState } from 'react'

const Logo = () => {
  const [bouncing, setBouncing] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBouncing(true)
    setTimeout(() => setBouncing(false), 500)
  }

  return (
    <h1 className="group text-first-color text-fluid-xl font-semibold tracking-normal whitespace-nowrap hover:text-second-color">
      WhereHo
      <span
        className={`inline-block cursor-pointer xsm:group-hover:animate-bounce ${bouncing ? 'animate-bounce' : ''}`}
        onClick={handleClick}
      >
        🏀
      </span>
      p<span className="inline-block rotate-12 ml-px">z</span>
    </h1>
  );
}

export { Logo };