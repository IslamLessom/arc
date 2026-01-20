export interface Service {
  id: string
  name: string
  description: string
  url: string
  port: number
}

export const SERVICES: Service[] = [
  {
    id: 'marketing-site',
    name: 'Маркетинговый сайт',
    description: 'Главная страница и информация о ресторане',
    url: 'http://localhost:3000',
    port: 3000,
  },
  {
    id: 'admin-panel',
    name: 'Панель управления',
    description: 'Панель управления рестораном',
    url: 'http://localhost:3001',
    port: 3001,
  },
  {
    id: 'pos-pwa',
    name: 'POS Терминал',
    description: 'Терминал для официантов',
    url: 'http://localhost:3002',
    port: 3002,
  },
  {
    id: 'qr-menu-pwa',
    name: 'QR Меню',
    description: 'Меню и онлайн-заказы для гостей',
    url: 'http://localhost:3003',
    port: 3003,
  },
]

export const getServiceById = (id: string): Service | undefined => {
  return SERVICES.find((service) => service.id === id)
}

export const getServiceByPort = (port: number): Service | undefined => {
  return SERVICES.find((service) => service.port === port)
}

