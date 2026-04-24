import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase'
import { useToast } from '../contexts/ToastContext'
import { useTranslation } from '../hooks/useTranslation'
import { useColorModeValues } from '../contexts/ColorModeContext'
import type { ColorMode } from '../types/types'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { t } = useTranslation()
  const colorModeContext: ColorMode = useColorModeValues()
  const handled = useRef(false)

  useEffect(() => {
    const finishSuccess = () => {
      if (handled.current) return
      handled.current = true
      success(t('signUp.emailConfirmed'), 6000)
      navigate('/', { replace: true })
    }

    const finishError = (message: string) => {
      if (handled.current) return
      handled.current = true
      console.log("Authentication failed")
      error(message)
      navigate('/signup', { replace: true })
    }

    // Supabase puts errors from the verify endpoint in the URL hash
    const hashParams: URLSearchParams = new URLSearchParams(window.location.hash.slice(1))

    const errorDescription = hashParams.get('error_description')
    if (errorDescription) {
      const errorCode = hashParams.get('error_code')

      // Supabase returns otp_expired for both truly-expired links and already-used ones.
      // If a session already exists, the user has verified previously — welcome them home.
      // Otherwise, route to the resend page so they can request a fresh link.
      if (errorCode === 'otp_expired') {
        supabase.auth.getSession().then(({ data }) => {
          if (handled.current) return
          handled.current = true
          if (data.session) {
            success(t('authCallback.alreadyVerified'), 6000)
            navigate('/', { replace: true })
          } else {
            navigate('/verify-expired', { replace: true })
          }
        })
        return
      }

      finishError(t('authCallback.linkInvalid'))
      return
    }

    // The SDK may have already parsed the URL and created a session before this
    // effect ran — check for it directly.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finishSuccess()
    })

    // Also listen for late-arriving auth events in case the exchange is still in flight.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') finishSuccess()
      if (event === 'INITIAL_SESSION' && session) finishSuccess()
    })

    // Safety net if nothing resolves (malformed link, network failure, etc.)
    const timeout: number = setTimeout(() => finishError(t('signUp.failed')), 6000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate, success, error, t])

  return (
    <div className={`${colorModeContext} min-h-screen flex items-center justify-center px-4`}>
      <p className={`${colorModeContext} text-fluid-lg background-text-reverse-black animate-pulse`}>
        {t('authCallback.verifying')}
      </p>
    </div>
  )
}

export default AuthCallback
