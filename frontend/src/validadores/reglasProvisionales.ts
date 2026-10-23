import { CAMPOS_REGLAS } from '../configuracion/camposReglas'
import type { ReglasProvisionalesDto } from '../contratos/configuracion'

/** Errores de la configuración, por valor. Un valor sin error no aparece. */
export type ErroresReglas = Partial<Record<keyof ReglasProvisionalesDto, string>>

/** Resultado de leer los textos del formulario: los valores válidos y los errores. */
export interface ResultadoReglas {
  valores: ReglasProvisionalesDto | null
  errores: ErroresReglas
}

/**
 * Valida los textos del formulario de configuración: cada uno debe ser un número entero dentro del rango
 * de su campo (`CAMPOS_REGLAS`). El rango es solo una protección contra errores de digitación; no dice
 * qué valor es correcto para el negocio (P-01, P-02, D19 y P-25 siguen provisionales). Devuelve todos los
 * errores juntos, y los valores solo si no hay ninguno.
 */
export function validarReglasProvisionales(textos: Record<keyof ReglasProvisionalesDto, string>): ResultadoReglas {
  const errores: ErroresReglas = {}
  const numeros: Partial<ReglasProvisionalesDto> = {}
  for (const campo of CAMPOS_REGLAS) {
    const texto = textos[campo.clave].trim()
    const numero = Number(texto)
    if (texto === '' || !Number.isInteger(numero)) {
      errores[campo.clave] = 'Escribe un número entero.'
    } else if (numero < campo.minimo || numero > campo.maximo) {
      errores[campo.clave] = `Debe estar entre ${campo.minimo} y ${campo.maximo} ${campo.unidad}.`
    } else {
      numeros[campo.clave] = numero
    }
  }
  return Object.keys(errores).length === 0 ? { valores: numeros as ReglasProvisionalesDto, errores } : { valores: null, errores }
}
