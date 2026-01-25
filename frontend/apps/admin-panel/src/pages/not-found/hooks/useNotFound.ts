import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotFoundProps } from '../model/types'
import { DEFAULT_ERROR_CODE, DEFAULT_TITLE, DEFAULT_MESSAGE } from '../lib/constants'

export const useNotFound = (props: NotFoundProps = {}) => {
  const navigate = useNavigate()

  const {
    code = DEFAULT_ERROR_CODE,
    title = DEFAULT_TITLE,
    message = DEFAULT_MESSAGE,
  } = props

  const handleGoHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleGoBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return {
    code,
    title,
    message,
    handleGoHome,
    handleGoBack,
  }
}
