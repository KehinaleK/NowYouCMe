// HelpPage.tsx

import { useState } from "react";

type HelpPageProps = {
  onClose: () => void;
  initialStep?: number;
  lastStep?: number;
};

const ALL_STEPS = [
  // Home page — steps 1-3
  {
    title: "Fichier vidéo",
    text: "Sélectionnez une vidéo pour commencer.",
    image: "/images/step1.png",
  },
  {
    title: "Fichier de coordonnées",
    text: "Ajoutez le fichier de données (.txt) contenant les positions du ballon.",
    image: "/images/step2.png",
  },
  {
    title: "Lancer l'analyse",
    text: "Cliquez sur le bouton Upload pour lancer la démonstration.",
    image: "/images/step3.png",
  },
  // Work page — steps 4-9
  {
    title: "Interface de visualisation",
    text: "Vous accédez à l'interface de visualisation avec le terrain et la vidéo.",
    image: "/images/step4.png",
  },
  {
    title: "Lecteur vidéo",
    text: "La vidéo importée est affichée ici avec les contrôles de lecture.",
    image: "/images/step5.png",
  },
  {
    title: "Vue du terrain",
    text: "Cette zone représente le terrain. La croix rouge indique la position du ballon issue des données.",
    image: "/images/step6.png",
  },
  {
    title: "Correction manuelle",
    text: "Cliquez sur le terrain pour ajuster manuellement la position du ballon.",
    image: "/images/step6.png",
  },
  {
    title: "Coordonnées",
    text: "Les coordonnées du ballon sont affichées ici et se mettent à jour en temps réel.",
    image: "/images/step7.png",
  },
  {
    title: "Marquer un but",
    text: "Cochez la case « But » pour indiquer que la position de cette trame correspond à un but. Cette information est incluse lors du téléchargement.",
    image: "/images/step8.png",
  },
];

export default function HelpPage({ onClose, initialStep = 0, lastStep = ALL_STEPS.length - 1 }: HelpPageProps) {
  const [step, setStep] = useState(initialStep);

  const displayStep = step - initialStep + 1;
  const totalSteps = lastStep - initialStep + 1;

  const handleNext = () => {
    if (step < lastStep) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > initialStep) setStep(step - 1);
  };

  const styles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    box: {
      background: "white",
      padding: "20px 0 30px 0",
      borderRadius: "16px",
      width: "420px",
      textAlign: "center" as const,
      position: "relative" as const,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
    button: {
      padding: "10px 20px",
      border: "none",
      background: "black",
      color: "white",
      borderRadius: "8px",
      cursor: "pointer",
    },
    close: {
      position: "absolute" as const,
      top: "10px",
      right: "10px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
    },
  };


  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <button onClick={onClose} style={styles.close}>✖</button>

        <div style={{ marginBottom: "10px" }}>
          <h3 style={{ color: "#888", marginBottom: "15px", fontWeight: "500" }}>
            {displayStep} / {totalSteps}
          </h3>
        </div>

        <div style={{ overflow: "hidden", width: "100%" }}>
          <div
            style={{
              display: "flex",
              transform: `translateX(-${step * 100}%)`,
              transition: "transform 0.4s ease",
            }}
          >
            {ALL_STEPS.map((s, index) => (
              <div
                key={index}
                style={{ minWidth: "100%", padding: "10px", boxSizing: "border-box" }}
              >
                <img
                  src={s.image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "260px",
                    objectFit: "contain",
                    borderRadius: "0",
                    marginBottom: "15px",
                  }}
                />
                <h2 style={{ marginBottom: "8px", fontSize: "22px" }}>{s.title}</h2>
                <p style={{ color: "#666", fontSize: "15px" }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "25px",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "10px",
          }}
        >
          <button
            onClick={handlePrev}
            style={{ ...styles.button, background: step === 0 ? "#ccc" : "black" }}
            disabled={step === initialStep}
          >
            Prev
          </button>
          <button onClick={handleNext} style={styles.button}>
            {step === ALL_STEPS.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
