import type { UsuarioDto } from '../contratos/usuario'
import type { Usuario } from '../modelos/usuario'

/**
 * Convierte un `UsuarioDto` (contrato) en el modelo interno `Usuario`.
 * Normaliza los campos opcionales; no contiene reglas de negocio.
 */
export function aUsuario(dto: UsuarioDto): Usuario {
  return {
    id: dto.id,
    nombres: dto.nombres,
    apellidos: dto.apellidos,
    nombreCompleto: `${dto.nombres} ${dto.apellidos}`,
    rol: dto.rol,
    trabajadorId: dto.trabajadorId ?? null,
    hospitalesResponsable: dto.hospitalesResponsable ?? [],
    puedeVerFotos: dto.puedeVerFotos === true,
    urlFoto: dto.urlFoto ?? null,
    notaDemo: dto.notaDemo ?? '',
  }
}
