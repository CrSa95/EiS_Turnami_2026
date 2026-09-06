import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { jest, describe, it, beforeEach } from "@jest/globals";
import { beforeAll, expect } from "@jest/globals";
import PasswordService from "../../src/services/password.services";
import PacienteServices from "../../src/services/paciente.services";
describe("PacienteService", () => {
    let mockPacienteDAO;
    let pacienteServices;
    beforeEach(async () => {
        mockPacienteDAO = {
            findByDNI: jest.fn(),
        };
        pacienteServices = new PacienteServices(mockPacienteDAO);
    });
    describe("#login", () => {
        const pacienteLogin = {
            dni: "3333333",
            password: "contraseñaEjemplo",
        };
        let pacienteMock;
        beforeAll(async () => {
            pacienteMock = {
                _id: new Types.ObjectId(),
                dni: pacienteLogin.dni,
                password: await PasswordService.hash(pacienteLogin.password),
            };
        });
        it('contraseña incorrecta lanza error con el mensaje "Error al iniciar sesión, intente nuevamente" ', async () => {
            mockPacienteDAO.findByDNI.mockResolvedValue(pacienteMock);
            await expect(pacienteServices.login(pacienteLogin.dni, "passwordInvalido")).rejects.toThrow("Error al iniciar sesión, intente nuevamente");
        });
        it('DNI inexistente lanza error con el mensaje "Usted no se encuentra registrado"', async () => {
            mockPacienteDAO.findByDNI.mockResolvedValue(null);
            await expect(pacienteServices.login("0000000", pacienteLogin.password)).rejects.toThrow("Usted no se encuentra registrado");
        });
        it("correo y contraseña correcto devuelve un token", async () => {
            mockPacienteDAO.findByDNI.mockResolvedValue(pacienteMock);
            const { access_token, user } = await pacienteServices.login(pacienteLogin.dni, pacienteLogin.password);
            expect(access_token).toBeDefined();
            expect(user.dni).toBe(pacienteLogin.dni);
            expect(user.id).toEqual(pacienteMock._id);
            expect(mockPacienteDAO.findByDNI).toHaveBeenCalledWith(pacienteLogin.dni);
        });
    });
    describe("#validateToken", () => {
        const secret = process.env.JWT_SECRET || "turnami_dev_secret_key";
        const pacienteMock = {
            _id: new Types.ObjectId(),
            dni: "3333333",
            password: "hashedPasswordMock",
        };
        it("devuelve true si el token es válido y el paciente existe", async () => {
            const validToken = jwt.sign({ id: pacienteMock._id, dni: pacienteMock.dni }, secret, { expiresIn: "1h" });
            mockPacienteDAO.findByDNI.mockResolvedValue(pacienteMock);
            const isValid = await pacienteServices.validateToken(validToken);
            expect(isValid).toBe(true);
            expect(mockPacienteDAO.findByDNI).toHaveBeenCalledWith(pacienteMock.dni);
        });
        it("devuelve false si el token está corrupto o mal formado", async () => {
            const isValid = await pacienteServices.validateToken("token_invalido_zaraza");
            expect(isValid).toBe(false);
            expect(mockPacienteDAO.findByDNI).not.toHaveBeenCalled();
        });
        it("devuelve false si el token fue firmado con otro secret", async () => {
            const foreignToken = jwt.sign({ id: pacienteMock._id, dni: pacienteMock.dni }, "otro_secret_desconocido");
            const isValid = await pacienteServices.validateToken(foreignToken);
            expect(isValid).toBe(false);
            expect(mockPacienteDAO.findByDNI).not.toHaveBeenCalled();
        });
        it("devuelve false si el token es válido pero el paciente ya no existe en el DAO", async () => {
            const validToken = jwt.sign({ id: pacienteMock._id, dni: pacienteMock.dni }, secret);
            mockPacienteDAO.findByDNI.mockResolvedValue(null);
            const isValid = await pacienteServices.validateToken(validToken);
            expect(isValid).toBe(false);
            expect(mockPacienteDAO.findByDNI).toHaveBeenCalledWith(pacienteMock.dni);
        });
    });
});
//# sourceMappingURL=paciente.test.js.map