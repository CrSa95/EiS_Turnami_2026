import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { jest, describe, it, beforeEach } from "@jest/globals";
import PasswordService from "../../src/services/password.services";
import MedicoServices from "../../src/services/medico.services";
describe("MedicoService", () => {
    let mockMedicoDAO;
    let medicoServices;
    beforeEach(async () => {
        mockMedicoDAO = {
            findByDNI: jest.fn(),
        };
        medicoServices = new MedicoServices(mockMedicoDAO);
    });
    describe("#login", () => {
        const medicoLogin = {
            dni: "2222222",
            password: "contraseñaEjemplo",
        };
        let medicoMock;
        beforeAll(async () => {
            medicoMock = {
                _id: new Types.ObjectId(),
                dni: medicoLogin.dni,
                password: await PasswordService.hash(medicoLogin.password),
            };
        });
        it('contraseña incorrecta lanza error con el mensaje "Error al iniciar sesión, intente nuevamente" ', async () => {
            mockMedicoDAO.findByDNI.mockResolvedValue(medicoMock);
            await expect(medicoServices.login(medicoLogin.dni, "passwordInvalido")).rejects.toThrow("Error al iniciar sesión, intente nuevamente");
        });
        it('DNI inexistente lanza error con el mensaje "Usted no se encuentra registrado"', async () => {
            mockMedicoDAO.findByDNI.mockResolvedValue(null);
            await expect(medicoServices.login("0000000", medicoLogin.password)).rejects.toThrow("Usted no se encuentra registrado");
        });
        it("correo y contraseña correcto devuelve un token", async () => {
            mockMedicoDAO.findByDNI.mockResolvedValue(medicoMock);
            let { access_token, user } = await medicoServices.login(medicoLogin.dni, medicoLogin.password);
            expect(access_token).toBeDefined();
            expect(user.dni).toBe(medicoLogin.dni);
            expect(user.id).toEqual(medicoMock._id);
            expect(mockMedicoDAO.findByDNI).toHaveBeenCalledWith(medicoLogin.dni);
        });
    });
    describe("#validateToken", () => {
        const secret = process.env.JWT_SECRET || "turnami_dev_secret_key";
        const medicoMock = {
            _id: new Types.ObjectId(),
            dni: "2222222",
            password: "hashedPasswordMock",
        };
        it("devuelve true si el token es válido y el médico existe", async () => {
            const validToken = jwt.sign({ id: medicoMock._id, dni: medicoMock.dni }, secret, { expiresIn: "1h" });
            mockMedicoDAO.findByDNI.mockResolvedValue(medicoMock);
            const isValid = await medicoServices.validateToken(validToken);
            expect(isValid).toBe(true);
            expect(mockMedicoDAO.findByDNI).toHaveBeenCalledWith(medicoMock.dni);
        });
        it("devuelve false si el token está corrupto o mal formado", async () => {
            const isValid = await medicoServices.validateToken("token_invalido_zaraza");
            expect(isValid).toBe(false);
            expect(mockMedicoDAO.findByDNI).not.toHaveBeenCalled();
        });
        it("devuelve false si el token fue firmado con otro secret", async () => {
            const foreignToken = jwt.sign({ id: medicoMock._id, dni: medicoMock.dni }, "otro_secret_desconocido");
            const isValid = await medicoServices.validateToken(foreignToken);
            expect(isValid).toBe(false);
            expect(mockMedicoDAO.findByDNI).not.toHaveBeenCalled();
        });
        it("devuelve false si el token es válido pero el médico ya no existe en el DAO", async () => {
            const validToken = jwt.sign({ id: medicoMock._id, dni: medicoMock.dni }, secret);
            mockMedicoDAO.findByDNI.mockResolvedValue(null);
            const isValid = await medicoServices.validateToken(validToken);
            expect(isValid).toBe(false);
            expect(mockMedicoDAO.findByDNI).toHaveBeenCalledWith(medicoMock.dni);
        });
    });
});
//# sourceMappingURL=medico.test.js.map