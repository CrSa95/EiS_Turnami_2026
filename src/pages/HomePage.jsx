import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  doctorPendingImagesOrdenes,
  doctorPendingImagesRecetas,
  patientImagesOrdenes,
  patientImagesRecetas,
  patientUploadImage,
  rejectRecipe,
  transcribeRecipe,
  validateSession,
} from "../data/auth";
import "../styles/home.css";
import Recetas from "../components/Recetas";
import Navigation from "../components/Navigation";
import ModalState from "../components/ModalStates";
import ModalReject from "../components/ModalReject";
import TabView from "../components/TabView";
import Ordenes from "../components/Ordenes";

export const States = {
  Error: "Error",
  Ok: "Ok",
  Loading: "Loading",
};

const formatRecipeDate = (value) => {
  if (!value) return "";
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
};

const tabs = [
  { key: "ordenes", label: "Mis Órdenes" },
  { key: "recetas", label: "Mis Recetas" },
];

function HomePage() {
  const [session, setSession] = useState(() => {
    const storedSession = localStorage.getItem("turnami-session");
    return storedSession ? JSON.parse(storedSession) : null;
  });
  const navigate = useNavigate();

  const [state, setState] = useState("NONE");
  const [tab, setTab] = useState(tabs[0].key);
  const [recetas, setRecetas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectRecipeId, setRejectRecipeId] = useState(null);

  useEffect(() => {
    if (!session) return;

    validateSession(session.role, session.access_token).catch(() => {
      localStorage.removeItem("turnami-session");
      setSession(null);
    });
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const loadImagesRecetas =
      session.role === "patient"
        ? patientImagesRecetas
        : doctorPendingImagesRecetas;
    loadImagesRecetas(session.access_token)
      .then((images) =>
        setRecetas(
          images.map((image) => ({
            paciente: {
              dni: image.dniPaciente,
              nombre:
                image.paciente?.split(" ")[0] || image.paciente || "Paciente",
              apellido: image.paciente?.split(" ").slice(1).join(" ") || "",
            },
            receta: {
              nombre: image.idReceta,
              fecha: formatRecipeDate(image.fechaCarga || image.createdAt),
              estado: image.estado,
            },
            image,
          })),
        ),
      )
      .catch(() => setRecetas([]));

    const loadImagesOrdenes =
      session.role === "patient"
        ? patientImagesOrdenes
        : doctorPendingImagesOrdenes;

    loadImagesOrdenes(session.access_token)
      .then((images) =>
        setOrdenes(
          images.map((image) => ({
            paciente: {
              dni: image.dniPaciente,
              nombre:
                image.paciente?.split(" ")[0] || image.paciente || "Paciente",
              apellido: image.paciente?.split(" ").slice(1).join(" ") || "",
            },
            receta: {
              nombre: image.idReceta,
              fecha: formatRecipeDate(image.fechaCarga || image.createdAt),
              estado: image.estado,
            },
            image,
          })),
        ),
      )
      .catch(() => setOrdenes([]));
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

  const handleUploadImage = async (file) => {
    setState(States.Loading);
    try {
      await patientUploadImage(session.access_token, file);
      setState(States.Ok);
      const images = await patientImagesRecetas(session.access_token);
      setRecetas(
        images.map((image) => ({
          paciente: { nombre: "", apellido: "" },
          receta: {
            nombre: image.idReceta,
            fecha: formatRecipeDate(image.fechaCarga || image.createdAt),
          },
          image,
        })),
      );
      return true;
    } catch (error) {
      setState(States.Error);
      return false;
    }
  };

  const handleViewImage = (image) => {
    if (selectedImage) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  const handleDownload = async (url, filename = "imagen-descargada.jpg") => {
    try {
      // 1. Obtener la información de la imagen
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al descargar la imagen");

      // 2. Convertir la respuesta a un Blob (Binary Large Object)
      const blob = await response.blob();

      // 3. Crear una URL local temporal para ese Blob
      const blobUrl = URL.createObjectURL(blob);

      // 4. Crear un enlace 'a' oculto en el DOM
      const link = document.createElement("a");
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
      setState(States.Error);
    }
  };

  const handleTranscribeRecipe = async (idReceta) => {
    if (!idReceta) return;

    setState(States.Loading);

    try {
      await transcribeRecipe(session.access_token, idReceta);

      setRecetas((prev) =>
        prev.filter((item) => item.image?.idReceta !== idReceta),
      );

      setState({
        type: States.Ok,
        message: "La receta ha sido marcada como transcripta correctamente.",
      });
    } catch (error) {
      setState({
        type: States.Error,
        message:
          "No se pudo marcar la receta como transcripta. Intente nuevamente.",
      });
    }
  };

  const handleOpenRejectModal = (idReceta) => {
    if (idReceta) setRejectRecipeId(idReceta);
  };

  const handleRejectSuccess = (idReceta) => {
    setRecetas((prev) =>
      prev.filter((item) => item.image?.idReceta !== idReceta),
    );

    setState({
      type: States.Ok,
      message: "La receta ha sido rechazada correctamente.",
    });
  };

  const subtitle =
    role == "paciente"
      ? `Visualiza y envia tus recetas y ordenes`
      : `Gestiona y transcrive las recetas y ordenes`;
  return (
    <main className="home-page">
      <Navigation
        title={`Bienvenido/a,  ${fullName}`}
        subtitle={subtitle}
        handleLogout={handleLogout}
      />

      <div>
        <TabView tab={tab} tabs={tabs} setTab={setTab} />
        {tab == "recetas" && (
          <Recetas
            recetas={recetas}
            rol={role}
            handleUploadImage={handleUploadImage}
            handleViewImage={handleViewImage}
            handleDownload={handleDownload}
            handleTranscribeRecipe={handleTranscribeRecipe}
            handleRejectRecipe={handleOpenRejectModal}
            selectedImage={selectedImage}
          />
        )}
        {tab === "ordenes" && (
          <Ordenes
            ordenes={ordenes}
            rol={role}
            handleUploadImage={handleUploadImage}
            handleViewImage={handleViewImage}
            handleDownload={handleDownload}
            handleTranscribeRecipe={handleTranscribeRecipe}
            handleRejectRecipe={handleOpenRejectModal}
            selectedImage={selectedImage}
          />
        )}
      </div>

      <ModalReject
        isOpen={Boolean(rejectRecipeId)}
        recipeId={rejectRecipeId}
        token={session.access_token}
        onClose={() => setRejectRecipeId(null)}
        onSuccess={handleRejectSuccess}
        rejectRecipeApi={rejectRecipe}
      />

      <ModalState state={state} setState={setState} />
    </main>
  );
}

export default HomePage;
