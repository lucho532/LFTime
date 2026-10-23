import type { UsuarioDto } from '../contratos/usuario'

/**
 * Usuarios de prueba para el ingreso simulado (D9). No tienen contraseña ni representan
 * seguridad real. Casos cubiertos: administrador con y sin permiso de fotos (D24, D30),
 * coordinadores con zonas distintas (D28) y trabajadores con distintos escenarios.
 */
export const USUARIOS_DEMO: UsuarioDto[] = [
  {
    id: 'usr-admin-1',
    nombres: 'Carolina',
    apellidos: 'Mejía',
    rol: 'ADMINISTRADOR',
    puedeVerFotos: true,
    notaDemo: 'Administradora con permiso explícito para ver fotos',
  },
  {
    id: 'usr-admin-2',
    nombres: 'Ricardo',
    apellidos: 'Pardo',
    rol: 'ADMINISTRADOR',
    puedeVerFotos: false,
    notaDemo: 'Administrador sin permiso para ver fotos',
  },
  {
    id: 'usr-coord-1',
    nombres: 'Laura',
    apellidos: 'Gómez',
    rol: 'COORDINADOR',
    hospitalesResponsable: ['hosp-01', 'hosp-02'],
    notaDemo: 'Coordinadora responsable de San José y La Merced',
  },
  {
    id: 'usr-coord-2',
    nombres: 'Andrés',
    apellidos: 'Salazar',
    rol: 'COORDINADOR',
    hospitalesResponsable: ['hosp-03', 'hosp-04'],
    notaDemo: 'Coordinador responsable de San Vicente y Santa Sofía',
  },
  {
    id: 'usr-trab-001',
    nombres: 'María',
    apellidos: 'López',
    rol: 'TRABAJADOR',
    trabajadorId: 'trab-001',
    notaDemo: 'Trabajadora con jornada normal',
  },
  {
    id: 'usr-trab-004',
    nombres: 'Julián',
    apellidos: 'Castro',
    rol: 'TRABAJADOR',
    trabajadorId: 'trab-004',
    notaDemo: 'Trabajador que llegó tarde hoy',
  },
  {
    id: 'usr-trab-012',
    nombres: 'Hernán',
    apellidos: 'Giraldo',
    rol: 'TRABAJADOR',
    trabajadorId: 'trab-012',
    notaDemo: 'Trabajador con intentos fuera del radio',
  },
  {
    id: 'usr-trab-016',
    nombres: 'Esteban',
    apellidos: 'Arias',
    rol: 'TRABAJADOR',
    trabajadorId: 'trab-016',
    notaDemo: 'Trabajador de un hospital sin coordenadas confirmadas (no puede marcar)',
  },
]
