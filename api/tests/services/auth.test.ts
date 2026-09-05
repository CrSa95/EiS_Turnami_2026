import { jest, describe, it, beforeEach } from "@jest/globals";
import AuthService from "../../src/services/auth";
import MedicoDAO from "../../src/dao/medico";
import assert from "node:assert/strict";
import { PasswordService } from "../../src/services/passwordServices";
import { IMedico } from "../../src/model/medico.js";

describe("AuthServices", () => {
    let mockMedicoDAO: jest.Mocked<MedicoDAO>;
    let authServices: AuthService;

    beforeEach(async () => {
        // Mock manual del DAO
        mockMedicoDAO = {
            findByEmail: jest.fn(),
        } as unknown as jest.Mocked<MedicoDAO>;

        authServices = new AuthService(mockMedicoDAO);
    });

    describe("#login", () => {
        const medicoLogin = {
            email: "test@medico.com",
            password: "contraseñaEjemplo",
        };

        it('contraseña incorrecta lanza error con el mensaje "Error al iniciar sesión, intente nuevamente" ', async () => {
            const hashedPassword = await PasswordService.hash(
                medicoLogin.password,
            );
            const medicoMock: IMedico = {
                email: medicoLogin.email,
                password: hashedPassword,
            };
            mockMedicoDAO.findByEmail.mockResolvedValue(medicoMock);
            await assert.rejects(
                async () => {
                    await authServices.login(medicoLogin.email, "zaraza");
                },
                {
                    message: "Error al iniciar sesión, intente nuevamente",
                },
            );
        });

        it('correo inexistente lanza error con el mensaje "Error al iniciar sesion, intente nuevamente"', async () => {
            mockMedicoDAO.findByEmail.mockResolvedValue(null);
            await assert.rejects(
                async () => {
                    await authServices.login(
                        "fake@correo.com",
                        medicoLogin.password,
                    );
                },
                {
                    message: "Error al iniciar sesión, intente nuevamente",
                },
            );
        });
    });
});
