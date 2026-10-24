/**
 * Datos personales editables de cualquier persona de la aplicación (trabajador, coordinador o
 * administrador): solo los estrictamente necesarios (P-13). Es la parte común de `DatosTrabajador` y
 * `DatosUsuario`. La foto no se edita aquí: es de cada persona (D14).
 */
export interface DatosPersonales {
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  cargo: string
  /** Texto vacío si no se registró. */
  telefono: string
}
