package com.lftime.servidor.arquitectura.infractores.reglas;

import org.springframework.stereotype.Component;

/** Regla de ejemplo que depende de Spring a propósito, para probar que la regla de pureza falla. No usar en código real. */
@Component
public class ReglaInfractora {

    public int doble(int valor) {
        return valor * 2;
    }
}
