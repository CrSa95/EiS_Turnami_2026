import { Types } from "mongoose";
import assert from "node:assert/strict";
import { jest, describe, it, beforeEach } from "@jest/globals";

import PasswordService from "../../src/services/password.services";
import MedicoServices from "../../src/services/medico.services";
import MedicoDAO from "../../src/dao/medico.dao";


import { IMedico } from "../../src/model/medico.model.js";


describe("MedicoService", () => {
    let mockMedicoDAO: jest.Mocked<MedicoDAO>;
    let medicoServices: MedicoServices;

    beforeEach(async () => {
        // Mock manual del DAO
        mockMedicoDAO = {
            findByEmail: jest.fn(),
        } as unknown as jest.Mocked<MedicoDAO>;

        medicoServices = new MedicoServices(mockMedicoDAO);
    });

    describe("#login", () => {
        const medicoLogin = {
            email: "test@medico.com",
            password: "contraseñaEjemplo",
        };
        let medicoMock: IMedico

        beforeAll(async () => {
            medicoMock = {
                _id: new Types.ObjectId(),
                email: medicoLogin.email,
                password: await PasswordService.hash(medicoLogin.password)
            };
        })


        it('contraseña incorrecta lanza error con el mensaje "Error al iniciar sesión, intente nuevamente" ', async () => {

            mockMedicoDAO.findByEmail.mockResolvedValue(medicoMock);
            await assert.rejects(
                async () => {
                    await medicoServices.login(medicoLogin.email, "zaraza");
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
                    await medicoServices.login(
                        "fake@correo.com",
                        medicoLogin.password,
                    );
                },
                {
                    message: "Error al iniciar sesión, intente nuevamente",
                },
            );
        });


        it("correo y contraseña correcto devuelve un token", async () => {
            mockMedicoDAO.findByEmail.mockResolvedValue(medicoMock)
            let { access_token, user } = await medicoServices.login(medicoLogin.email, medicoLogin.password)

            expect(access_token).toBeDefined();
            expect(user.email).toBe(medicoLogin.email);
            expect(user.id).toEqual(medicoMock._id);
        })
    });
});
