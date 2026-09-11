import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  doctorPendingImages,
  patientImages,
  patientUploadImage,
  validateSession,
} from "../data/auth";
import "../styles/home.css";
import Recetas from "../components/Recetas";
import Navigation from "../components/Navigation";
import ModalState from "../components/ModalStates";

export const States = {
  Error: "Error",
  Ok: "Ok",
  Loading: "Loading",
};

function HomePage() {
  const [session, setSession] = useState(() => {
    const storedSession = localStorage.getItem("turnami-session");
    return storedSession ? JSON.parse(storedSession) : null;
  });
  const navigate = useNavigate();

  const [state, setState] = useState("NONE");
  const [recetas, setRecetas] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!session) return;

    validateSession(session.role, session.access_token).catch(() => {
      localStorage.removeItem("turnami-session");
      setSession(null);
    });
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const loadImages =
      session.role === "patient" ? patientImages : doctorPendingImages;
    loadImages(session.access_token)
      .then((images) =>
        setRecetas(
          images.map((image) => ({
            paciente: {
              nombre:
                image.paciente?.split(" ")[0] || image.paciente || "Paciente",
              apellido: image.paciente?.split(" ").slice(1).join(" ") || "",
            },
            receta: {
              nombre: image.idReceta,
              fecha: image.fechaCarga || image.createdAt || "",
            },
            image,
          })),
        ),
      )
      .catch(() => setRecetas([]));
  }, [session]);

  if (!session) return <Navigate to="/" replace />;

  const fullName = [session.user.nombre, session.user.apellido]
    .filter(Boolean)
    .join(" ");
  const role = session.role === "patient" ? "paciente" : "medico";

  const handleLogout = () => {
    localStorage.removeItem("turnami-session");
    navigate("/", { replace: true });
  };

  const handleImage = async (file) => {
    setState(States.Loading);
    try {
      await patientUploadImage(session.access_token, file);
      setState(States.Ok);
      const images = await patientImages(session.access_token);
      setRecetas(
        images.map((image) => ({
          paciente: { nombre: "", apellido: "" },
          receta: { nombre: image.idReceta, fecha: image.createdAt || "" },
          image,
        })),
      );
    } catch (error) {
      setState(States.Error);
    }
  };

  const handleViewImage = (image) => {
    if (selectedImage) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };


 
    const handleDownload = async (url, filename = 'imagen-descargada.jpg') => {
      setLoading(true);
      try {
        // 1. Obtener la información de la imagen
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al descargar la imagen');
      
        // 2. Convertir la respuesta a un Blob (Binary Large Object)
        const blob = await response.blob();
      
        // 3. Crear una URL local temporal para ese Blob
        const blobUrl = URL.createObjectURL(blob);
      
        // 4. Crear un enlace 'a' oculto en el DOM
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename; // Define el nombre con el que se guardará
      
        // 5. Simular el clic en el enlace para iniciar la descarga
        document.body.appendChild(link);
        link.click();
      
        // 6. Limpiar el DOM y liberar la memoria ocupada por la URL temporal
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("No se pudo guardar la imagen:", error);
        alert("Hubo un problema al guardar la imagen.");
      } finally {
        setLoading(false);
      }
    };
 

  const subtitle =
    role == "paciente"
      ? `Visualiza y envia tus recetas`
      : `Gestiona y transcrive las recetas`;
  return (
    <main className="home-page">
      <Navigation
        title={`Bienvenido/a,  ${fullName}`}
        subtitle={subtitle}
        handleLogout={handleLogout}
      />
      <Recetas
        recetas={recetas}
        rol={role}
        handleImage={handleImage}
        handleViewImage={handleViewImage}
        handleDownload={handleDownload}
        selectedImage={selectedImage}
      />
      <ModalState state={state} setState={setState} />
    </main>
  );
}

export default HomePage;
