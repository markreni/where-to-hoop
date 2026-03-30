import { useColorModeValues } from '../contexts/ColorModeContext'
import { BackArrow } from '../components/reusable/BackArrow'
import Footer from '../components/Footer'
import FindFriendSection from '../components/FindFriendSection'
import type { ColorMode } from '../types/types'

const SearchPlayers = () => {
  const colorModeContext: ColorMode = useColorModeValues()

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-2xl mx-auto">
          <FindFriendSection variant="page" />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SearchPlayers
