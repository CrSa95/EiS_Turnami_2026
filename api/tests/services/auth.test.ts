import AuthService from "../../src/services/auth.ts";

import assert from "node:assert/strict";

describe("AuthServices", () => {
    const authServices = new AuthService();

    describe("#login", () => {
        let medicoLogin = {
            email: "test@medico.com",
            password: "contraseñaEjemplo",
        };
        it('contraseña incorrecta lanza error con el mensaje "Error al iniciar sesión, intente nuevamente" ', async () => {
            await assert.rejects(
                async () => {
                    await authServices.login(medicoLogin.email, "zaraza");
                },
                {
                    message: "Error al iniciar sesión, intente nuevamente",
                },
            );
        });
    });
});
