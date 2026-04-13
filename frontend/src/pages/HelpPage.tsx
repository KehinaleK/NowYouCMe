// HelpPage.tsx

import { useState } from "react";

type HelpPageProps = {
  onClose: () => void; // fonction pour fermer le help
};

export default function HelpPage({ onClose }: HelpPageProps) {
  // pour gérer les étapes
  const [step, setStep] = useState(0);

  // contenu des étapes 
const steps = [
  {
    title: "Step 1",
    text: "Sélectionnez une vidéo pour commencer.",
    image: "/images/step1.png",
  },
  {
    title: "Step 2",
    text: "Ajoutez le fichier de données ",
    image: "/images/step2.png",
  },
  {
    title: "Step 3",
    text: "Cliquez sur le bouton Upload pour lancer la démonstration",
    image: "/images/step3.png",
  },
  {
    title: "Step 4",
    text: " Vous accédez à l’interface de visualisation.",
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
    image: "/images/step7.png",
  },
  {
    title: "Coordonnées",
    text: "Les coordonnées du ballon sont affichées ici et se mettent à jour en temps réel.",
    image: "/images/step8.png",
  },
];

  // fonction NEXT
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose(); 
    }
  };

// styles inline 
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
    borderRadius: "16px", // plus arrondi
    width: "420px",
    textAlign: "center" as const,
    position: "relative" as const,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)", // effet pro
  },
  button: {
    marginTop: "20px",
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

      {/* bouton fermer */}
      <button onClick={onClose} style={styles.close}>
        ✖
      </button>

      {/* HEADER STEP */}
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ color: "#888", marginBottom: "15px", fontWeight: "500" }}>
          Step {step + 1} / {steps.length}
        </h3>
      </div>

      {/* CONTENU AVEC SLIDE */}
      <div style={{ overflow: "hidden", width: "100%" }}>
        <div
          style={{
            display: "flex",
            transform: `translateX(-${step * 100}%)`,
            transition: "transform 0.4s ease",
          }}
        >
          {steps.map((s, index) => (
            <div
              key={index}
              style={{
                minWidth: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              {/* IMAGE */}
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

              {/* TEXTE */}
              <h2 style={{ marginBottom: "8px", fontSize: "22px" }}>{s.title}</h2>
              <p style={{ color: "#666", fontSize: "15px" }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BOUTON NEXT */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "25px",
          paddingRight: "20px", // ← espace à droite
          paddingBottom: "10px", // ← espace en bas
        }}
      >
        <button onClick={handleNext} style={styles.button}>
          {step === steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>

    </div>
  </div>
);
}