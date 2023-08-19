// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboards',
      icon: 'mdi:home-outline',
      badgeColor: 'error',
      children: [
        {
          title: 'Envíos',
          path: '/dashboards/shipments'
        },
        {
          title: 'Generar permisos',
          path: '/dashboards/generate-urls'
        }
      ]
    },
  ]
}

export default navigation
