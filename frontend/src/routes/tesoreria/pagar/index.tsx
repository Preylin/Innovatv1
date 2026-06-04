import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tesoreria/pagar/')({
  beforeLoad: () => {
    // Cuando el usuario entre a /tesoreria/pagar, lo mandamos directo a mensuales
    throw redirect({
      to: '/tesoreria/pagar/mensuales',
    })
  },
})