import { isAxiosError } from 'axios'

const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте еще раз.'

const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  'subscription expired': 'Срок подписки истек. Продлите подписку, чтобы продолжить работу.',
  'your subscription has expired. you can only view data in read-only mode. please renew your subscription to make changes.':
    'Срок подписки истек. Доступен только режим просмотра. Продлите подписку, чтобы вносить изменения.',
  'access denied. super admin role required.': 'Доступ разрешен только супер-администратору.',
  'invalid credentials': 'Неверный логин или пароль.',
  unauthorized: 'Сессия истекла. Войдите снова.',
}

const isGenericTransportMessage = (message: string): boolean => {
  const normalizedMessage = message.trim()

  return (
    /^Request failed with status code \d{3}$/i.test(normalizedMessage) ||
    normalizedMessage === 'Network Error'
  )
}

const translateKnownMessage = (message: string): string => {
  const normalizedMessage = message.trim()
  const lowerMessage = normalizedMessage.toLowerCase()
  const translatedMessage = KNOWN_ERROR_MESSAGES[lowerMessage]

  if (translatedMessage) {
    return translatedMessage
  }

  if (lowerMessage.includes('subscription has expired')) {
    return 'Срок подписки истек. Доступен только режим просмотра. Продлите подписку, чтобы вносить изменения.'
  }

  if (lowerMessage.includes('read-only mode')) {
    return 'Сейчас доступен только режим просмотра данных.'
  }

  return normalizedMessage
}

const extractString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalizedValue = value.trim()
  return normalizedValue ? normalizedValue : undefined
}

const extractMessageFromPayload = (payload: unknown): string | undefined => {
  const directMessage = extractString(payload)
  if (directMessage) {
    return translateKnownMessage(directMessage)
  }

  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const data = payload as Record<string, unknown>

  if (data.read_only === true) {
    return (
      translateKnownMessage(extractString(data.message) || '') ||
      'Срок подписки истек. Сейчас доступен только просмотр данных. Продлите подписку, чтобы снова вносить изменения.'
    )
  }

  const prioritizedMessage =
    extractString(data.error) ||
    extractString(data.message) ||
    extractString(data.detail) ||
    extractString(data.details)

  if (prioritizedMessage) {
    return translateKnownMessage(prioritizedMessage)
  }

  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      const itemMessage = extractMessageFromPayload(item)
      if (itemMessage) {
        return itemMessage
      }
    }
  }

  return undefined
}

const getStatusMessage = (status?: number, code?: string): string | undefined => {
  if (code === 'ECONNABORTED') {
    return 'Сервер отвечает слишком долго. Попробуйте еще раз.'
  }

  switch (status) {
    case 400:
      return 'Некорректный запрос. Проверьте введенные данные.'
    case 401:
      return 'Сессия истекла. Войдите снова.'
    case 403:
      return 'У вас нет доступа для выполнения этого действия.'
    case 404:
      return 'Запрошенные данные не найдены.'
    case 409:
      return 'Не удалось выполнить действие из-за конфликта данных.'
    case 422:
      return 'Проверьте введенные данные и повторите попытку.'
    case 429:
      return 'Слишком много запросов. Попробуйте чуть позже.'
    default:
      if (status && status >= 500) {
        return 'На сервере возникла ошибка. Попробуйте позже.'
      }

      return undefined
  }
}

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE
): string => {
  if (isAxiosError(error)) {
    const payloadMessage = extractMessageFromPayload(error.response?.data)
    if (payloadMessage) {
      return payloadMessage
    }

    const axiosMessage = extractString(error.message)
    if (axiosMessage && !isGenericTransportMessage(axiosMessage)) {
      return translateKnownMessage(axiosMessage)
    }

    return getStatusMessage(error.response?.status, error.code) || fallbackMessage
  }

  if (error instanceof Error) {
    return translateKnownMessage(error.message)
  }

  if (typeof error === 'string' && error.trim()) {
    return translateKnownMessage(error)
  }

  return fallbackMessage
}

export const applyApiErrorMessage = <T extends { message?: string }>(error: T, fallbackMessage?: string): T => {
  error.message = getApiErrorMessage(error, fallbackMessage)
  return error
}