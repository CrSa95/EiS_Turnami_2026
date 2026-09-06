import { Types } from "mongoose";
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
        //TODO: Reemplazar uso de mock para findByEmail cuando este implementado el alta de medico
        const medicoLogin = {
            dni: "2222222",
            password: "contraseñaEjemplo",
        };
        let medicoMock: IMedico;

        beforeAll(async () => {
            medicoMock = {
                _id: new Types.ObjectId(),
                dni: medicoLogin.dni,
                password: await PasswordService.hash(medicoLogin.password),
            } as IMedico;
        });

        it('contraseña incorrecta lanza error con el mensaje "Error al iniciar sesión, intente nuevamente" ', async () => {
            mockMedicoDAO.findByEmail.mockResolvedValue(medicoMock);
            await expect(
                medicoServices.login(medicoLogin.dni, "passwordInvalido"),
            ).rejects.toThrow("Error al iniciar sesión, intente nuevamente");
        });

        it('DNI inexistente lanza error con el mensaje "Usted no se encuentra registrado"', async () => {
            mockMedicoDAO.findByEmail.mockResolvedValue(null);
            await expect(
                medicoServices.login("0000000", medicoLogin.password),
            ).rejects.toThrow("Usted no se encuentra registrado");
        });

        it("correo y contraseña correcto devuelve un token", async () => {
            mockMedicoDAO.findByEmail.mockResolvedValue(medicoMock);
            let { access_token, user } = await medicoServices.login(
                medicoLogin.dni,
                medicoLogin.password,
            );

            expect(access_token).toBeDefined();
            expect(user.dni).toBe(medicoLogin.dni);
            expect(user.id).toEqual(medicoMock._id);
            expect(mockMedicoDAO.findByEmail).toHaveBeenCalledWith(
                medicoLogin.dni,
            );
        });
    });
});
