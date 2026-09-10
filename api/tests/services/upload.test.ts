import { jest, describe, it, beforeEach, expect } from "@jest/globals";
import UploadServices from "../../src/services/upload.services.js";
import ImageModel from "../../src/model/image.model.js";

describe("UploadServices", () => {
    let uploadServices: UploadServices;

    beforeEach(() => {
        uploadServices = new UploadServices();
        jest.clearAllMocks();
    });

    it("guarda los metadatos de la imagen correctamente en la base de datos", async () => {
        const mockFile = {
            filename: "test-123456.jpg",
            mimetype: "image/jpeg",
            size: 1024,
        };

        const mockSavedImage = {
            _id: "mock_mongo_id",
            ...mockFile,
            filepath: "/uploads/test-123456.jpg",
        };

        jest.spyOn(ImageModel.prototype, "save").mockResolvedValue(mockSavedImage as any);

        const result = await uploadServices.guardarMetadatosImagen(mockFile);

        expect(result).toBeDefined();
        expect(result.filename).toBe(mockFile.filename);
        expect(result.filepath).toBe(`/uploads/${mockFile.filename}`);
        expect(ImageModel.prototype.save).toHaveBeenCalledTimes(1);
    });
});